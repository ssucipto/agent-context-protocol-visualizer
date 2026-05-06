import type { Task } from '../lib/types';
import { StatusBadge } from './StatusBadge';

export function TaskList({ tasks }: { tasks: Task[] }) {
  if (!tasks.length) {
    return (
      <p className="text-xs text-gray-400 italic pl-4 py-2">No tasks defined</p>
    );
  }
  return (
    <ul className="divide-y divide-gray-100">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-start gap-3 px-4 py-2 hover:bg-gray-50">
          <span className="font-mono text-xs text-gray-400 w-20 shrink-0 pt-0.5">
            {task.id}
          </span>
          <span className="flex-1 text-sm text-gray-800">{task.name}</span>
          <StatusBadge status={task.status} />
          <span className="text-xs text-gray-400 font-mono w-16 text-right shrink-0">
            {task.estimated_hours}h est.
          </span>
          {task.actual_hours != null && (
            <span className="text-xs text-gray-400 font-mono w-16 text-right shrink-0">
              {task.actual_hours}h actual
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
