"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("user" | "admin")[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (
      role !== "user" &&
      role !== "admin"
    ) {
      router.replace("/login");
      return;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
      router.replace("/");
      return;
    }

    setAuthorized(true);
  }, [router, allowedRoles]);

  if (!authorized) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-600">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}