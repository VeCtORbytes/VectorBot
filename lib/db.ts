import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

/**
 * `pg` warns that the SSL modes `prefer`, `require`, and `verify-ca` are all
 * treated as aliases for `verify-full`. Normalize to `verify-full` explicitly
 * so the (identical) behavior stays but the warning stops firing on every query.
 */
function resolveConnectionString() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return url;
  }

  const parsed = new URL(url);
  const sslmode = parsed.searchParams.get("sslmode");
  if (sslmode && ["prefer", "require", "verify-ca"].includes(sslmode)) {
    parsed.searchParams.set("sslmode", "verify-full");
  }

  return parsed.toString();
}

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

declare global {
  var prismaGlobal: ReturnType<typeof createPrismaClient> | undefined;
}

export const db = globalThis.prismaGlobal ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = db;
}
