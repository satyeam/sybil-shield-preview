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

## Application architecture
- Use TanStack Start file routes for the four public pages and a shared SiteShell around Outlet; this preserves the platform runtime and independently shareable pages.
- Keep waitlist emails server-only behind validated createServerFn inserts with no public table access; this prevents disclosure of email addresses and membership.
- Keep the developer verification sandbox entirely local and explicitly simulated; the product API is still in development.
- Register the PWA service worker only in production and never cache API, auth, or server-function traffic; offline support must not replay sensitive actions.

- Keep alpha reviews in authenticated server functions with server-validated administrator roles and matching RLS; signing in alone never grants waitlist access.
- Auto-create minimal editable profiles on signup, with owner-only policies; roles remain in a separate protected table.
