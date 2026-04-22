import { Code2 } from 'lucide-react'
import type { ReactNode } from 'react'

type RawJsonPanelProps = {
  title?: string
  data: unknown
  fallback?: ReactNode
}

export const RawJsonPanel = ({
  title = 'View raw JSON response',
  data,
  fallback = 'No response yet.',
}: RawJsonPanelProps) => {
  return (
    <details className="rounded-md border border-page p-3">
      <summary className="flex cursor-pointer items-center gap-2 text-body-3 font-medium">
        <Code2 className="size-4" />
        {title}
      </summary>
      <pre className="mt-2 max-h-80 overflow-auto rounded bg-theme-gray-100 p-2 text-body-2">
        {JSON.stringify(data ?? fallback, null, 2)}
      </pre>
    </details>
  )
}
