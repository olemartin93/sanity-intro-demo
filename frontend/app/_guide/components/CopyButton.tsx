'use client'

import {useState} from 'react'

export default function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string
  label: string
  copiedLabel: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard access can be denied; the code is still selectable by hand
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-md px-2.5 py-1 font-mono text-xs text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer"
    >
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  )
}
