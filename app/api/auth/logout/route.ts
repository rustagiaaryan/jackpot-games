import { NextResponse } from "next/server";
import { destroyAuthSession } from "@/lib/auth";
import { withErrors } from "@/lib/api";

export const POST = withErrors(async () => {
  await destroyAuthSession();
  return NextResponse.json({ ok: true });
});
