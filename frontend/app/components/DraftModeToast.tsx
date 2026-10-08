'use client'

import {useIsPresentationTool} from 'next-sanity/hooks'
import {useRouter} from 'next/navigation'
import {useEffect, useTransition} from 'react'
import {toast} from 'sonner'
import {disableDraftMode} from '@/app/actions'
import type {Dictionary} from '@/i18n/dictionaries/en'

export default function DraftModeToast({labels}: {labels: Dictionary['draftMode']}) {
  const isPresentationTool = useIsPresentationTool()
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (isPresentationTool === false) {
      /**
       * We delay the toast in case we're inside Presentation Tool
       */
      const toastId = toast(labels.enabled, {
        description: labels.description,
        duration: Infinity,
        action: {
          label: labels.disable,
          onClick: async () => {
            await disableDraftMode()
            startTransition(() => {
              router.refresh()
            })
          },
        },
      })
      return () => {
        toast.dismiss(toastId)
      }
    }
  }, [router, isPresentationTool, labels])

  useEffect(() => {
    if (pending) {
      const toastId = toast.loading(labels.disabling)
      return () => {
        toast.dismiss(toastId)
      }
    }
  }, [pending, labels])

  return null
}
