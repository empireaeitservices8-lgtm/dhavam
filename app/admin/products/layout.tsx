import { ReactNode } from "react";
import ProtectedRoute from "@/components/protectedRoute";

export const instant = false;

export default function ProductsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
    
      {children}
    </ProtectedRoute>
  );
}
