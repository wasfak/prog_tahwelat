import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function main() {
  const { dbConnect } = await import("../lib/mongoose");
  const { User } = await import("../models");
  const bcrypt = (await import("bcryptjs")).default;

  await dbConnect();

  const username = "wasfyz";
  const password = "Jvaledyd12@";

  const existing = await User.findOne({ username });
  if (existing) {
    console.log(`⚠️  User "${username}" already exists`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await User.create({
    username,
    passwordHash,
    role: "admin",
  });

  console.log(
    `✅ Admin created — username: ${username}, password: ${password}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
