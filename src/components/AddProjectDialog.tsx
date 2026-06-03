import { useState } from 'react';
import type { ProjectConfig } from '../lib/projects';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (config: ProjectConfig) => void;
}

export function AddProjectDialog({ open, onClose, onAdd }: Props) {
  const [name, setName] = useState('');
  const [source, setSource] = useState<'local' | 'github'>('local');
  const [path, setPath] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      source,
      path: source === 'local' ? (path.trim() || undefined) : undefined,
      repo: source === 'github' ? (repo.trim() || undefined) : undefined,
      branch: branch.trim() || undefined,
    });

    // Reset form
    setName('');
    setPath('');
    setRepo('');
    setBranch('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-semibold mb-4">Add Project</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="my-project"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Source Type
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="source"
                  checked={source === 'local'}
                  onChange={() => setSource('local')}
                  className="accent-blue-600"
                />
                Local File
              </label>
              <label className="flex items-center gap-1.5 text-sm">
                <input
                  type="radio"
                  name="source"
                  checked={source === 'github'}
                  onChange={() => setSource('github')}
                  className="accent-blue-600"
                />
                GitHub Repo
              </label>
            </div>
          </div>

          {source === 'local' ? (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Progress YAML Path
              </label>
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="../acp-enhanced/agent/progress.yaml"
              />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  GitHub Repo
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                             focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="owner/repo"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Branch (optional)
                </label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono
                             focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="main"
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
