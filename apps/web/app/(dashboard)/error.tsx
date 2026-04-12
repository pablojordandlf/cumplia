'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Dashboard Error]', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center space-y-4 max-w-md p-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Algo salió mal
        </h2>
        <p className="text-sm text-gray-500 font-mono bg-gray-100 p-3 rounded text-left break-words">
          {error.message || 'Error desconocido'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-400">Digest: {error.digest}</p>
        )}
        <Button onClick={() => reset()}>Reintentar</Button>
      </div>
    </div>
  );
}
