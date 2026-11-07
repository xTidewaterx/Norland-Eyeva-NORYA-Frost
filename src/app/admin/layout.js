export default async function AdminLayout({ children }) {
  // In a real app, you'd verify the admin session here
  // For now, the client-side check in the page component handles it
  // This is a placeholder for server-side protection
  
  return children;
}