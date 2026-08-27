// Placeholder root route.
//
// "/" is currently redirected to https://kibadvisors.com by next.config.js
// (ported from the old vercel.json), so this component isn't reachable in
// production yet. It exists so the Next.js build has a valid root page while
// Phase 1 (static-page migration scaffold) lands.
//
// Phase 2: replace this with the real homepage. The redesign is already being
// built as a real route at app/v3/ (the React port of public/legacy/v2.html —
// Fundwell-inspired hero, solutions bento grid, WebGL gradient CTA). Once /v3
// is component-complete and approved it gets promoted here, and the root
// redirect above is revisited. See CLAUDE.md → "Homepage redesign".
export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper text-ink">
      <p className="font-mono text-xs uppercase tracking-widest text-slate">
        Next.js migration — Phase 1 scaffold
      </p>
    </main>
  );
}
