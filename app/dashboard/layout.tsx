import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Navbar from "@/components/Navbar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <>
      <Navbar 
        userName={session.user.name || session.user.email || "User"} 
        userRole={(session.user as any).role}
      />
      <main style={{ padding: "32px 20px", maxWidth: "1400px", margin: "0 auto" }}>
        {children}
      </main>
    </>
  )
}
