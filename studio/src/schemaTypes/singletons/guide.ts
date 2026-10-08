import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {languageField} from '../fields/language'

/**
 * Guide schema singleton. Holds the guide intro and the ordered list of lessons.
 * There is one guide per language, with fixed IDs like "guide-en" and "guide-no". The Studio
 * structure (src/structure/index.ts) lists one item per language.
 */

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: RocketIcon,
  fields: [
    languageField,
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Shown at the top of the guide overview page and used as the meta description.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lessons',
      title: 'Lessons',
      description: 'Drag to reorder. The order here is the order learners follow.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'lesson'}],
          // Only offer lessons in the same language as this guide
          options: {
            filter: ({document}) => ({
              filter: 'language == $language',
              params: {language: document.language},
            }),
          },
        }),
      ],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    select: {language: 'language'},
    prepare({language}) {
      return {title: 'Guide', subtitle: language?.toUpperCase()}
    },
  },
})
