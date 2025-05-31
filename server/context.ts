import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import clientPromise from "../lib/mongodb";

export async function createContext(opts: CreateNextContextOptions) {
  const session = await getServerSession(opts.req, opts.res, authOptions);
  const client = await clientPromise;
  const db = client.db("reference-management");

  return {
    session,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
