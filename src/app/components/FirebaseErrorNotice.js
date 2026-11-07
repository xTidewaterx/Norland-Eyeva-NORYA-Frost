'use client';

export default function FirebaseErrorNotice({ source, error }) {
  if (process.env.NODE_ENV !== 'development' || !error) {
    return null;
  }

  return (
    <div
      role="alert"
      className="mx-auto my-4 max-w-4xl rounded border border-red-300 bg-red-50 p-4 text-left font-mono text-xs text-red-950"
    >
      <p className="font-bold">Firebase diagnostic (development only)</p>
      <p className="mt-1">Source: {error.source || source}</p>
      <p>Code: {error.code || 'unknown'}</p>
      <p className="break-words">Message: {error.message || String(error)}</p>
      {error.detail && <p className="break-words">Detail: {error.detail}</p>}
    </div>
  );
}
