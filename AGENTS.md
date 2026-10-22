<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Marketing pages (`/`, `/modules`, `/trust`) wrap content in `SiteShell`; the clickable prototype lives under `/app` with `src/routes/app.tsx` as its sidebar layout — keeps public site and product shell separate.
- Prototype data comes only from `src/lib/sample-data.ts` and module metadata from `src/lib/modules.ts` — one source to swap for real backend data later.
- Brand expressions are CSS scopes: default tokens = core workspace, `.moments` class = DEG Moments; never hardcode palette colours in components — keeps light/dark and both expressions consistent.
- Theme is class-based (`.dark` on `<html>`) set by `src/lib/theme.tsx` plus an inline pre-paint script — avoids a flash of the wrong theme.
- Money is stored in minor units (kobo) and formatted at display time — avoids rounding errors.
