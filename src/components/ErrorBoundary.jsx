import { AlertTriangle } from 'lucide-react';

export const ErrorBoundary = ({ error }) => {
  return (
    <div className="p-4 md:p-8 flex justify-center items-center h-full">
      <div className="text-center bg-white p-10 rounded-xl shadow-lg max-w-md">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-700">Error</h2>
        <p className="text-slate-500 mt-2">{error}</p>
      </div>
    </div>
  )
};