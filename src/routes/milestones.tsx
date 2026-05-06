import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { MilestoneTable } from '../components/MilestoneTable'
import { MilestoneTree } from '../components/MilestoneTree'
import { useProgressData } from '../lib/data-source'

export const Route = createFileRoute('/milestones')({ component: MilestonesPage })

function MilestonesPage() {
  const { data, error, loading } = useProgressData()
  const [view, setView] = useState<'table' | 'tree'>('table')

  if (loading) return <p className="p-4 text-gray-500">Loading…</p>
  if (error ?? !data) return <p className="p-4 text-red-500">Error: {error}</p>

  const milestones = Object.values(data.milestones)

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Milestones ({milestones.length})</h1>
        <div className="flex rounded-md border border-gray-200 overflow-hidden text-sm">
          {(['table', 'tree'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 capitalize ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {v === 'table' ? '📊 Table' : '🌳 Tree'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' ? (
        <MilestoneTable milestones={milestones} />
      ) : (
        <MilestoneTree milestones={milestones} tasks={data.tasks} />
      )}
    </div>
  )
}

