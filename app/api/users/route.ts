import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function checkAdminAuth() {
	const session = await auth()

	if (!session?.user?.email) {
		return { authorized: false, user: null }
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email }
	})

	if (!user || user.role !== 'admin') {
		return { authorized: false, user: null }
	}

	return { authorized: true, user }
}

export async function POST(req: NextRequest) {
	try {
		const { authorized, user } = await checkAdminAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { email, name, role } = await req.json()

		if (!email || !name) {
			return NextResponse.json(
				{ error: "Email and name are required" },
				{ status: 400 }
			)
		}

		const existingUser = await prisma.user.findUnique({
			where: { email }
		})

		if (existingUser) {
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 }
			)
		}

		const newUser = await prisma.user.create({
			data: {
				email,
				name,
				role: role || 'user'
			},
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true
			}
		})

		return NextResponse.json(newUser, { status: 201 })
	} catch (error) {
		console.error("Error creating user:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}

export async function GET() {
	try {
		const { authorized } = await checkAdminAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const users = await prisma.user.findMany({
			select: {
				id: true,
				email: true,
				name: true,
				role: true,
				createdAt: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		})

		return NextResponse.json(users)
	} catch (error) {
		console.error("Error fetching users:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
