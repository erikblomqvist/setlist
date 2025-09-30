import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
	try {
		const session = await auth()

		if (!session?.user?.email) {
			return NextResponse.json({ authorized: false }, { status: 401 })
		}

		// Check if user exists in our database
		const user = await prisma.user.findUnique({
			where: { email: session.user.email }
		})

		if (!user) {
			return NextResponse.json({ authorized: false }, { status: 403 })
		}

		return NextResponse.json({
			authorized: true,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			}
		})
	} catch (error) {
		return NextResponse.json({ authorized: false }, { status: 500 })
	}
}
