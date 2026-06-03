import { createFileRoute } from '@tanstack/react-router'
import { useState, useCallback } from 'react'
import { NextSteps } from '../components/NextSteps'
import { OverallProgress } from '../components/OverallProgress'
import { ProjectHeader } from '../components/ProjectHeader'
import { AggregateHome } from '../components/AggregateHome'
import { AddProjectDialog } from '../components/AddProjectDialog'
import { useProgressData } from '../lib/data-source'
import { loadProjectConfigs, saveProjectConfigs, type ProjectConfig } from '../lib/projects'

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search['tab'] === 'string' ? search['tab'] : 'Home',
    add: typeof search['add'] === 'string' ? search['add'] : '',
  }),
  component: Home,
})

function ProjectTab({ config }: { config: ProjectConfig }) {
  const pathOrRepo = config.source === 'local' ? config.path : config.repo;
  // For local projects, pass path override; for GitHub, useProgressData reads env
  const { data, error, loading } = useProgressData(
    config.source === 'local' ? pathOrRepo : undefined,
  );

  if (loading)
    return <div className="p-6 text-gray-400 animate-pulse">Loading {config.name}…</div>
  if (error ?? !data)
    return <div className="p-6 text-red-500 whitespace-pre-wrap">Error: {error}</div>

  const milestones = Object.values(data.milestones)

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <ProjectHeader project={data.project} />
      <OverallProgress milestones={milestones} />
      <NextSteps items={data.next_steps} />
    </div>
  )
}

function Home() {
  const { tab, add } = Route.useSearch()
  const [projects, setProjects] = useState<ProjectConfig[]>(() => loadProjectConfigs())
  const [showAddDialog, setShowAddDialog] = useState(add === '1')

  const activeProject = tab !== 'Home'
    ? projects.find((p) => p.name === tab)
    : null;

  const handleAdd = useCallback((config: ProjectConfig) => {
    const updated = [...projects, config];
    setProjects(updated);
    try {
      saveProjectConfigs(updated);
    } catch {
      // Ignore save errors in environments without fs access
    }
  }, [projects]);

  // Aggregate home view
  if (tab === 'Home') {
    const snapshots = projects.map((config) => ({
      config,
      data: null as any, // lazy — each project tab loads independently
    }));
    return (
      <>
        <AggregateHome
          projects={snapshots}
          onSelectProject={(name) => {
            // Navigate handled by TabBar in root layout via parent context
            window.location.search = `?tab=${encodeURIComponent(name)}`;
          }}
        />
        <AddProjectDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAdd}
        />
      </>
    );
  }

  // Individual project tab
  if (activeProject) {
    return (
      <>
        <ProjectTab config={activeProject} />
        <AddProjectDialog
          open={showAddDialog}
          onClose={() => setShowAddDialog(false)}
          onAdd={handleAdd}
        />
      </>
    );
  }

  return <div className="p-6 text-gray-500">Project "{tab}" not found.</div>;
}


