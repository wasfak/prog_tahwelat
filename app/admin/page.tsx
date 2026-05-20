import { dbConnect } from "@/lib/mongoose";
import { Branch, User, Batch, Code } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  await dbConnect();

  const [branchCount, userCount, batchCount, codeCount] = await Promise.all([
    Branch.countDocuments(),
    User.countDocuments(),
    Batch.countDocuments(),
    Code.countDocuments(),
  ]);

  const stats = [
    { label: "Branches", value: branchCount },
    { label: "Users", value: userCount },
    { label: "Batches", value: batchCount },
    { label: "Codes", value: codeCount },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
