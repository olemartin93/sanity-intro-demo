import {BookIcon} from '@sanity/icons/Book'
import {CogIcon} from '@sanity/icons/Cog'
import {RocketIcon} from '@sanity/icons/Rocket'
import type {StructureBuilder, StructureResolver} from 'sanity/structure'
import pluralize from 'pluralize-esm'

/**
 * Structure builder is useful whenever you want to control how documents are grouped and
 * listed in the studio or for adding additional in-studio previews or content to documents.
 * Learn more: https://www.sanity.io/docs/structure-builder-introduction
 */

// Singleton types are pinned to a fixed document ID below. sanity.config.ts uses this list to
// remove them from the "Create new document" menu and to limit their document actions.
export const SINGLETON_TYPES = ['settings', 'guide']

// Types with their own place in the structure, or that are internal to plugins
const DISABLED_TYPES = [...SINGLETON_TYPES, 'lesson', 'assist.instruction.context']

export const structure: StructureResolver = (S: StructureBuilder) =>
  S.list()
    .title('Website Content')
    .items([
      ...S.documentTypeListItems()
        // Remove singletons, lessons and plugin types from the generic list of content types
        .filter((listItem: any) => !DISABLED_TYPES.includes(listItem.getId()))
        // Pluralize the title of each document type.  This is not required but just an option to consider.
        .map((listItem) => {
          return listItem.title(pluralize(listItem.getTitle() as string))
        }),
      S.divider(),
      // Everything that powers the interactive guide at /guide on the frontend
      S.listItem()
        .title('Guide')
        .icon(RocketIcon)
        .child(
          S.list()
            .title('Guide')
            .items([
              S.listItem()
                .title('Guide overview')
                .icon(RocketIcon)
                .child(
                  S.document().schemaType('guide').documentId('guide').title('Guide overview'),
                ),
              S.documentTypeListItem('lesson').title('Lessons').icon(BookIcon),
            ]),
        ),
      S.divider(),
      // Settings Singleton in order to view/edit the one particular document for Settings.  Learn more about Singletons: https://www.sanity.io/docs/create-a-link-to-a-single-edit-page-in-your-main-document-type-list
      S.listItem()
        .title('Site Settings')
        .child(S.document().schemaType('settings').documentId('siteSettings'))
        .icon(CogIcon),
    ])
