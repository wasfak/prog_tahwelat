import { dbConnect } from "@/lib/mongoose";
import { Branch, User } from "@/models";
import { ImportCard, AddBranchCard } from "./branches-client";

type LeanBranch = { _id: unknown; name: string; createdAt: Date };
type LeanUser = { username: string; branchId: unknown };

export default async function AdminBranchesPage() {
  await dbConnect();

  const branches = await Branch.find()
    .sort({ createdAt: -1 })
    .lean<LeanBranch[]>();

  const branchUsers = await User.find({ role: "branch" }).lean<LeanUser[]>();
  const userByBranch = new Map(
    branchUsers.map((u) => [String(u.branchId), u.username]),
  );

  const rows = branches.map((b) => ({
    id: String(b._id),
    name: b.name,
    username: userByBranch.get(String(b._id)) ?? "—",
    createdAt: b.createdAt.toISOString().slice(0, 10),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Branches</h1>
        <p className="text-slate-500 mt-1">{rows.length} branches total</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImportCard />
        <AddBranchCard />
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-200/70 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/70 border-b border-slate-200">
            <tr>
              <th className="text-left font-medium text-slate-600 px-5 py-3">
                Branch
              </th>
              <th className="text-left font-medium text-slate-600 px-5 py-3">
                Username
              </th>
              <th className="text-left font-medium text-slate-600 px-5 py-3">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-12 text-center text-slate-400"
                >
                  No branches yet
                </td>
              </tr>
            ) : (
              rows.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {b.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono">
                    {b.username}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500">{b.createdAt}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
