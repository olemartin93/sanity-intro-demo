import {BookIcon} from '@sanity/icons/Book'
import {defineField, defineType} from 'sanity'

/**
 * Lesson schema. Each lesson is one step in the interactive guide at /guide on the frontend.
 * Lessons are ordered by the `guide` singleton, which holds an array of references to them, so
 * editors can reorder the guide with drag and drop instead of maintaining an "order" number.
 * Learn more: https://www.sanity.io/docs/schema-types
 */

export const lesson = defineType({
  name: 'lesson',
  title: 'Lesson',
  type: 'document',
  icon: BookIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'challenge', title: 'Challenge'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description:
        'One or two sentences shown in the lesson list and used as the meta description.',
      type: 'text',
      rows: 3,
      group: 'content',
      validation: (rule) => [
        rule.required(),
        rule.max(200).warning('Keep it under 200 characters for best SEO'),
      ],
    }),
    defineField({
      name: 'duration',
      title: 'Duration (minutes)',
      description: 'Roughly how long the lesson takes to complete.',
      type: 'number',
      group: 'content',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'lessonContent',
      group: 'content',
    }),
    defineField({
      name: 'challenge',
      title: 'Challenge',
      description: 'An optional hands-on task the learner can verify from the guide.',
      type: 'challenge',
      group: 'challenge',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'summary',
    },
  },
})
