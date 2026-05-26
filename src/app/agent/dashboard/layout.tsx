import { headers } from "next/headers";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import ElegantBackground from "@/components/elegant-bg";
import PageAnimate from "@/components/page-animate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const nama = headersList.get("x-agent-nama") || "Agent";
  const email = headersList.get("x-agent-email") || "";
  const role = headersList.get("x-agent-role") || "ADMIN";

  const user = { nama, email, role };

  return (
    <div className="flex h-screen overflow-hidden bg-[#111111] text-zinc-150">
      {/* Sidebar navigation */}
      <Sidebar role={role} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#111111]">
        {/* Header bar */}
        <Header user={user} />
        
        {/* Viewport content */}
        <main className="flex-1 overflow-y-auto bg-[#111111] p-4 sm:p-6 lg:p-8 relative dashboard-scroll">
          {/* Aesthetic background elements */}
          <ElegantBackground mode="dark" />

          <div className="relative z-10">
            <PageAnimate>
              {children}
            </PageAnimate>
          </div>
        </main>
      </div>
    </div>
  );
}
