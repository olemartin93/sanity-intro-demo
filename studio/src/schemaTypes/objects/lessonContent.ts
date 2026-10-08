import {defineArrayMember, defineField, defineType} from 'sanity'
import {BookIcon} from '@sanity/icons/Book'

/**
 * Rich text (Portable Text) used for lesson bodies. Besides regular text blocks it allows a set of
 * custom blocks: code snippets, callouts, images and live GROQ playgrounds.
 * Learn more: https://www.sanity.io/docs/block-content
 */

export const lessonContent = defineType({
  name: 'lessonContent',
  title: 'Lesson content',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        {title: 'Normal', value: 'normal'},
        {title: 'Heading 2', value: 'h2'},
        {title: 'Heading 3', value: 'h3'},
        {title: 'Quote', value: 'blockquote'},
      ],
      marks: {
        decorators: [
          {title: 'Strong', value: 'strong'},
          {title: 'Emphasis', value: 'em'},
          {title: 'Code', value: 'code'},
        ],
        annotations: [
          defineArrayMember({
            name: 'link',
            title: 'External link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) => rule.required().uri({scheme: ['http', 'https', 'mailto']}),
              }),
            ],
          }),
          defineArrayMember({
            name: 'lessonLink',
            title: 'Link to lesson',
            type: 'object',
            icon: BookIcon,
            fields: [
              defineField({
                name: 'lesson',
                title: 'Lesson',
                type: 'reference',
                to: [{type: 'lesson'}],
                validation: (rule) => rule.required(),
              }),
            ],
          }),
        ],
      },
    }),
    // The `code` type comes from the @sanity/code-input plugin registered in sanity.config.ts
    defineArrayMember({
      type: 'code',
      options: {
        withFilename: true,
        languageAlternatives: [
          {title: 'TypeScript', value: 'typescript'},
          {title: 'TSX', value: 'tsx'},
          {title: 'GROQ', value: 'groq'},
          {title: 'CSS', value: 'css'},
          {title: 'Shell', value: 'sh'},
          {title: 'JSON', value: 'json'},
        ],
      },
    }),
    defineArrayMember({type: 'callout'}),
    defineArrayMember({type: 'groqPlayground'}),
    defineArrayMember({
      type: 'image',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
    }),
  ],
})
