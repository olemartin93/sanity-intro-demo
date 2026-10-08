import {BookIcon} from '@sanity/icons/Book'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentIcon} from '@sanity/icons/Document'
import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {RocketIcon} from '@sanity/icons/Rocket'
import type {ComponentType} from 'react'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

import {LANGUAGES, LOCALIZED_DOCUMENT_TYPES, LOCALIZED_SINGLETONS, singletonId} from '../lib/i18n'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Singleton types are pinned to fixed document IDs below (one per language). sanity.config.ts uses
// this list to remove them from the "Create new document" menu and to limit their document actions.
export const SINGLETON_TYPES: string[] = LOCALIZED_SINGLETONS.map(({type}) => type)

// Types with their own place in the structure, or that are internal to plugins
const DISABLED_TYPES = [
  ...SINGLETON_TYPES,
  ...LOCALIZED_DOCUMENT_TYPES,
  'assist.instruction.context',
  'translation.metadata',
]

/**
 * A list item that shows a localized document type per language. New documents created from a
 * language list get that language through the plugin's `<type>-<language>` template.
 */
function localizedDocumentList(
  S: StructureBuilder,
  type: string,
  title: string,
  icon: ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          LANGUAGES.map((language) =>
            S.listItem()
              .id(`${type}-${language.id}`)
              .title(`${title} (${language.title})`)
              .icon(icon)
              .child(
                S.documentTypeList(type)
                  .title(`${title} (${language.title})`)
                  .filter('_type == $type && language == $language')
                  .params({type, language: language.id})
                  .initialValueTemplates([S.initialValueTemplateItem(`${type}-${language.id}`)]),
              ),
          ),
        ),
    )
}

/**
 * A list item with one singleton document per language, pinned to fixed IDs like `guide-no`.
 * The `<type>-<language>` template (defined in sanity.config.ts) sets the language field.
 */
function localizedSingleton(
  S: StructureBuilder,
  type: string,
  idPrefix: string,
  title: string,
  icon: ComponentType,
) {
  return S.listItem()
    .title(title)
    .icon(icon)
    .child(
      S.list()
        .title(title)
        .items(
          LANGUAGES.map((language) =>
            S.listItem()
              .id(singletonId(idPrefix, language.id))
              .title(`${title} (${language.title})`)
              .icon(icon)
              .child(
                S.document()
                  .schemaType(type)
                  .documentId(singletonId(idPrefix, language.id))
                  .initialValueTemplate(`${type}-${language.id}`)
                  .title(`${title} (${language.title})`),
              ),
          ),
        ),
    )
}

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      localizedDocumentList(S, 'page', 'Pages', DocumentIcon),
      localizedDocumentList(S, 'post', 'Posts', DocumentTextIcon),
      ...S.documentTypeListItems()
        // Remove singletons, localized types and plugin types from the generic list of content types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
      S.divider(),
      // Everything that powers the interactive guide at /[lang]/guide on the frontend
      S.listItem()
        .title('Guide')
        .icon(RocketIcon)
        .child(
          S.list()
            .title('Guide')
            .items([
              localizedSingleton(S, 'guide', 'guide', 'Guide overview', RocketIcon),
              localizedDocumentList(S, 'lesson', 'Lessons', BookIcon),
            ]),
        ),
      S.divider(),
      // Settings Singleton, one per language.  Learn more about Singletons: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
      localizedSingleton(S, 'settings', 'siteSettings', 'Site Settings', CogIcon),
    ])
