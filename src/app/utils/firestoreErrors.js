export function isFirestoreOfflineError(error) {
  const code = String(error?.code || '').toLowerCase();
  const message = String(error?.message || '').toLowerCase();

  return (
    (code === 'unavailable' || code === 'firestore/unavailable') &&
    message.includes('offline')
  );
}
