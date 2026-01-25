"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin/dashboard");
    } else if (status === "unauthenticated") {
      router.replace("/admin/login");
    }
  }, [status, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-emerald-500 animate-spin" />
    </div>
  );
}
