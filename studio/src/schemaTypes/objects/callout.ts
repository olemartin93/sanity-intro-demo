import {defineField, defineType} from 'sanity'
import {InfoOutlineIcon} from '@sanity/icons/InfoOutline'

/**
 * Callout schema object. Used inside lesson content to highlight a tip, a note or a warning.
 * Notice that the field is called `kind` (what the callout *is*), not `color` (what it *looks like*).
 * The frontend decides how each kind is styled. Learn more: https://www.sanity.io/docs/studio/object-type
 */

export const callout = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      initialValue: 'note',
      options: {
        list: [
          {title: 'Note', value: 'note'},
          {title: 'Tip', value: 'tip'},
          {title: 'Warning', value: 'warning'},
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'blockContentTextOnly',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      kind: 'kind',
      title: 'title',
    },
    prepare({kind, title}) {
      return {
        title: title || 'Untitled callout',
        subtitle: `Callout · ${kind ?? 'note'}`,
      }
    },
  },
})
