import { useState } from 'react';
import type { Milestone, Task } from '../lib/types';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { TaskList } from './TaskList';

interface Props {
  milestones: Milestone[];
  tasks: Record<string, Task[]>;
}

export function MilestoneTree({ milestones, tasks }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  const expandAll = () => setExpanded(new Set(milestones.map((m) => m.id)));
  const collapseAll = () => setExpanded(new Set());

  return (
    <div>
      {/* Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={expandAll}
          className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-600"
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className="text-xs px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 text-gray-600"
        >
          Collapse All
        </button>
      </div>

      {/* Tree */}
      <div className="divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
        {milestones.map((m) => {
          const isOpen = expanded.has(m.id);
          const milestoneTaskList = tasks[m.id] ?? [];
          return (
            <div key={m.id}>
              {/* Milestone header row */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                onClick={() => toggle(m.id)}
              >
                <span className="text-gray-400 w-4 shrink-0">{isOpen ? '▼' : '▶'}</span>
                <span className="font-mono text-xs text-gray-500 w-10 shrink-0">{m.id}</span>
                <span className="flex-1 text-sm font-medium text-gray-800">{m.name}</span>
                <StatusBadge status={m.status} />
                <div className="w-32 shrink-0">
                  <ProgressBar value={m.progress} />
                </div>
                <span className="text-xs text-gray-400 font-mono w-16 text-right shrink-0">
                  {m.tasks_completed}/{m.tasks_total} tasks
                </span>
              </button>

              {/* Expanded task list */}
              {isOpen && (
                <div className="bg-gray-50 border-t border-gray-100">
                  <TaskList tasks={milestoneTaskList} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
