import {defineField} from 'sanity'

/**
 * The language of a document. It's set when the document is created (from a language-specific
 * template or the Translations menu) and shouldn't be edited by hand, so it's hidden and read-only.
 * The field name must match the `languageField` of the document-internationalization plugin.
 */
export const languageField = defineField({
  name: 'language',
  title: 'Language',
  type: 'string',
  readOnly: true,
  hidden: true,
})
