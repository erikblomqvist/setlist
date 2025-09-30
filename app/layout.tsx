import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
	title: 'Nyléns Setlists',
	description: 'Hantera dina bandsetlists',
	icons: {
		icon: '/favicon.png',
		shortcut: '/favicon.png',
		apple: '/favicon.png',
	},
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="sv">
			<body>{children}</body>
		</html>
	)
}
