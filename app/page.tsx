// Placeholder root route.
//
// "/" is currently redirected to https://kibadvisors.com by next.config.js
// (ported from the old vercel.json), so this component isn't reachable in
// production yet. It exists so the Next.js build has a valid root page while
// Phase 1 (static-page migration scaffold) lands.
//
// Phase 2: replace this with the real homepage (see index.html at the repo
// root for the current design draft — Fundwell-inspired hero, solutions
// bento grid, WebGL gradient CTA — to be ported in as the first real route,
// including the Hero 6 block once React Bits Pro is configured).
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper text-ink">
      <p className="font-mono text-xs uppercase tracking-widest text-slate">
        Next.js migration — Phase 1 scaffold
      </p>
    </main>
  );
}
