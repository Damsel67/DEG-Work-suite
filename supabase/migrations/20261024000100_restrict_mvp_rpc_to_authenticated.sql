-- Restrict the security-definer RPCs to authenticated users.
-- The project has default grants to anon that are not removed by revoking PUBLIC.
revoke all on function public.create_workspace(text) from public, anon;
grant execute on function public.create_workspace(text) to authenticated;

revoke all on function public.is_workspace_member(uuid) from public, anon;
grant execute on function public.is_workspace_member(uuid) to authenticated;

