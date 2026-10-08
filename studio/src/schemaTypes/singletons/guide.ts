import {RocketIcon} from '@sanity/icons/Rocket'
import {defineArrayMember, defineField, defineType} from 'sanity'

/**
 * Guide schema singleton. Holds the guide intro and the ordered list of lessons.
 * The singleton is enforced in the Studio structure (src/structure/index.ts), which pins it to the
 * document ID "guide".
 */

export const guide = defineType({
  name: 'guide',
  title: 'Guide',
  type: 'document',
  icon: RocketIcon,
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
      of: [defineArrayMember({type: 'reference', to: [{type: 'lesson'}]})],
      validation: (rule) => rule.unique(),
    }),
  ],
  preview: {
    prepare() {
      return {title: 'Guide'}
    },
  },
})
