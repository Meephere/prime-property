import { headers } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/lib/db";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import ElegantBackground from "@/components/elegant-bg";
import PageAnimate from "@/components/page-animate";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: { nama: string; email: string; role: "ADMIN" | "SUPERADMIN" } = { nama: "Agent", email: "", role: "ADMIN" };
  let isAuthenticated = false;

  // 1. Coba autentikasi via Clerk first
  try {
    const { userId } = await auth();
    if (userId) {
      const clerkUser = await currentUser();
      if (clerkUser) {
        const email = clerkUser.emailAddresses[0]?.emailAddress;
        if (email) {
          const dbUser = await db.user.findUnique({
            where: { email },
          });

          if (dbUser && dbUser.status === "ACTIVE") {
            user = {
              nama: dbUser.nama,
              email: dbUser.email,
              role: dbUser.role as "ADMIN" | "SUPERADMIN",
            };
            isAuthenticated = true;
          }
        }
      }
    }
  } catch (clerkError) {
    console.warn("Autentikasi Clerk gagal di dashboard layout, mencoba fallback header:", clerkError);
  }

  // 2. Jika Clerk tidak aktif / tidak login, coba fallback ke header (dari JWT cookie kustom lama)
  if (!isAuthenticated) {
    const headersList = await headers();
    const id = headersList.get("x-agent-id");
    const email = headersList.get("x-agent-email") || "";
    const nama = headersList.get("x-agent-nama") || "Agent";
    const role = (headersList.get("x-agent-role") as "ADMIN" | "SUPERADMIN") || "ADMIN";

    if (id) {
      user = { nama, email, role };
      isAuthenticated = true;
    }
  }

  // 3. Jika tidak lolos autentikasi sama sekali, arahkan ke login
  if (!isAuthenticated) {
    redirect("/agent/login");
  }

  const { role } = user;

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
