import {stegaClean, type StegaBranded} from '@sanity/client/stega'
import Link from 'next/link'
import {PortableText, type PortableTextBlock, type PortableTextComponents} from 'next-sanity'

import Image from '@/app/components/SanityImage'
import Callout from '@/app/guide/_components/Callout'
import CodeBlock from '@/app/guide/_components/CodeBlock'
import GroqPlayground from '@/app/guide/_components/GroqPlayground'
import type {LessonQueryResult} from '@/sanity.types'

// Data from sanityFetch is typed as "stega branded": strings may contain invisible Visual Editing data
type LessonContent = StegaBranded<NonNullable<NonNullable<LessonQueryResult>['content']>>
type ContentItem<T extends LessonContent[number]['_type']> = Extract<
  LessonContent[number],
  {_type: T}
>

/**
 * Renders lesson content (Portable Text). Every custom block type allowed by the `lessonContent`
 * schema needs a matching component in `types`, and every annotation needs one in `marks`.
 * Learn more: https://github.com/portabletext/react-portabletext
 */
const components: PortableTextComponents = {
  types: {
    code: ({value}: {value: ContentItem<'code'>}) => (
      <CodeBlock code={value.code} language={value.language} filename={value.filename} />
    ),
    callout: ({value}: {value: ContentItem<'callout'>}) => (
      <Callout kind={value.kind} title={value.title} body={value.body as PortableTextBlock[]} />
    ),
    groqPlayground: ({value}: {value: ContentItem<'groqPlayground'>}) => (
      // The query runs in the browser, so remove stega characters before handing it over
      <GroqPlayground
        title={value.title}
        description={value.description}
        query={stegaClean(value.query)}
        params={stegaClean(value.params)}
      />
    ),
    image: ({value}: {value: ContentItem<'image'>}) => {
      if (!value.asset?._ref) return null
      return (
        <figure className="my-8">
          <Image
            id={value.asset._ref}
            alt={value.alt}
            width={760}
            mode="cover"
            hotspot={value.hotspot}
            crop={value.crop}
            className="rounded-lg border border-gray-200"
          />
          {value.caption && (
            <figcaption className="mt-2 text-center text-sm text-gray-500">
              {value.caption}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    // Headings get an id so they can be linked to. scroll-mt keeps them clear of the fixed header.
    h2: ({children, value}) => (
      <h2 id={value._key} className="scroll-mt-28">
        {children}
      </h2>
    ),
    h3: ({children, value}) => (
      <h3 id={value._key} className="scroll-mt-28">
        {children}
      </h3>
    ),
  },
  marks: {
    link: ({children, value}) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    // lessonLink is resolved to a slug in the GROQ query, so no extra fetch is needed here
    lessonLink: ({children, value}) =>
      value?.slug ? <Link href={`/guide/${value.slug}`}>{children}</Link> : <>{children}</>,
  },
}

export default function LessonPortableText({value}: {value: LessonContent}) {
  return (
    <div className="prose prose-lg max-w-none prose-headings:tracking-tight prose-a:text-brand prose-code:rounded prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none">
      <PortableText components={components} value={value as PortableTextBlock[]} />
    </div>
  )
}
