import {defineField, defineType} from 'sanity'
import {SearchIcon} from '@sanity/icons/Search'

/**
 * GROQ playground schema object. Editors place it inside lesson content, and the frontend renders
 * an editable query box that runs the query against the published dataset in the browser.
 */

export const groqPlayground = defineType({
  name: 'groqPlayground',
  title: 'GROQ Playground',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'query',
      title: 'Starting query',
      description: 'The query the learner starts with. They can edit and re-run it.',
      type: 'text',
      rows: 6,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'params',
      title: 'Query parameters (JSON)',
      description: 'Optional. For example: {"type": "post"}',
      type: 'text',
      rows: 2,
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true
          try {
            const parsed = JSON.parse(value)
            return typeof parsed === 'object' && !Array.isArray(parsed)
              ? true
              : 'Parameters must be a JSON object'
          } catch {
            return 'Parameters must be valid JSON'
          }
        }),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'query',
    },
  },
})
