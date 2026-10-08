import {TargetIcon} from '@sanity/icons/Target'
import {defineField, defineType} from 'sanity'

/**
 * Challenge schema object. A hands-on task at the end of a lesson. If a verification query is set,
 * the frontend shows a "Check my work" button that runs it against the published dataset.
 */

export const challenge = defineType({
  name: 'challenge',
  title: 'Challenge',
  type: 'object',
  icon: TargetIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'instructions',
      title: 'Instructions',
      type: 'blockContentTextOnly',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verificationQuery',
      title: 'Verification query',
      description:
        'A GROQ expression that returns true when the challenge is done, for example: count(*[_type == "post"]) > 0',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'hint',
      title: 'Hint',
      description: 'Shown when the verification query returns false.',
      type: 'text',
      rows: 2,
    }),
  ],
})
