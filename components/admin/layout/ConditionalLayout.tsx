"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/layout/app-sidebar";

/**
 * Wraps admin pages with the sidebar layout.
 * The login page ("/") renders without the sidebar.
 */
export function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full h-screen overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-auto h-full">{children}</main>
      </div>
    </SidebarProvider>
  );
}
