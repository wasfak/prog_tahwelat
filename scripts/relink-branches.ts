import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { dbConnect } = await import("../lib/mongoose");
  const { Branch, Code } = await import("../models");

  await dbConnect();

  const allBranches =
    await Branch.find().lean<{ _id: unknown; name: string }[]>();
  const byName = new Map(
    allBranches.map((b) => [b.name.trim().toLowerCase(), b._id]),
  );

  const codes = await Code.find({ toBranchId: null }).lean<
    {
      _id: unknown;
      toBranchRaw: string | null;
      fromBranchRaw: string | null;
    }[]
  >();

  console.log(`Found ${codes.length} unlinked codes`);

  let fixed = 0;
  for (const code of codes) {
    const toId = byName.get(code.toBranchRaw?.trim().toLowerCase() ?? "");
    const fromId = byName.get(code.fromBranchRaw?.trim().toLowerCase() ?? "");

    if (toId || fromId) {
      const updateData: Record<string, unknown> = {};
      if (toId) updateData.toBranchId = toId;
      if (fromId) updateData.fromBranchId = fromId;

      await Code.updateOne(
        { _id: code._id },
        {
          $set: updateData,
        },
      );
      fixed++;
    }
  }

  console.log(`✅ Fixed ${fixed} codes`);
  process.exit(0);
}

main().catch(console.error);
