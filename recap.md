# Recap log

A running log of major changes made to this project. Newest entries first.

---

## 2026-10-08 — Interactive Sanity guide at `/guide`

**Status:** Done, not yet committed. Seed content is published in the `production` dataset (12 lessons + guide overview).

**Verified:**

- Type-check, lint and Prettier pass; studio and frontend production builds succeed.
- All 12 lesson pages and `/guide` return 200 from a production build; unknown slugs return 404; lessons appear in `sitemap.xml`.
- All 13 seeded documents pass `sanity documents validate`; every GROQ query in the lessons was parsed and run against the dataset.
- In Chrome on the dev server: a playground query ran, "Check my work" failed correctly with its hint, "Mark as complete" updated the sidebar, progress bar and overview, and there were no console or hydration errors.

**Not verified:** Presentation / Visual Editing on the guide pages, the mobile layout, and a "Check my work" that passes.

### What was built

- **Content model (studio):** `lesson` document, `guide` singleton (fixed ID `guide`, ordered lesson references), and the `lessonContent` Portable Text type with custom blocks: `code` (via `@sanity/code-input`), `callout`, `groqPlayground`, and images. `challenge` is an object type with an optional GROQ verification query.
- **Studio:** a "Guide" section in the structure; singletons (`settings`, `guide`) hidden from "Create new" and limited to publish/discard/restore; Presentation routes and locations for `/guide` and `/guide/:slug`.
- **Frontend:** `/guide` overview and `/guide/[slug]` lesson pages (with `generateStaticParams`, metadata with `stega: false`, `notFound`). The lesson layout has a sticky sidebar. Code is highlighted server-side with Shiki and has a copy button. GROQ playgrounds and challenge checks run in the browser through a token-less client (`sanity/lib/browser-client.ts`). Progress is stored in localStorage via `useSyncExternalStore`.
- **Site:** "Guide" link in the header, a call to action on the home page, and lessons in the sitemap.
- **Seed:** `npm run seed:guide` (with `-- --force` to overwrite). It runs `studio/scripts/seed-guide/` with your CLI login, matches lessons by slug, lets Sanity generate lesson IDs, and only appends missing lessons to the guide.

### Bugs found and fixed along the way

1. **`Cta.tsx` (existing template bug):** `theme === 'dark'` lacked `stegaClean()`, so dark CTAs rendered light in Presentation.
2. **`sitemapData` query (existing):** operator precedence meant `defined(slug.current)` only applied to posts. Now uses `_type in [...]`.
3. **Guide query:** `lessons[]->[defined(slug.current)]` returns all nulls (the filter runs per item). Fixed to `lessons[defined(@->slug.current)]->`. TypeGen didn't catch it. This is now a callout in the GROQ lesson.
4. **Seed `--force`:** `patch().unset().set()` wiped the challenges, because Sanity applies `unset` after `set` within one patch. Now uses `createOrReplace` with the looked-up ID.
5. **Sticky sidebar:** the sticky element's parent was only as tall as the sidebar. The grid `<aside>` is now sticky.

### Things to know

- Playgrounds and checks only see **published** content in a **public** dataset (the dataset is public). Your production origin must be in CORS origins.
- Shiki has no GROQ grammar, so GROQ snippets render unhighlighted.
- One frontend build crashed once with Windows exit code `0xC0000409`. It did not happen again in later builds.
- New dependencies: `@sanity/code-input` (studio) and `shiki` (frontend).

### Open follow-ups

- [ ] Click through the guide in Presentation to check Visual Editing overlays on lesson pages.
- [ ] Check the mobile layout (collapsible lesson list).
- [ ] Commit the changes.

---

## 2026-10-08 — Upgrade to Sanity 6.18.0

**Status:** Done, not yet committed.

**Verified:**

- Type-check, lint and Prettier pass.
- Frontend and studio production builds both succeed.
- The built frontend runs locally: `/` and `/sitemap.xml` return 200.

**Not verified:** the Studio UI, Presentation and Visual Editing have not been tried in a browser.

**Studio build was already failing before the upgrade.** The installed packages didn't match the lockfile, and `react@19.3.0` was running with `react-dom@19.2.7`, which Sanity refuses to build with.

### Version changes

| Package                                                           | Before                       | After       |
| ----------------------------------------------------------------- | ---------------------------- | ----------- |
| `sanity` (studio + frontend)                                      | 5.31                         | 6.18.0      |
| `@sanity/vision`                                                  | 5.31                         | 6.18.0      |
| `@sanity/client`                                                  | 7.23                         | 8.9.0       |
| `@sanity/icons`                                                   | 3.7                          | 5.2.3       |
| `next-sanity`                                                     | 13.0.8                       | 13.3.4      |
| `@sanity/assist`, unsplash plugin, `sanity-image`, `@sanity/uuid` | older                        | latest      |
| `react` / `react-dom`                                             | 19.3.0 / 19.2.7 (mismatched) | both 19.3.0 |

### Fixes needed to keep everything working

1. **Lockfile rebuilt from scratch.** The old one still pulled in Sanity v5 alongside v6, and the two copies caused type errors. Indirect dependencies moved to newer versions within their allowed ranges.
2. **Icon imports (8 files in `studio/src`).** `@sanity/icons` v5 no longer exports icons from the package root. They now come from per-icon paths, e.g. `import {CogIcon} from '@sanity/icons/Cog'`. The type-check didn't catch this because the old names are typed as `never`; only the studio build did.
3. **`sanity:typegen` scripts.** The new CLI won't overwrite the schema file unless you pass `--force`, so it was added to both scripts.
4. **`frontend/app/components/Posts.tsx`.** Generated query types now mark text that may carry hidden visual-editing (stega) characters. The `Post` prop is typed with `StegaBranded<…>` from `@sanity/client/stega` so it matches what the query actually returns.
5. **`studio/sanity.cli.ts`.** Moved `autoUpdates: true` to `deployment: {autoUpdates: true}`, which clears a deprecation warning.
6. **`frontend/sanity.types.ts`** was regenerated by the new typegen.

### Things to know

- **Node 22.12 or newer is now required** by Sanity 6 and `@sanity/client` 8, both locally and in CI/Vercel.
- **React strict mode is now on by default in Studio dev.** Set `reactStrictMode: false` in `sanity.cli.ts` to turn it off.
- **`@sanity/eslint-config-studio` was not upgraded to v7.** It requires ESLint 10, and the studio has no ESLint setup.
- **`npm audit` reports 36 vulnerabilities in indirect dependencies.** `npm audit fix --force` was not run, because it can make breaking changes of its own.
- **The build warns that no `appId` is set for auto-updates.** This predates the upgrade; fixing it needs a value from the Sanity project settings.

### Open follow-ups

- [ ] Open the Studio and Presentation tool in a browser and check that Visual Editing still works.
- [ ] Confirm the Node version on Vercel/CI is 22.12 or newer.
- [ ] Commit the changes.
- [ ] Optionally add `appId` under `deployment` in `studio/sanity.cli.ts`.

Sources: [Sanity Studio v6 announcement](https://www.sanity.io/blog/sanity-studio-v6), [@sanity/client v8 changelog](https://www.sanity.io/docs/changelog/6c3650a7-8317-458f-bfa6-44c1ca4c9095)
