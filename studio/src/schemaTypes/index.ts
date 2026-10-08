import {person} from './documents/person'
import {page} from './documents/page'
import {post} from './documents/post'
import {lesson} from './documents/lesson'
import {callToAction} from './objects/callToAction'
import {infoSection} from './objects/infoSection'
import {settings} from './singletons/settings'
import {guide} from './singletons/guide'
import {link} from './objects/link'
import {blockContent} from './objects/blockContent'
import button from './objects/button'
import {blockContentTextOnly} from './objects/blockContentTextOnly'
import {lessonContent} from './objects/lessonContent'
import {callout} from './objects/callout'
import {groqPlayground} from './objects/groqPlayground'
import {challenge} from './objects/challenge'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  guide,
  // Documents
  page,
  post,
  person,
  lesson,
  // Objects
  button,
  blockContent,
  blockContentTextOnly,
  infoSection,
  callToAction,
  link,
  lessonContent,
  callout,
  groqPlayground,
  challenge,
]
