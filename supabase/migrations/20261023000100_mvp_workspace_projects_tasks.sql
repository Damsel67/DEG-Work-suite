-- DEG WorkSuite MVP: private workspaces, projects, and tasks.
-- Apply only after review in the intended Supabase project.
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 240),
  is_completed boolean not null default false,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists workspace_members_user_idx on public.workspace_members(user_id);
create index if not exists projects_workspace_created_idx on public.projects(workspace_id, created_at desc);
create index if not exists tasks_project_created_idx on public.tasks(project_id, created_at desc);

alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- This narrowly scoped helper avoids recursive membership-table policies.
create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members wm
    where wm.workspace_id = target_workspace_id and wm.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_workspace_member(uuid) from public;
grant execute on function public.is_workspace_member(uuid) to authenticated;

create policy "Members can view their workspaces" on public.workspaces
  for select to authenticated using (public.is_workspace_member(id));
create policy "Users can view their own memberships" on public.workspace_members
  for select to authenticated using (user_id = (select auth.uid()));

create policy "Members can view workspace projects" on public.projects
  for select to authenticated using (public.is_workspace_member(workspace_id));
create policy "Members can create workspace projects" on public.projects
  for insert to authenticated with check (public.is_workspace_member(workspace_id) and created_by = (select auth.uid()));

create policy "Members can view project tasks" on public.tasks
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  );
create policy "Members can create project tasks" on public.tasks
  for insert to authenticated with check (
    created_by = (select auth.uid()) and exists (
      select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id)
    )
  );
create policy "Members can complete project tasks" on public.tasks
  for update to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id))
  ) with check (
    created_by = (select auth.uid()) and exists (
      select 1 from public.projects p where p.id = project_id and public.is_workspace_member(p.workspace_id)
    )
  );

grant select on public.workspaces, public.workspace_members, public.projects, public.tasks to authenticated;
grant insert on public.projects, public.tasks to authenticated;
grant update (is_completed, completed_at) on public.tasks to authenticated;

create or replace function public.create_workspace(workspace_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_workspace_id uuid;
  current_user_id uuid := auth.uid();
  clean_name text := trim(workspace_name);
begin
  if current_user_id is null then
    raise exception 'You must be signed in to create a workspace';
  end if;
  if clean_name is null or char_length(clean_name) not between 1 and 100 then
    raise exception 'Workspace name must be between 1 and 100 characters';
  end if;

  insert into public.workspaces (name) values (clean_name) returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, current_user_id, 'owner');
  return new_workspace_id;
end;
$$;
revoke all on function public.create_workspace(text) from public;
grant execute on function public.create_workspace(text) to authenticated;

