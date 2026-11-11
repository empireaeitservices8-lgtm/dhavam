import { ReactNode } from "react";
import ProtectedRoute from "@/components/protectedRoute";
import AdminHeader from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminHeader/>
      {children}
    </ProtectedRoute>
  );
}