// components/UserBanner.js
export default function UserBanner({ user }) {
  if (!user) return null;

  return (
    <div className="bg-blue-900 text-white flex items-center gap-6 p-6 rounded-lg shadow-lg">
      <img
        src={user.avatar}
        alt={user.name}
        className="w-20 h-20 object-cover rounded-full border-4 border-white"
      />
      <div>
        <h2 className="text-2xl font-bold">{user.name}</h2>
        <p className="text-blue-200">{user.title}</p>
      </div>
    </div>
  );
}