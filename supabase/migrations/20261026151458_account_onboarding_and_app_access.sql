-- Account onboarding, organization membership and app access.

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 160),
  account_type text not null check (account_type in ('freelancer', 'company', 'school')),
  country text,
  industry text,
  company_size text,
  website text,
  company_domain text,
  institution_type text,
  source_workspace_id uuid unique references public.workspaces(id) on delete set null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(trim(full_name)) between 1 and 160),
  login_email text,
  country text,
  primary_organization_id uuid references public.organizations(id) on delete set null,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'administrator', 'manager', 'employee')),
  employee_id text,
  department text,
  job_title text,
  employment_status text not null default 'active' check (employment_status in ('active', 'invited', 'suspended', 'departed')),
  invited_by uuid references auth.users(id) on delete set null,
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id),
  unique (organization_id, employee_id)
);

create table if not exists public.organization_apps (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_key text not null check (app_key in ('huddle', 'orbit', 'people')),
  enabled boolean not null default true,
  enabled_by uuid not null references auth.users(id) on delete restrict,
  enabled_at timestamptz not null default now(),
  primary key (organization_id, app_key)
);

create table if not exists public.organization_member_apps (
  organization_id uuid not null,
  user_id uuid not null,
  app_key text not null check (app_key in ('huddle', 'orbit', 'people')),
  enabled boolean not null default true,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  assigned_at timestamptz not null default now(),
  primary key (organization_id, user_id, app_key),
  foreign key (organization_id, user_id)
    references public.organization_members(organization_id, user_id) on delete cascade,
  foreign key (organization_id, app_key)
    references public.organization_apps(organization_id, app_key) on delete cascade
);

create table if not exists public.onboarding_drafts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  draft jsonb not null check (jsonb_typeof(draft) = 'object'),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_employee_counters (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  last_employee_number bigint not null default 0 check (last_employee_number >= 0)
);

create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null check (char_length(trim(email)) between 3 and 320),
  full_name text not null check (char_length(trim(full_name)) between 1 and 160),
  department text,
  job_title text,
  role text not null check (role in ('manager', 'employee')),
  app_keys text[] not null check (cardinality(app_keys) > 0),
  invitation_code uuid not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked', 'expired')),
  expires_at timestamptz not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  accepted_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  revoked_at timestamptz
);

create unique index if not exists organization_invitations_one_pending_email_idx
  on public.organization_invitations (organization_id, lower(email)) where status = 'pending';
create index if not exists organization_invitations_org_created_idx
  on public.organization_invitations (organization_id, created_at desc);

create table if not exists public.organization_audit_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  subject_user_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb check (jsonb_typeof(details) = 'object'),
  created_at timestamptz not null default now()
);

create or replace function public.assign_deg_employee_id()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  org_name text;
  org_prefix text;
  next_employee_number bigint;
begin
  if new.role not in ('employee', 'manager') or new.employee_id is not null then return new; end if;
  select name into org_name from public.organizations where id = new.organization_id;
  org_prefix := left(regexp_replace(upper(coalesce(org_name, 'DEG')), '[^A-Z0-9]', '', 'g'), 4);
  if org_prefix = '' then org_prefix := 'DEG'; end if;
  insert into public.organization_employee_counters (organization_id, last_employee_number)
    values (new.organization_id, 1)
    on conflict (organization_id) do update
      set last_employee_number = public.organization_employee_counters.last_employee_number + 1
    returning last_employee_number into next_employee_number;
  new.employee_id := org_prefix || '-' || lpad(next_employee_number::text, 4, '0');
  return new;
end;
$$;
revoke all on function public.assign_deg_employee_id() from public, anon, authenticated;
drop trigger if exists organization_members_assign_employee_id on public.organization_members;
create trigger organization_members_assign_employee_id
  before insert on public.organization_members
  for each row execute function public.assign_deg_employee_id();

create or replace function public.sync_deg_profile_from_auth()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.user_profiles (user_id, full_name, login_email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(coalesce(new.email, ''), '@', 1), 'DEG User'),
    new.email
  )
  on conflict (user_id) do update set login_email = excluded.login_email, updated_at = now();
  return new;
end;
$$;
revoke all on function public.sync_deg_profile_from_auth() from public, anon, authenticated;
drop trigger if exists deg_user_profile_auth_sync on auth.users;
create trigger deg_user_profile_auth_sync
  after insert or update of email on auth.users
  for each row execute function public.sync_deg_profile_from_auth();

alter table public.workspaces
  add column if not exists organization_id uuid unique
    references public.organizations(id) on delete set null;

create index if not exists organization_members_user_idx
  on public.organization_members(user_id, joined_at);
create index if not exists organization_apps_org_idx
  on public.organization_apps(organization_id, app_key) where enabled;

-- Preserve existing workspaces by attaching each to a personal organization and
-- granting its existing owner the already-present Huddle and Orbit experience.
insert into public.organizations (name, account_type, source_workspace_id, created_by)
select w.name, 'freelancer', w.id, wm.user_id
from public.workspaces w
join lateral (
  select m.user_id
  from public.workspace_members m
  where m.workspace_id = w.id
  order by (m.role = 'owner') desc, m.created_at
  limit 1
) wm on true
where not exists (
  select 1 from public.organizations o where o.source_workspace_id = w.id
);

update public.workspaces w
set organization_id = o.id
from public.organizations o
where o.source_workspace_id = w.id and w.organization_id is null;

insert into public.organization_members (organization_id, user_id, role)
select o.id, wm.user_id, case when wm.role = 'owner' then 'owner' else 'employee' end
from public.workspaces w
join public.organizations o on o.id = w.organization_id
join public.workspace_members wm on wm.workspace_id = w.id
on conflict (organization_id, user_id) do nothing;

insert into public.organization_apps (organization_id, app_key, enabled, enabled_by)
select distinct o.id, apps.app_key, true, o.created_by
from public.workspaces w
join public.organizations o on o.id = w.organization_id
cross join (values ('huddle'), ('orbit')) as apps(app_key)
on conflict (organization_id, app_key) do nothing;

insert into public.organization_member_apps (organization_id, user_id, app_key, enabled, assigned_by)
select distinct om.organization_id, om.user_id, oa.app_key, true, o.created_by
from public.organization_members om
join public.organization_apps oa on oa.organization_id = om.organization_id and oa.enabled
join public.organizations o on o.id = om.organization_id
on conflict (organization_id, user_id, app_key) do nothing;

insert into public.user_profiles (user_id, full_name, primary_organization_id, onboarding_completed_at)
select u.id,
       coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1), 'DEG User'),
       orgs.organization_id,
       now()
from auth.users u
join lateral (
  select om.organization_id from public.organization_members om
  where om.user_id = u.id order by om.joined_at limit 1
) orgs on true
on conflict (user_id) do nothing;

update public.user_profiles up
set login_email = u.email
from auth.users u
where u.id = up.user_id and up.login_email is distinct from u.email;

alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_apps enable row level security;
alter table public.organization_member_apps enable row level security;
alter table public.onboarding_drafts enable row level security;
alter table public.organization_employee_counters enable row level security;
alter table public.organization_invitations enable row level security;
alter table public.organization_audit_log enable row level security;
revoke all on public.organization_employee_counters from public, anon, authenticated;
revoke all on public.organization_invitations, public.organization_audit_log, public.onboarding_drafts
  from public, anon, authenticated;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = target_organization_id and om.user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_organization_member(uuid) from public, anon;
grant execute on function public.is_organization_member(uuid) to authenticated;

create or replace function public.is_organization_admin(target_organization_id uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members om
    where om.organization_id = target_organization_id
      and om.user_id = (select auth.uid())
      and om.role in ('owner', 'administrator')
  );
$$;
revoke all on function public.is_organization_admin(uuid) from public, anon;
grant execute on function public.is_organization_admin(uuid) to authenticated;

create or replace function public.has_workspace_app(target_workspace_id uuid, target_app_key text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.workspaces w
    join public.organization_apps oa on oa.organization_id = w.organization_id
    join public.organization_members om on om.organization_id = w.organization_id
    where w.id = target_workspace_id
      and om.user_id = (select auth.uid())
      and oa.app_key = target_app_key
      and oa.enabled
      and coalesce((
        select oma.enabled from public.organization_member_apps oma
        where oma.organization_id = w.organization_id
          and oma.user_id = (select auth.uid())
          and oma.app_key = target_app_key
      ), true)
  );
$$;
revoke all on function public.has_workspace_app(uuid, text) from public, anon;
grant execute on function public.has_workspace_app(uuid, text) to authenticated;

create or replace function public.create_deg_invitation(
  invite_organization_id uuid,
  invite_email text,
  invite_full_name text,
  invite_department text default null,
  invite_job_title text default null,
  invite_role text default 'employee',
  invite_app_keys text[] default array['huddle', 'orbit']::text[]
)
returns table (invitation_id uuid, invitation_code uuid, expires_at timestamptz)
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  clean_email text := lower(trim(invite_email));
  clean_name text := trim(invite_full_name);
  existing_invitation public.organization_invitations%rowtype;
  new_invitation_id uuid;
  new_invitation_code uuid := gen_random_uuid();
  new_expiry timestamptz := now() + interval '7 days';
begin
  if current_user_id is null then raise exception 'Sign in is required to invite a coworker'; end if;
  if not public.is_organization_admin(invite_organization_id) then raise exception 'Only organisation owners and administrators can invite members'; end if;
  if clean_email is null or char_length(clean_email) > 320 or clean_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then raise exception 'Enter a valid email address'; end if;
  if clean_name is null or char_length(clean_name) not between 1 and 160 then raise exception 'Full name must be between 1 and 160 characters'; end if;
  if invite_role is null or invite_role not in ('manager', 'employee') then raise exception 'Choose a valid employee role'; end if;
  if invite_department is not null and char_length(trim(invite_department)) > 120 then raise exception 'Department must be at most 120 characters'; end if;
  if invite_job_title is not null and char_length(trim(invite_job_title)) > 120 then raise exception 'Job title must be at most 120 characters'; end if;
  if invite_app_keys is null or cardinality(invite_app_keys) = 0 then raise exception 'Select at least one application'; end if;
  if cardinality(invite_app_keys) <> (select count(distinct selected.app) from unnest(invite_app_keys) selected(app)) then raise exception 'Each application may be selected only once'; end if;
  if exists (select 1 from unnest(invite_app_keys) selected(app) where selected.app not in ('huddle', 'orbit', 'people')) then raise exception 'One or more selected applications are not available'; end if;
  if exists (
    select 1 from unnest(invite_app_keys) selected(app)
    where not exists (
      select 1 from public.organization_apps oa
      where oa.organization_id = invite_organization_id and oa.app_key = selected.app and oa.enabled
    )
  ) then raise exception 'Enable each selected application for the organisation before assigning it'; end if;

  perform pg_advisory_xact_lock(hashtextextended(invite_organization_id::text || ':' || clean_email, 0));
  update public.organization_invitations i set status = 'expired'
  where i.organization_id = invite_organization_id and lower(i.email) = clean_email
    and i.status = 'pending' and i.expires_at <= now();
  select i.* into existing_invitation from public.organization_invitations i
  where i.organization_id = invite_organization_id and lower(i.email) = clean_email
    and i.status = 'pending' and i.expires_at > now()
  for update;
  if found then
    if existing_invitation.full_name is distinct from clean_name
      or existing_invitation.department is distinct from nullif(trim(invite_department), '')
      or existing_invitation.job_title is distinct from nullif(trim(invite_job_title), '')
      or existing_invitation.role is distinct from invite_role
      or existing_invitation.app_keys is distinct from invite_app_keys then
      raise exception 'A pending invitation already exists for this email with different settings. Revoke it before changing the invitation';
    end if;
    return query select existing_invitation.id, existing_invitation.invitation_code, existing_invitation.expires_at;
    return;
  end if;

  insert into public.organization_invitations (
    organization_id, email, full_name, department, job_title, role, app_keys,
    invitation_code, expires_at, created_by
  ) values (
    invite_organization_id, clean_email, clean_name, nullif(trim(invite_department), ''),
    nullif(trim(invite_job_title), ''), invite_role, invite_app_keys,
    new_invitation_code, new_expiry, current_user_id
  ) returning id into new_invitation_id;
  insert into public.organization_audit_log (organization_id, actor_id, action, details)
  values (invite_organization_id, current_user_id, 'employee_invited',
    jsonb_build_object('invitation_id', new_invitation_id, 'role', invite_role, 'applications', invite_app_keys));
  return query select new_invitation_id, new_invitation_code, new_expiry;
end;
$$;
revoke all on function public.create_deg_invitation(uuid, text, text, text, text, text, text[]) from public, anon;
grant execute on function public.create_deg_invitation(uuid, text, text, text, text, text, text[]) to authenticated;

create or replace function public.accept_deg_invitation(invite_code uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  current_email text;
  verified_at timestamptz;
  invite public.organization_invitations%rowtype;
  target_workspace_id uuid;
begin
  if current_user_id is null then raise exception 'Sign in with the invited email address to continue'; end if;
  select lower(u.email), u.email_confirmed_at into current_email, verified_at
    from auth.users u where u.id = current_user_id;
  if verified_at is null then raise exception 'Confirm your email address before accepting this invitation'; end if;

  select i.* into invite from public.organization_invitations i
  where i.invitation_code = invite_code
  for update;
  if not found then raise exception 'This invitation code is invalid'; end if;
  if invite.status = 'accepted' and invite.accepted_by = current_user_id then
    select w.id into target_workspace_id from public.workspaces w where w.organization_id = invite.organization_id;
    return target_workspace_id;
  end if;
  if invite.status <> 'pending' then raise exception 'This invitation is no longer active'; end if;
  if invite.expires_at <= now() then
    update public.organization_invitations set status = 'expired' where id = invite.id;
    raise exception 'This invitation has expired. Ask an administrator to issue another one';
  end if;
  if current_email is null or current_email <> lower(invite.email) then
    raise exception 'Sign in with the email address this invitation was sent to';
  end if;
  if exists (
    select 1 from unnest(invite.app_keys) selected(app)
    where not exists (
      select 1 from public.organization_apps oa
      where oa.organization_id = invite.organization_id and oa.app_key = selected.app and oa.enabled
    )
  ) then raise exception 'One or more applications in this invitation are no longer enabled'; end if;
  select w.id into target_workspace_id from public.workspaces w where w.organization_id = invite.organization_id;
  if target_workspace_id is null then raise exception 'The invited organisation does not have an active workspace'; end if;

  insert into public.organization_members (
    organization_id, user_id, role, department, job_title, invited_by
  ) values (
    invite.organization_id, current_user_id, invite.role, invite.department, invite.job_title, invite.created_by
  ) on conflict (organization_id, user_id) do nothing;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (target_workspace_id, current_user_id, 'member')
    on conflict (workspace_id, user_id) do nothing;
  insert into public.organization_member_apps (organization_id, user_id, app_key, enabled, assigned_by)
  select invite.organization_id, current_user_id, selected.app, true, invite.created_by
  from unnest(invite.app_keys) selected(app)
  on conflict (organization_id, user_id, app_key) do update set enabled = true;
  insert into public.user_profiles as profile (user_id, full_name, login_email, primary_organization_id)
    values (current_user_id, invite.full_name, current_email, invite.organization_id)
    on conflict (user_id) do update set
      primary_organization_id = coalesce(profile.primary_organization_id, excluded.primary_organization_id),
      updated_at = now();
  update public.organization_invitations set status = 'accepted', accepted_by = current_user_id, accepted_at = now()
    where id = invite.id;
  insert into public.organization_audit_log (organization_id, actor_id, action, subject_user_id, details)
    values (invite.organization_id, current_user_id, 'invitation_accepted', current_user_id,
      jsonb_build_object('invitation_id', invite.id));
  delete from public.onboarding_drafts where user_id = current_user_id;
  return target_workspace_id;
end;
$$;
revoke all on function public.accept_deg_invitation(uuid) from public, anon;
grant execute on function public.accept_deg_invitation(uuid) to authenticated;

create or replace function public.revoke_deg_invitation(invitation_id uuid)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  invite public.organization_invitations%rowtype;
begin
  if current_user_id is null then raise exception 'Sign in is required'; end if;
  select i.* into invite from public.organization_invitations i where i.id = invitation_id for update;
  if not found or not public.is_organization_admin(invite.organization_id) then raise exception 'Invitation not found or you do not have permission to revoke it'; end if;
  if invite.status <> 'pending' then raise exception 'Only pending invitations can be revoked'; end if;
  update public.organization_invitations set status = 'revoked', revoked_at = now() where id = invite.id;
  insert into public.organization_audit_log (organization_id, actor_id, action, details)
    values (invite.organization_id, current_user_id, 'invitation_revoked', jsonb_build_object('invitation_id', invite.id));
end;
$$;
revoke all on function public.revoke_deg_invitation(uuid) from public, anon;
grant execute on function public.revoke_deg_invitation(uuid) to authenticated;

create policy "Organization members can view their organizations" on public.organizations
  for select to authenticated using (public.is_organization_member(id));
create policy "Users can view their own DEG profile" on public.user_profiles
  for select to authenticated using (
    user_id = (select auth.uid()) or exists (
      select 1 from public.organization_members coworker
      where coworker.user_id = user_profiles.user_id
        and public.is_organization_member(coworker.organization_id)
    )
  );
create policy "Organization members can view their coworkers" on public.organization_members
  for select to authenticated using (public.is_organization_member(organization_id));
create policy "Members can view organization apps" on public.organization_apps
  for select to authenticated using (public.is_organization_member(organization_id));
create policy "Users can view their assigned app access" on public.organization_member_apps
  for select to authenticated using (user_id = (select auth.uid()));
create policy "Administrators can view organization invitations" on public.organization_invitations
  for select to authenticated using (public.is_organization_admin(organization_id));
create policy "Administrators can view organization audit records" on public.organization_audit_log
  for select to authenticated using (public.is_organization_admin(organization_id));
create policy "Users can manage their own onboarding draft" on public.onboarding_drafts
  for all to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant select on public.organizations, public.user_profiles, public.organization_members,
  public.organization_apps, public.organization_member_apps, public.organization_invitations,
  public.organization_audit_log to authenticated;
grant select, insert, update, delete on public.onboarding_drafts to authenticated;
grant select on public.organization_invitations, public.organization_audit_log to authenticated;

-- The old RPC creates workspaces without an organisation or app entitlements.
-- New onboarding must go through the validated, idempotent RPC below.
revoke all on function public.create_workspace(text) from public, anon, authenticated;

-- Replace broad membership checks with the same workspace boundary plus the
-- Orbit entitlement. Existing workspaces were backfilled above before policies change.
drop policy if exists "Members can view workspace projects" on public.projects;
drop policy if exists "Members can create workspace projects" on public.projects;
drop policy if exists "Members can view project tasks" on public.tasks;
drop policy if exists "Members can create project tasks" on public.tasks;
drop policy if exists "Members can complete project tasks" on public.tasks;

create policy "Orbit members can view workspace projects" on public.projects
  for select to authenticated
  using (public.is_workspace_member(workspace_id) and public.has_workspace_app(workspace_id, 'orbit'));
create policy "Orbit members can create workspace projects" on public.projects
  for insert to authenticated
  with check (public.is_workspace_member(workspace_id) and public.has_workspace_app(workspace_id, 'orbit') and created_by = (select auth.uid()));
create policy "Orbit members can view project tasks" on public.tasks
  for select to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id
      and public.is_workspace_member(p.workspace_id) and public.has_workspace_app(p.workspace_id, 'orbit'))
  );
create policy "Orbit members can create project tasks" on public.tasks
  for insert to authenticated with check (
    created_by = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id
      and public.is_workspace_member(p.workspace_id) and public.has_workspace_app(p.workspace_id, 'orbit'))
  );
create policy "Orbit members can complete project tasks" on public.tasks
  for update to authenticated using (
    exists (select 1 from public.projects p where p.id = project_id
      and public.is_workspace_member(p.workspace_id) and public.has_workspace_app(p.workspace_id, 'orbit'))
  ) with check (
    created_by = (select auth.uid()) and exists (select 1 from public.projects p where p.id = project_id
      and public.is_workspace_member(p.workspace_id) and public.has_workspace_app(p.workspace_id, 'orbit'))
  );

create or replace function public.complete_deg_onboarding(
  account_type text,
  full_name text,
  country text,
  workspace_name text,
  organization_name text,
  industry text default null,
  company_size text default null,
  website text default null,
  company_domain text default null,
  institution_type text default null,
  enabled_apps text[] default array['huddle', 'orbit']::text[]
)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  clean_name text := trim(full_name);
  clean_workspace text := trim(workspace_name);
  clean_org text := coalesce(nullif(trim(organization_name), ''), clean_workspace);
  new_org_id uuid;
  new_workspace_id uuid;
  app_key text;
begin
  if current_user_id is null then raise exception 'Sign in is required to finish setup'; end if;
  if account_type is null or account_type not in ('freelancer', 'company', 'school') then raise exception 'Choose a valid account type'; end if;
  if clean_name is null or char_length(clean_name) not between 1 and 160 then raise exception 'Full name must be between 1 and 160 characters'; end if;
  if country is null or char_length(trim(country)) not between 1 and 100 then raise exception 'Choose your country'; end if;
  if clean_workspace is null or char_length(clean_workspace) not between 1 and 100 then raise exception 'Workspace name must be between 1 and 100 characters'; end if;
  if account_type <> 'freelancer' and char_length(clean_org) not between 1 and 160 then raise exception 'Organization name must be between 1 and 160 characters'; end if;
  if account_type <> 'freelancer' and nullif(trim(organization_name), '') is null then raise exception 'Organization name is required'; end if;
  if account_type = 'company' and (nullif(trim(industry), '') is null or company_size is null or company_size not in ('1', '2-10', '11-50', '51-200', '201+')) then raise exception 'Choose a valid company industry and size'; end if;
  if account_type = 'company' and char_length(trim(industry)) > 120 then raise exception 'Industry must be at most 120 characters'; end if;
  if account_type = 'school' and (institution_type is null or institution_type not in ('primary', 'secondary', 'higher-education', 'training', 'other')) then raise exception 'Choose a valid institution type'; end if;
  if coalesce(char_length(website), 0) > 300 or coalesce(char_length(company_domain), 0) > 255 then raise exception 'Website or company domain is too long'; end if;
  if nullif(trim(website), '') is not null and trim(website) !~* '^https?://[^[:space:]]+$' then raise exception 'Enter a valid website URL beginning with http:// or https://'; end if;
  if nullif(trim(company_domain), '') is not null and lower(trim(company_domain)) !~ '^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$' then raise exception 'Enter a valid company domain'; end if;
  if enabled_apps is null or cardinality(enabled_apps) = 0 then raise exception 'Select at least one application'; end if;
  if cardinality(enabled_apps) <> (select count(distinct selected.app) from unnest(enabled_apps) selected(app)) then raise exception 'Each application may be selected only once'; end if;
  if account_type = 'freelancer' and 'people' = any(enabled_apps) then raise exception 'People is available for company and school workspaces'; end if;
  if exists (select 1 from unnest(enabled_apps) selected(app) where selected.app not in ('huddle', 'orbit', 'people')) then
    raise exception 'One or more selected applications are not available yet';
  end if;

  -- Serialise same-user retries so parallel submits cannot create duplicate organisations.
  perform pg_advisory_xact_lock(hashtextextended(current_user_id::text, 0));

  select o.id, w.id into new_org_id, new_workspace_id
  from public.user_profiles up
  join public.organizations o on o.id = up.primary_organization_id
  join public.workspaces w on w.organization_id = o.id
  where up.user_id = current_user_id;
  if new_workspace_id is not null then return new_workspace_id; end if;

  if exists (select 1 from public.workspace_members wm where wm.user_id = current_user_id) then
    raise exception 'An existing workspace is already linked to this account; contact an administrator to change its organization setup';
  end if;

  insert into public.organizations (name, account_type, country, industry, company_size, website, company_domain, institution_type, created_by)
  values (
    clean_org, account_type, trim(country), nullif(trim(industry), ''), nullif(trim(company_size), ''),
    nullif(trim(website), ''), nullif(lower(trim(company_domain)), ''), nullif(trim(institution_type), ''), current_user_id
  ) returning id into new_org_id;
  insert into public.organization_members (organization_id, user_id, role)
    values (new_org_id, current_user_id, 'owner');
  insert into public.workspaces (name, organization_id) values (clean_workspace, new_org_id)
    returning id into new_workspace_id;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (new_workspace_id, current_user_id, 'owner');
  foreach app_key in array enabled_apps loop
    insert into public.organization_apps (organization_id, app_key, enabled, enabled_by)
      values (new_org_id, app_key, true, current_user_id);
    insert into public.organization_member_apps (organization_id, user_id, app_key, enabled, assigned_by)
      values (new_org_id, current_user_id, app_key, true, current_user_id);
  end loop;
  insert into public.user_profiles as profile (user_id, full_name, country, primary_organization_id, onboarding_completed_at)
    values (current_user_id, clean_name, trim(country), new_org_id, now())
    on conflict (user_id) do update set
      full_name = excluded.full_name,
      country = excluded.country,
      primary_organization_id = excluded.primary_organization_id,
      onboarding_completed_at = coalesce(profile.onboarding_completed_at, excluded.onboarding_completed_at),
      updated_at = now();
  delete from public.onboarding_drafts where user_id = current_user_id;
  return new_workspace_id;
end;
$$;
revoke all on function public.complete_deg_onboarding(text, text, text, text, text, text, text, text, text, text, text[]) from public, anon;
grant execute on function public.complete_deg_onboarding(text, text, text, text, text, text, text, text, text, text, text[]) to authenticated;
