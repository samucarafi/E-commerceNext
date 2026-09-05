import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/User";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await connectMongoDB();

  const users = await User.find({})
    .select("name email role verified createdAt")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <section>
      <h1 className="font-serif text-4xl">Usuários</h1>
      <p className="mt-2 text-sm text-gray-500">
        Usuários cadastrados na plataforma.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[#e8ddd0] bg-white">
        {users.map((user) => (
          <div
            key={String(user._id)}
            className="flex flex-col gap-2 border-b border-[#f2ece6] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>

            <div className="flex gap-2 text-xs">
              <span className="rounded-full bg-[#eee4da] px-3 py-1">
                {user.role}
              </span>
              <span className="rounded-full bg-[#f5f1ed] px-3 py-1">
                {user.verified ? "Verificado" : "Não verificado"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
