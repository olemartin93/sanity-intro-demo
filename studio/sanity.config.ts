/**
 * This config is used to configure your Sanity Studio.
 * Learn more: https://www.sanity.io/docs/configuration
 */

import {defineConfig, type Template} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './src/schemaTypes'
import {SINGLETON_TYPES, structure} from './src/structure'
import {unsplashImageAsset} from 'sanity-plugin-asset-source-unsplash'
import {
  presentationTool,
  defineDocuments,
  defineLocations,
  type DocumentLocation,
} from 'sanity/presentation'
import {assist} from '@sanity/assist'
import {codeInput} from '@sanity/code-input'
import {documentInternationalization} from '@sanity/document-internationalization'
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  LOCALIZED_DOCUMENT_TYPES,
  LOCALIZED_SINGLETONS,
} from './src/lib/i18n'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

// URL for preview functionality, defaults to localhost:3000 if not set
const SANITY_STUDIO_PREVIEW_URL = process.env.SANITY_STUDIO_PREVIEW_URL || 'http://localhost:3000'

// Every URL on the website starts with a language, like /en/guide or /no/guide.
// Documents without a language (for example imported sample data) are treated as English.
const languageOf = (language?: string) => language || DEFAULT_LANGUAGE

// Define the home location for the presentation tool
const homeLocation = (language?: string) =>
  ({
    title: 'Home',
    href: `/${languageOf(language)}`,
  }) satisfies DocumentLocation

// resolveHref() is a convenience function that resolves the URL
// path for different document types and used in the presentation tool.
function resolveHref(documentType?: string, slug?: string, language?: string): string | undefined {
  const prefix = `/${languageOf(language)}`
  switch (documentType) {
    case 'post':
      return slug ? `${prefix}/posts/${slug}` : undefined
    case 'page':
      return slug ? `${prefix}/${slug}` : undefined
    case 'lesson':
      return slug ? `${prefix}/guide/${slug}` : undefined
    default:
      console.warn('Invalid document type:', documentType)
      return undefined
  }
}

// Template IDs that may appear in the global "Create new document" menu. Localized types are
// only offered in a specific language (e.g. "English Post", "Norsk Post"), so every new document
// gets a language. Singletons are only reachable through the structure.
const LOCALIZED_TEMPLATE_IDS = LOCALIZED_DOCUMENT_TYPES.flatMap((type) =>
  LANGUAGES.map((language) => `${type}-${language.id}`),
)
const SINGLETON_TEMPLATES: Template[] = LOCALIZED_SINGLETONS.flatMap(({type, title}) =>
  LANGUAGES.map((language) => ({
    id: `${type}-${language.id}`,
    title: `${title} (${language.title})`,
    schemaType: type,
    value: {language: language.id},
  })),
)

// Main Sanity configuration
export default defineConfig({
  name: 'default',
  title: 'Sanity + Next.js Starter Template',

  projectId,
  dataset,

  plugins: [
    // Presentation tool configuration for Visual Editing
    presentationTool({
      previewUrl: {
        origin: SANITY_STUDIO_PREVIEW_URL,
        previewMode: {
          enable: '/api/draft-mode/enable',
        },
      },
      resolve: {
        // The Main Document Resolver API provides a method of resolving a main document from a given route or route pattern. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#57720a5678d9
        // Specific routes come before the generic /:lang/:slug page route.
        mainDocuments: defineDocuments([
          {
            route: '/:lang',
            filter: `_type == "settings" && language == $lang`,
          },
          {
            route: '/:lang/guide',
            filter: `_type == "guide" && language == $lang`,
          },
          {
            route: '/:lang/guide/:slug',
            filter: `_type == "lesson" && slug.current == $slug && language == $lang`,
          },
          {
            route: '/:lang/posts/:slug',
            filter: `_type == "post" && slug.current == $slug && coalesce(language, "${DEFAULT_LANGUAGE}") == $lang`,
          },
          {
            route: '/:lang/:slug',
            filter: `_type == "page" && slug.current == $slug && coalesce(language, "${DEFAULT_LANGUAGE}") == $lang`,
          },
        ]),
        // Locations Resolver API allows you to define where data is being used in your application. https://www.sanity.io/docs/visual-editing/presentation-resolver-api#8d8bca7bfcd7
        locations: {
          guide: defineLocations({
            select: {language: 'language'},
            resolve: (doc) => ({
              locations: [{title: 'Guide', href: `/${languageOf(doc?.language)}/guide`}],
              message: 'This document controls the guide overview and lesson order',
              tone: 'positive',
            }),
          }),
          lesson: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              language: 'language',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('lesson', doc?.slug, doc?.language)!,
                },
                {title: 'Guide', href: `/${languageOf(doc?.language)}/guide`},
              ],
            }),
          }),
          settings: defineLocations({
            select: {language: 'language'},
            resolve: (doc) => ({
              locations: [homeLocation(doc?.language)],
              message: 'This document is used on all pages in this language',
              tone: 'positive',
            }),
          }),
          page: defineLocations({
            select: {
              name: 'name',
              slug: 'slug.current',
              language: 'language',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.name || 'Untitled',
                  href: resolveHref('page', doc?.slug, doc?.language)!,
                },
              ],
            }),
          }),
          post: defineLocations({
            select: {
              title: 'title',
              slug: 'slug.current',
              language: 'language',
            },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || 'Untitled',
                  href: resolveHref('post', doc?.slug, doc?.language)!,
                },
                homeLocation(doc?.language),
              ],
            }),
          }),
        },
      },
    }),
    structureTool({
      structure, // Custom studio structure configuration, imported from ./src/structure.ts
    }),
    // Additional plugins for enhanced functionality
    unsplashImageAsset(),
    // Adds the `code` schema type with a syntax-highlighted editor. Used in lesson content.
    codeInput(),
    // Document-level localization: a "Translations" menu on posts, pages and lessons that creates
    // and links language versions. Learn more: https://www.sanity.io/plugins/document-internationalization
    documentInternationalization({
      supportedLanguages: [...LANGUAGES],
      schemaTypes: LOCALIZED_DOCUMENT_TYPES,
    }),
    assist({
      // Adds a "Translate document" AI Assist action to localized documents
      translate: {
        document: {
          languageField: 'language',
          documentTypes: LOCALIZED_DOCUMENT_TYPES,
        },
        styleguide:
          'When translating to Norwegian (no), write natural Norwegian Bokmål, but keep technical terms in English, for example schema, query, GROQ, Studio, dataset, document, field, slug, Portable Text, draft, token and Server Components. Never translate code, file paths or button names from the Sanity Studio.',
      },
    }),
    visionTool(),
  ],

  // Schema configuration, imported from ./src/schemaTypes/index.ts
  schema: {
    types: schemaTypes,
    // One template per language for each localized singleton, used by the structure
    templates: (templates) => [...templates, ...SINGLETON_TEMPLATES],
  },

  document: {
    // Hide singletons and language-less templates from "Create new document" menus
    newDocumentOptions: (options) =>
      options.filter(
        ({templateId}) =>
          LOCALIZED_TEMPLATE_IDS.includes(templateId) ||
          ![...SINGLETON_TYPES, ...LOCALIZED_DOCUMENT_TYPES].some(
            (type) => templateId === type || templateId.startsWith(`${type}-`),
          ),
      ),
    // Singletons can be edited and published, but not duplicated or deleted
    actions: (input, context) =>
      SINGLETON_TYPES.includes(context.schemaType)
        ? input.filter(
            ({action}) => action && ['publish', 'discardChanges', 'restore'].includes(action),
          )
        : input,
  },
})
