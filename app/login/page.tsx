import { Suspense } from "react";
import { LoginFlow } from "@/components/LoginFlow";

export const metadata = { title: "Log in — Jackpot Arcade" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-14">
      <Suspense>
        <LoginFlow />
      </Suspense>
    </div>
  );
}
