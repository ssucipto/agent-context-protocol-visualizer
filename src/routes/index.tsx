import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">ACP Progress Visualizer — P0 MVP</h1>
      <p className="mt-4 text-lg text-gray-500">Loading progress.yaml...</p>
    </div>
  )
}
