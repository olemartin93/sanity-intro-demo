import {bullets, callout, code, h2, h3, p, playground, steps} from './portableText'

/**
 * The English starter content for the interactive guide at /en/guide. Each lesson becomes a
 * `lesson` document with language "en", and the guide-en singleton lists them in this order.
 * The Norwegian translations live in content.no.ts and use the same slugs.
 *
 * Edit the lessons in the Studio afterwards. Re-running the seed skips lessons that already exist
 * (matched by slug) unless you pass --force.
 */

export const guide = {
  title: 'Learn Sanity by building with it',
  description:
    'A hands-on, step-by-step guide to Sanity and Next.js, using this project as the playground. Model content with schemas, query it with GROQ, render it in Next.js, style it, and deploy it. Every lesson is itself content in your Sanity dataset.',
}

type Challenge = {
  title: string
  instructions: ReturnType<typeof p>[]
  verificationQuery?: string
  hint?: string
}

export type LessonSeed = {
  title: string
  slug: string
  summary: string
  duration: number
  content: unknown[]
  challenge?: Challenge
}

export const lessons: LessonSeed[] = [
  // ---------------------------------------------------------------------------------------------
  {
    title: 'What is Sanity?',
    slug: 'what-is-sanity',
    summary:
      'Meet the Content Lake, the Studio and GROQ, and see how the two apps in this project fit together.',
    duration: 6,
    content: [
      p(
        'Sanity is a platform for **structured content**. Instead of writing pages, you describe your content as data (posts, people, products, lessons) and every channel decides how to present it. This page you are reading is a `lesson` document fetched from Sanity.',
      ),
      h2('The three building blocks'),
      ...bullets(
        '**The Content Lake** is a hosted, real-time database for JSON documents. Your content lives in a dataset (this project uses `production`).',
        '**Sanity Studio** is the editing app. It is an open-source React app that you configure with code, so the editing experience is shaped around your content model.',
        '**APIs** let anything read and write content: GROQ queries, a global CDN, an image pipeline, and real-time listeners.',
      ),
      h2('How this project is organised'),
      p(
        'The repo is a monorepo with two apps that share one content model. Running `npm run dev` from the root starts both.',
      ),
      code(
        'sh',
        `
.
├── studio/      # Sanity Studio (Vite). Schemas, desk structure, plugins. http://localhost:3333
├── frontend/    # Next.js App Router site. Queries, pages, components.  http://localhost:3000
└── sanity.schema.json   # Schema exported from the Studio, used to generate TypeScript types
        `,
        'Project layout',
      ),
      p(
        'Editors work in the Studio. When they publish, the Content Lake stores the change and the Next.js site picks it up through the **Live Content API**, without a rebuild.',
      ),
      h2('Everything is a JSON document'),
      p(
        'Every document has a few system fields that start with an underscore. Relationships are stored as references, which point to another document by its `_id`.',
      ),
      code(
        'json',
        `
{
  "_id": "6f1c2a0e-...",
  "_type": "post",
  "_createdAt": "2026-10-08T09:30:00Z",
  "title": "Hello Sanity",
  "slug": {"_type": "slug", "current": "hello-sanity"},
  "author": {"_type": "reference", "_ref": "b2e4..."}
}
        `,
        'A post document',
      ),
      callout(
        'tip',
        'Model meaning, not appearance',
        'Name fields after what content is (`summary`, `author`, `kind`), not how it looks (`bigText`, `redBox`). The same content can then power a website, an app and an AI agent, and survive a redesign.',
      ),
      playground('Peek into your dataset', `array::unique(*[]._type)`, {
        description:
          'This lists every document type that is published in your dataset. Press "Run query". You will learn the syntax in the GROQ lesson.',
      }),
    ],
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Run the project and tour the Studio',
    slug: 'run-the-project',
    summary:
      'Set up environment variables, start both apps, and find your way around the Structure, Presentation and Vision tools.',
    duration: 10,
    content: [
      h2('1. Install and configure'),
      p(
        'You need Node.js 22.12 or newer. Install dependencies from the project root. npm workspaces install both apps at once.',
      ),
      code('sh', `npm install`),
      p(
        'Each app reads its own environment file. The project ID and dataset tell the apps which Sanity project to talk to. You can find the project ID at [sanity.io/manage](https://www.sanity.io/manage).',
      ),
      code(
        'sh',
        `
SANITY_STUDIO_PROJECT_ID="your-project-id"
SANITY_STUDIO_DATASET="production"
SANITY_STUDIO_PREVIEW_URL="http://localhost:3000"
        `,
        'studio/.env',
      ),
      code(
        'sh',
        `
NEXT_PUBLIC_SANITY_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_STUDIO_URL="http://localhost:3333"
SANITY_API_READ_TOKEN="a Viewer token from sanity.io/manage"
        `,
        'frontend/.env.local',
      ),
      callout(
        'warning',
        'Keep tokens on the server',
        'Only variables prefixed with `NEXT_PUBLIC_` reach the browser. `SANITY_API_READ_TOKEN` can read drafts, so it must never get that prefix. In this project it is only imported from `frontend/sanity/lib/token.ts`, which starts with `import "server-only"`.',
      ),
      h2('2. Start both apps'),
      code('sh', `npm run dev`),
      p(
        'Turborepo starts the Studio on [localhost:3333](http://localhost:3333) and the website on [localhost:3000](http://localhost:3000). Log in to the Studio with the account that owns the project.',
      ),
      p(
        "The website talks to Sanity from the browser too (live updates and this guide's playgrounds), so its origin must be allowed. Run this once from the `studio` folder:",
      ),
      code('sh', `npx sanity cors add http://localhost:3000 --credentials`),
      h2('3. Tour the Studio'),
      ...bullets(
        '**Structure** lists your content. Its layout is code in `studio/src/structure/index.ts`. That is why posts, pages and lessons are grouped by language, and "Site Settings" has one item per language.',
        '**Presentation** shows the website next to the editor. Click any text on the page to edit it. You will set this up in the Visual Editing lesson.',
        '**Vision** is a GROQ playground inside the Studio, for testing queries against your real data, including drafts.',
      ),
    ],
    challenge: {
      title: 'Publish your first document',
      instructions: [
        p(
          'In the Studio, open **People**, create a person with a first and last name, and press **Publish**. Then come back and check your work.',
        ),
      ],
      verificationQuery: `count(*[_type == "person" && defined(firstName) && defined(lastName)]) > 0`,
      hint: 'Did you press Publish? The website only reads published documents, not drafts.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Model content with schemas',
    slug: 'content-modeling',
    summary:
      'Define document types and fields in code with defineType and defineField, choose between references and objects, and add validation.',
    duration: 15,
    content: [
      p(
        'A **schema** tells the Studio which content types exist and which fields they have. Schemas live in `studio/src/schemaTypes`. The Content Lake itself is schemaless: the schema shapes the editing experience and the generated TypeScript types.',
      ),
      h2('Anatomy of a document type'),
      p('Here is a trimmed version of the `post` type in this project:'),
      code(
        'typescript',
        `
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      type: 'reference',
      to: [{type: 'person'}],
    }),
  ],
})
        `,
        'studio/src/schemaTypes/documents/post.ts',
      ),
      callout(
        'tip',
        'Always use the define helpers',
        '`defineType`, `defineField` and `defineArrayMember` give you autocompletion and type checking for every option. Import icons from their own path, like `@sanity/icons/DocumentText`.',
      ),
      h2('Common field types'),
      ...bullets(
        '`string` and `text` for short and long plain text. `slug` for URL-safe identifiers.',
        '`number`, `boolean`, `datetime` and `url` for typed values.',
        '`image` for images with hotspot and crop, `file` for other files.',
        '`reference` to point to another document. `object` to group fields inside the document.',
        "`array` for lists. An array of `block` is **Portable Text**, Sanity's rich text format.",
      ),
      h2('References or nested objects?'),
      p(
        'Use a **reference** when the content is reused or edited on its own, like an author or a category. Use an **object** when it only makes sense inside its parent, like a button or SEO fields.',
      ),
      ...bullets(
        'Post → author: **reference**. One person can write many posts, and fixing a typo in their name fixes it everywhere.',
        'Call to action → button: **object**. The button belongs to that one section.',
      ),
      h2('Register the type'),
      p(
        'New types must be added to the `schemaTypes` array in `studio/src/schemaTypes/index.ts`. The Studio reloads instantly.',
      ),
      callout(
        'warning',
        'Never delete a field that has data',
        'Removing a field from the schema hides the data but does not delete it. To retire a field, mark it `deprecated` and `readOnly`, migrate the data, and only then remove it.',
      ),
    ],
    challenge: {
      title: 'Add a category type',
      instructions: [
        p(
          'Create `studio/src/schemaTypes/documents/category.ts` with a `category` document type that has a required `title` and a `slug`. Register it in `schemaTypes/index.ts`.',
        ),
        p(
          'Then add a `categories` field to `post`: an array of references to `category`, using `defineArrayMember`. Finally, create and **publish** one category in the Studio.',
        ),
      ],
      verificationQuery: `count(*[_type == "category" && defined(slug.current)]) > 0`,
      hint: 'Is the type named exactly "category", does it have a slug, and is the document published?',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Create and publish content',
    slug: 'create-content',
    summary:
      'Understand drafts and publishing, write rich text with Portable Text, and add images with hotspots and alt text.',
    duration: 10,
    content: [
      h2('Drafts and published documents'),
      p(
        'When you edit a document, the Studio saves a **draft** right away. A draft is a separate document whose ID starts with `drafts.`. Pressing **Publish** copies the draft over the published version.',
      ),
      ...bullets(
        'The public website reads the **published** perspective, so visitors never see unfinished work.',
        'Presentation and Draft Mode read the **drafts** perspective, so editors can preview changes before publishing.',
      ),
      h2('Portable Text: rich text as data'),
      p(
        "Rich text fields like a post's **Content** store an array of blocks instead of HTML. Each block knows its style, its text spans and their marks. Because it is data, you can render it as React, plain text for search, or anything else.",
      ),
      code(
        'json',
        `
[
  {
    "_type": "block",
    "style": "h2",
    "children": [{"_type": "span", "text": "Why Sanity?", "marks": []}]
  },
  {
    "_type": "block",
    "style": "normal",
    "children": [
      {"_type": "span", "text": "Content is ", "marks": []},
      {"_type": "span", "text": "structured", "marks": ["strong"]}
    ]
  }
]
        `,
        'Portable Text',
      ),
      p(
        'Custom blocks can live inside Portable Text too. The code snippets, callouts and GROQ playgrounds in this guide are all custom blocks in the `lessonContent` type.',
      ),
      h2('Images done right'),
      ...bullets(
        'Enable `hotspot: true` so editors can mark the important part of an image. The frontend crops around it.',
        'Require **alt text** for accessibility and SEO. The post schema uses a custom validation rule so alt text is required whenever an image is set.',
        'This Studio includes the Unsplash asset source and AI Assist, which can write alt text for you.',
      ),
    ],
    challenge: {
      title: 'Publish a post with an author',
      instructions: [
        p(
          'Create a post with a title, a slug (press **Generate**), some content, a cover image with alt text, and the person you created as the author. Publish it, then open the home page to see it listed.',
        ),
      ],
      verificationQuery: `count(*[_type == "post" && defined(slug.current) && defined(author._ref)]) > 0`,
      hint: 'The post needs a slug and an author, and it must be published.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Query content with GROQ',
    slug: 'groq-basics',
    summary:
      "Filter, project, order and join documents with GROQ, Sanity's query language. Every example runs live against your dataset.",
    duration: 15,
    content: [
      p(
        'GROQ (Graph-Relational Object Queries) describes **which documents** you want and **what shape** the answer should have. A query reads left to right:',
      ),
      code(
        'groq',
        `
*                        // every document in the dataset
[_type == "post"]        // filter: only posts
| order(_createdAt desc) // sort
[0...10]                 // slice: the first 10
{title, "slug": slug.current}  // projection: the fields you want
        `,
      ),
      h2('Filters and projections'),
      p(
        'Always project the fields you need instead of returning whole documents. Rename and reshape fields with quoted keys.',
      ),
      playground(
        'Your posts, shaped for a list',
        `*[_type == "post"]{
  _id,
  title,
  "slug": slug.current
}`,
      ),
      h2('Following references'),
      p(
        "The `->` operator follows a reference and returns the document it points to. Here we pull the author's name into each post.",
      ),
      playground(
        'Join posts with their authors',
        `*[_type == "post"]{
  title,
  "author": author->{firstName, lastName}
}`,
      ),
      callout(
        'warning',
        'Filter before you follow',
        'To filter an array of references, filter the array first and follow the references after: `lessons[defined(@->slug.current)]->{title}`. Written the other way round, as `lessons[]->[defined(slug.current)]`, the filter runs on each lesson separately and every item comes back as `null`. This guide had exactly that bug while it was being built.',
      ),
      h2('Ordering and slicing'),
      p('Sort before you slice: `order()` comes first, then `[0...3]`.'),
      playground(
        'The three newest posts, people or lessons',
        `*[_type in ["post", "person", "lesson"]] | order(_createdAt desc)[0...3]{
  _type,
  _createdAt
}`,
      ),
      h2('Parameters'),
      p(
        'Pass values as `$parameters` instead of building query strings by hand. Parameters are escaped for you and let the CDN cache identical queries. Try changing the parameter to `"post"`.',
      ),
      playground('Filter by a parameter', `*[_type == $type]{_id, _type}`, {
        params: {type: 'person'},
      }),
      h2('Functions, counts and reverse references'),
      p(
        'GROQ can compute values. `count()` counts, `coalesce()` picks the first value that exists, and `references()` finds documents that point to another.',
      ),
      playground(
        'A tiny dashboard',
        `{
  "posts": count(*[_type == "post"]),
  "people": count(*[_type == "person"]),
  "lessons": count(*[_type == "lesson"])
}`,
      ),
      playground(
        'Each person with the posts they wrote',
        `*[_type == "person"]{
  "name": coalesce(firstName + " " + lastName, "Unnamed"),
  "posts": *[_type == "post" && references(^._id)].title
}`,
        {description: 'The ^ refers to the person in the outer query.'},
      ),
      callout(
        'note',
        'Where do these queries run?',
        'The playgrounds call the Sanity API straight from your browser, without a token. That means they only see **published** documents in a **public** dataset, the same as any visitor. Use Vision in the Studio to query drafts.',
      ),
    ],
    challenge: {
      title: 'Write your own query',
      instructions: [
        p(
          'Using any playground above, write a query that returns the titles of all lessons in this guide, sorted alphabetically. Tip: `| order(title asc)` and `.title` at the end returns a plain list of strings.',
        ),
        p('When it works, mark the lesson as complete below.'),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Fetch content in Next.js',
    slug: 'fetching-in-nextjs',
    summary:
      'Define queries with defineQuery, fetch them in Server Components with sanityFetch, and keep pages fast, live and SEO-friendly.',
    duration: 12,
    content: [
      h2('1. Define queries in one place'),
      p(
        'All frontend queries live in `frontend/sanity/lib/queries.ts`, wrapped in `defineQuery`. That lets TypeGen find them and generate a type for each result.',
      ),
      code(
        'typescript',
        `
import {defineQuery} from 'next-sanity'

export const lessonQuery = defineQuery(\`
  *[_type == "lesson" && slug.current == $slug && language == $language][0]{
    _id,
    title,
    "slug": slug.current,
    summary,
    content
  }
\`)
        `,
        'frontend/sanity/lib/queries.ts',
      ),
      h2('2. One client, configured once'),
      p(
        '`frontend/sanity/lib/client.ts` creates the client. `useCdn: true` serves cached responses from the edge, and `perspective: "published"` hides drafts by default.',
      ),
      p(
        '`frontend/sanity/lib/live.ts` wraps it with `defineLive`, which returns `sanityFetch` and the `<SanityLive />` component. The root layout renders `<SanityLive />`, and from then on every `sanityFetch` result updates live when content changes. No webhooks or rebuilds needed.',
      ),
      h2('3. Fetch in Server Components'),
      p(
        'Pages are Server Components, so they can `await` data directly and no Sanity code is shipped to the browser. This is the lesson page you are looking at, simplified:',
      ),
      code(
        'tsx',
        `
export default async function LessonPage(props: PageProps<'/[lang]/guide/[slug]'>) {
  const {slug} = await props.params
  const locale = await getLocale() // "en" or "no", read from the URL
  const {data: lesson} = await sanityFetch({
    query: lessonQuery,
    params: {slug, language: locale},
  })

  if (!lesson) notFound()

  return <h1>{lesson.title}</h1>
}
        `,
        'frontend/app/[lang]/guide/[slug]/page.tsx',
      ),
      h2('4. Static params and metadata'),
      ...bullets(
        '`generateStaticParams` pre-renders every lesson at build time. Fetch it with `perspective: "published"` and `stega: false`, so drafts never become pages.',
        '`generateMetadata` sets the title and description. Always pass `stega: false` there, so invisible editing markers never end up in `<head>`.',
        'Call `notFound()` when a document is missing, to render a proper 404.',
      ),
      callout(
        'tip',
        'Fetch in parallel',
        'When a page needs several queries, start them together with `Promise.all` instead of awaiting one after the other.',
      ),
    ],
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Type safety with TypeGen',
    slug: 'typegen',
    summary:
      'Generate TypeScript types from your schema and queries, so the frontend knows exactly what each query returns.',
    duration: 8,
    content: [
      p(
        'Sanity TypeGen reads your schema and your GROQ queries and writes TypeScript types for both. When you change a schema or a query, the types follow, and TypeScript points at every component that needs updating.',
      ),
      h2('The pipeline'),
      ...steps(
        '`sanity schema extract` in `studio/` writes the schema to `sanity.schema.json` at the repo root.',
        '`sanity typegen generate` in `frontend/` finds every `defineQuery` and writes `frontend/sanity.types.ts`.',
        'Because `overloadClientMethods` is on, `sanityFetch({query})` returns the right type without any manual generics.',
      ),
      code('sh', `npm run sanity:typegen --workspace=frontend`),
      p(
        'You rarely run this by hand: the frontend runs it automatically before `dev` and `build`. The configuration lives in `frontend/sanity.cli.ts`.',
      ),
      h2('Help TypeGen help you'),
      p(
        'TypeGen can only be as precise as your query. While building this guide, a query that filtered the guide singleton only by ID produced a union of every document type. Adding the type to the filter fixed it:',
      ),
      code(
        'groq',
        `
// Result type: a union of every document type in the schema
*[_id == "guide-en"][0]

// Result type: exactly the guide
*[_type == "guide" && _id == "guide-en"][0]
        `,
      ),
      callout(
        'note',
        'Stega-aware types',
        'Results from `sanityFetch` are typed as "stega branded": strings may contain invisible Visual Editing data. Comparing them to a literal like `"dark"` is a type error until you clean them with `stegaClean()`. That is TypeScript catching a real Draft Mode bug for you.',
      ),
    ],
    challenge: {
      title: 'Watch the types change',
      instructions: [
        p(
          'Add the `categories` field from the schema lesson to `allPostsQuery` in `frontend/sanity/lib/queries.ts`, for example `"categories": categories[]->title`. Run the typegen command, open `sanity.types.ts`, and find `categories` in `AllPostsQueryResult`.',
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Visual Editing and live preview',
    slug: 'visual-editing',
    summary:
      'Edit the website in place with the Presentation tool, understand stega encoding, and avoid the classic stegaClean bug.',
    duration: 12,
    content: [
      p(
        'Open **Presentation** in the Studio. It shows the website in an iframe next to the document editor. Hover any text and click it, and the right field opens. Changes show up on the page as you type, before you publish.',
      ),
      h2('How the pieces connect'),
      ...steps(
        'The Presentation tool opens the site through `/api/draft-mode/enable`. That route, made with `defineEnableDraftMode`, turns on Next.js Draft Mode.',
        'In Draft Mode, `sanityFetch` reads drafts and adds **stega**: invisible characters inside strings that encode which document and field each string came from.',
        'The `<VisualEditing />` component in the root layout reads those markers and draws the clickable overlays.',
      ),
      p(
        'Presentation also needs to know which documents belong to which URL. That is configured in the Studio:',
      ),
      code(
        'typescript',
        `
presentationTool({
  previewUrl: {
    origin: SANITY_STUDIO_PREVIEW_URL,
    previewMode: {enable: '/api/draft-mode/enable'},
  },
  resolve: {
    mainDocuments: defineDocuments([
      {
        route: '/:lang/guide/:slug',
        filter: \`_type == "lesson" && slug.current == $slug && language == $lang\`,
      },
    ]),
  },
})
        `,
        'studio/sanity.config.ts',
      ),
      h2('The golden rule of stega'),
      p(
        'Stega characters are invisible, but they are still there. A string with stega is no longer equal to the plain value, so any string used for **logic** must be cleaned first.',
      ),
      code(
        'tsx',
        `
import {stegaClean} from '@sanity/client/stega'

// ❌ Always false in Draft Mode: theme is "dark" plus invisible characters
const isDark = theme === 'dark'

// ✅ Clean values before comparing, using them as keys, or putting them in URLs
const isDark = stegaClean(theme) === 'dark'
        `,
        'frontend/app/components/Cta.tsx',
      ),
      p(
        "This exact bug was in this project's call-to-action block, and it is fixed now. This guide's code blocks, callout kinds and GROQ playground queries are cleaned the same way.",
      ),
      h2('Overlays for non-text elements'),
      p(
        'Images and layout wrappers contain no strings to encode. Give them a `data-sanity` attribute with the `dataAttr()` helper from `frontend/sanity/lib/utils.ts` so they become clickable too.',
      ),
    ],
    challenge: {
      title: 'Edit this lesson in place',
      instructions: [
        p(
          'Open the Studio, go to **Presentation**, and navigate to this lesson. Click the lesson title, change it, and watch the page update as you type. Discard the change afterwards, or publish it if you like it better.',
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Build pages with the page builder',
    slug: 'page-builder',
    summary:
      'Let editors compose pages from reusable blocks, and learn the five steps to add a new block type.',
    duration: 12,
    content: [
      p(
        'The `page` type has a `pageBuilder` field: an array of block objects that editors can add, remove and reorder. This project ships with two blocks: **Call to action** and **Info section**.',
      ),
      code(
        'typescript',
        `
defineField({
  name: 'pageBuilder',
  type: 'array',
  of: [{type: 'callToAction'}, {type: 'infoSection'}],
})
        `,
        'studio/src/schemaTypes/documents/page.ts',
      ),
      h2('From array to components'),
      ...bullets(
        '`app/[lang]/[slug]/page.tsx` fetches the page in the current language with `getPageQuery`, which expands each block type.',
        '`PageBuilder.tsx` loops over the blocks. It uses `useOptimistic`, so reordering blocks in Presentation feels instant.',
        "`BlockRenderer.tsx` maps each block's `_type` to a React component, and uses the block's `_key` as the React key.",
      ),
      h2('Adding a new block type'),
      ...steps(
        'Create the schema object, for example `studio/src/schemaTypes/objects/quote.ts`, and register it in `schemaTypes/index.ts`.',
        'Add `{type: "quote"}` to the `of` array of `pageBuilder`.',
        'If the block has references or links, expand them in `getPageQuery`.',
        'Run TypeGen, then build a `Quote` component that takes the typed block.',
        'Register it in the `Blocks` map in `BlockRenderer.tsx`.',
      ),
      callout(
        'tip',
        'Name blocks by purpose',
        'Call it `testimonial` or `featureList`, not `twoColumnGrid`. The layout can change; the purpose rarely does.',
      ),
    ],
    challenge: {
      title: 'Create the About page',
      instructions: [
        p(
          'The header already links to `/en/about`, but the page doesn\'t exist yet. In the Studio, open **Pages → Pages (English)**, create a page named "About" with the slug `about`, add at least one block to the page builder, and publish it.',
        ),
      ],
      verificationQuery: `count(*[_type == "page" && slug.current == "about" && coalesce(language, "en") == "en" && count(pageBuilder) > 0]) > 0`,
      hint: 'Check that the slug is exactly "about" and that the page builder has at least one block.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Style the frontend',
    slug: 'styling',
    summary:
      'Customise design tokens with Tailwind CSS v4, style Portable Text, and drive styling from content safely.',
    duration: 10,
    content: [
      h2('Design tokens live in CSS'),
      p(
        'This project uses Tailwind CSS v4, which is configured in CSS instead of a JavaScript config file. The colors, shadows and timing that every component uses are defined in `@theme`:',
      ),
      code(
        'css',
        `
@import 'tailwindcss';
@plugin "@tailwindcss/typography";

@theme {
  --color-brand: #f50;
  --color-blue: #0052ff;
  --color-yellow: #cdea19;
  --default-transition-duration: 250ms;
}
        `,
        'frontend/app/globals.css',
      ),
      p(
        'Each token becomes a utility class: `--color-brand` gives you `bg-brand`, `text-brand`, `border-brand` and so on. Change one value and the whole site follows.',
      ),
      h2('Fonts'),
      p(
        '`app/[lang]/layout.tsx` loads Inter and IBM Plex Mono with `next/font`, which self-hosts them and avoids layout shift. They are exposed as CSS variables and used through `font-sans` and `font-mono`.',
      ),
      h2('Styling Portable Text'),
      p(
        "The typography plugin's `prose` class styles rendered rich text. For anything custom, pass components to `<PortableText>`. This guide styles headings, links and inline code with `prose-*` modifiers, and renders code blocks, callouts and playgrounds with its own components.",
      ),
      code(
        'tsx',
        `
const components: PortableTextComponents = {
  types: {
    code: ({value}) => <CodeBlock code={value.code} language={value.language} />,
    callout: ({value}) => <Callout kind={value.kind} body={value.body} />,
  },
  marks: {
    link: ({children, value}) => <a href={value?.href}>{children}</a>,
  },
}
        `,
        'frontend/app/_guide/components/LessonPortableText.tsx',
      ),
      h2('Let content choose, let code decide'),
      p(
        "Editors sometimes need a say in presentation, like the call to action's light or dark **theme**. Store the intent as a small list of named options in the schema, and map each option to classes in the frontend. Never store hex codes or class names in content.",
      ),
      code(
        'tsx',
        `
const STYLES = {
  note: 'border-blue bg-blue/5',
  tip: 'border-green-500 bg-green-50',
  warning: 'border-brand bg-orange-50',
}

const className = STYLES[stegaClean(kind)] ?? STYLES.note
        `,
        'frontend/app/_guide/components/Callout.tsx',
      ),
      h2('Images'),
      p(
        "The `SanityImage` component builds image URLs that respect the editor's hotspot and crop, and requests exactly the size it renders. `next.config.ts` allows images from `cdn.sanity.io`.",
      ),
    ],
    challenge: {
      title: 'Rebrand the site',
      instructions: [
        p(
          "Change `--color-brand` in `frontend/app/globals.css` to a color of your choice. Save, and watch the buttons, links and this guide's progress bar update.",
        ),
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Site settings, singletons and SEO',
    slug: 'settings-and-seo',
    summary:
      'Create one-of-a-kind documents with the singleton pattern and use them for titles, social images and the sitemap.',
    duration: 8,
    content: [
      h2('The singleton pattern'),
      p(
        'Some documents should exist exactly once, like site settings or this guide\'s overview. Sanity has no "singleton" schema option. Instead, the Studio structure pins the document to a fixed ID. This site is multilingual, so there is one singleton per language, like `siteSettings-en` and `siteSettings-no`:',
      ),
      code(
        'typescript',
        `
LANGUAGES.map((language) =>
  S.listItem()
    .title(\`Site Settings (\${language.title})\`)
    .child(
      S.document()
        .schemaType('settings')
        .documentId(\`siteSettings-\${language.id}\`)
        // The template sets the document's language field
        .initialValueTemplate(\`settings-\${language.id}\`),
    ),
)
        `,
        'studio/src/structure/index.ts',
      ),
      p(
        '`studio/sanity.config.ts` then hides singleton types from the "Create new" menu and removes the duplicate and delete actions, so nobody can make a second one by accident.',
      ),
      h2('Metadata from content'),
      ...bullets(
        "The root layout's `generateMetadata` reads the settings to build the page title template and description.",
        "The Open Graph image comes from the settings' `ogImage`, sized to 1200×627 by the image URL builder.",
        'Lessons use their `summary` as the meta description, which is why the schema warns when it gets longer than 200 characters.',
        '`app/sitemap.ts` lists every page, post and lesson that has a slug.',
      ),
    ],
    challenge: {
      title: 'Name your site',
      instructions: [
        p(
          'Open **Site Settings → Site Settings (English)** in the Studio, give the site a title, and publish. The new title appears in the header and the browser tab of the English site.',
        ),
      ],
      verificationQuery: `defined(*[_type == "settings" && language == "en"][0].title)`,
      hint: 'Open "Site Settings (English)" from the Studio sidebar and press Publish.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Translate your site',
    slug: 'localization',
    summary:
      'See how this site serves English and Norwegian: language routes in Next.js, translated documents in Sanity, and a dictionary for interface text.',
    duration: 12,
    content: [
      p(
        'Switch to **NO** in the header and this lesson is in Norwegian. Three pieces work together to make that happen: the URL decides the language, Sanity stores one document per language, and a small dictionary translates the interface around the content.',
      ),
      h2('1. The language lives in the URL'),
      p(
        'Every page is under `app/[lang]/`, so URLs look like `/en/guide` and `/no/guide`. Search engines can index each language, and a link always opens the language it was shared in.',
      ),
      ...bullets(
        '`frontend/proxy.ts` redirects URLs without a language. It uses the language the visitor picked last time (a cookie set by the switcher), or English, the default.',
        'The root layout lives in `app/[lang]/layout.tsx`, which makes `lang` a **root param**. Any Server Component can read it with `getLocale()`, without passing it down as a prop.',
        'Pages tell search engines about their other languages with hreflang links, built from the translations in Sanity.',
      ),
      code(
        'typescript',
        `
import {lang} from 'next/root-params'
import {notFound} from 'next/navigation'

export async function getLocale() {
  const locale = await lang()
  if (!hasLocale(locale)) notFound()
  return locale
}
        `,
        'frontend/i18n/server.ts',
      ),
      h2('2. One document per language'),
      p(
        'Posts, pages and lessons use **document-level localization** with the `@sanity/document-internationalization` plugin. Each language version is its own document with a `language` field, so it can be edited and published on its own schedule.',
      ),
      ...bullets(
        'Open any lesson in the Studio and use the **Translations** menu to create or open the other language versions.',
        'The plugin links the versions with a `translation.metadata` document, which holds a reference to each one.',
        'Slugs only need to be unique within a language. The lessons share their slugs across languages, so your progress follows you when you switch.',
        'Singletons like Site Settings and the guide overview get one fixed ID per language, like `guide-en` and `guide-no`.',
      ),
      callout(
        'tip',
        'Document-level or field-level?',
        'Translate whole documents when the languages are edited and published independently, like articles and pages. For things that are mostly shared, like a person with a name, a photo and a bio, translate single fields instead with `sanity-plugin-internationalized-array`.',
      ),
      p('Every query then filters on the language from the URL:'),
      playground(
        'Lessons in one language',
        `*[_type == "lesson" && language == $language] | order(title asc){
  title,
  language,
  "slug": slug.current
}`,
        {params: {language: 'no'}},
      ),
      playground(
        'Find the translations of a lesson',
        `*[_type == "lesson" && slug.current == "localization" && language == "en"][0]{
  title,
  "translations": *[_type == "translation.metadata" && references(^._id)][0]
    .translations[]{language, "title": value->title}
}`,
        {description: 'references(^._id) finds the metadata document that points to this lesson.'},
      ),
      h2('3. A dictionary for interface text'),
      p(
        "Buttons, labels and headings that aren't content live in `frontend/i18n/dictionaries/en.ts` and `no.ts`. The Norwegian file is typed with the English one, so TypeScript reports any missing translation. Dictionaries are loaded on the server only, and Client Components get the strings they need as props.",
      ),
      callout(
        'note',
        'Translate with AI Assist',
        'The Studio has AI Assist set up with a translation style guide: Norwegian Bokmål prose with technical terms kept in English. Open an English document, create the Norwegian version from the Translations menu, and run **Translate document** from the AI Assist menu.',
      ),
    ],
    challenge: {
      title: 'Translate the About page',
      instructions: [
        p(
          'Open the English About page from the page builder lesson, and use the **Translations** menu to create a Norwegian version. Give it a Norwegian name, set the slug to `om`, and publish it.',
        ),
        p(
          "Then visit `/en/about` and click **NO** in the header. The switcher sends you to `/no/about`, which doesn't exist, so the site finds the translation and redirects you to `/no/om`.",
        ),
      ],
      verificationQuery: `count(*[_type == "translation.metadata" && "page" in schemaTypes && count(translations[language in ["en", "no"]]) == 2]) > 0`,
      hint: 'Create the Norwegian version from the Translations menu on the English page, so the two are linked, and publish it.',
    },
  },

  // ---------------------------------------------------------------------------------------------
  {
    title: 'Deploy and go further',
    slug: 'deploy',
    summary:
      'Deploy the Studio and the website, connect them in production, and find out where to go next.',
    duration: 10,
    content: [
      h2('1. Deploy the Studio'),
      p('From the `studio` folder:'),
      code('sh', `npx sanity deploy`),
      p(
        'The Studio is hosted on a `*.sanity.studio` URL. With `deployment.autoUpdates` enabled in `sanity.cli.ts`, it picks up Studio fixes and features without a redeploy.',
      ),
      h2('2. Deploy the website'),
      ...steps(
        'Push the repo to GitHub and import it in Vercel, with `frontend` as the root directory.',
        'Add the environment variables from `frontend/.env.local`. Set `NEXT_PUBLIC_SANITY_STUDIO_URL` to your deployed Studio URL.',
        "Add the production URL to the project's CORS origins, with credentials allowed.",
        "In the Studio's environment, set `SANITY_STUDIO_PREVIEW_URL` to the production URL and deploy the Studio again, so Presentation opens the live site.",
      ),
      callout(
        'tip',
        'No webhooks needed',
        'Because the site uses the Live Content API, published changes appear in production within seconds, without rebuilds or revalidation webhooks.',
      ),
      h2('Where to go next'),
      ...bullets(
        '[Sanity Learn](https://www.sanity.io/learn): free courses that go deeper on everything here.',
        '[GROQ cheat sheet](https://www.sanity.io/docs/content-lake/query-cheat-sheet): patterns for everyday queries.',
        '[Sanity Functions](https://www.sanity.io/docs/functions/functions-introduction): run code when content changes, without your own server.',
        '[Schema migrations](https://www.sanity.io/docs/content-lake/schema-and-content-migrations): change content safely as your model evolves.',
        "[next-sanity](https://github.com/sanity-io/next-sanity): the toolkit behind this project's data fetching and Visual Editing.",
      ),
      p(
        'Last tip: this guide is content. Open **Guide** in the Studio, write a lesson of your own, and add it to the guide overview. It shows up here right away.',
      ),
    ],
  },
]
