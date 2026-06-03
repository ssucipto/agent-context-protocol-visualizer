import { useState, useEffect } from 'react';
import { shutdown, getServerInfo } from '../../server/routes/api/shutdown';

/**
 * Displays server port and data source in the header.
 */
export function ServerInfoDisplay() {
  const [info, setInfo] = useState<{ port: string; dataSource: string; sourceType: string } | null>(null);

  useEffect(() => {
    getServerInfo().then(setInfo).catch(() => {});
  }, []);

  if (!info) return null;

  const dsShort = info.dataSource.length > 50
    ? '…' + info.dataSource.slice(-47)
    : info.dataSource;

  return (
    <span className="text-xs text-gray-400 font-mono">
      :{info.port} · {info.sourceType === 'github' ? '🌐 ' : '📁 '}{dsShort}
    </span>
  );
}

/**
 * Stop Server button — calls /api/shutdown and shows confirmation.
 */
export function StopServerButton() {
  const [stopped, setStopped] = useState(false);

  const handleStop = async () => {
    try {
      await shutdown();
    } catch {
      // Server already shutting down, response may not arrive
    }
    setStopped(true);
  };

  if (stopped) {
    return (
      <span className="text-xs text-gray-400 italic font-mono">
        🛑 Server stopped · Close this tab
      </span>
    );
  }

  return (
    <button
      onClick={handleStop}
      className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 font-mono transition-colors"
      title="Stop the server"
    >
      ⏹ Stop
    </button>
  );
}
