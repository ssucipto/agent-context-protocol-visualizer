import { createFileRoute } from '@tanstack/react-router'
import { useProgressData } from '../lib/data-source'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { data, error, loading } = useProgressData()
  if (loading) return <p className="p-4 text-gray-500">Loading progress.yaml…</p>
  if (error) return <p className="p-4 text-red-500">Error: {error}</p>
  return (
    <pre className="p-4 text-xs font-mono text-gray-800 overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

