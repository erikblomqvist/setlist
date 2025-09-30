import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Setlist Manager',
  description: 'Manage your band setlists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
