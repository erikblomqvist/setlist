import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

async function checkUserAuth() {
	const session = await auth()
	if (!session?.user?.email) {
		return null
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email }
	})

	return user
}

export async function GET() {
	try {
		const user = await checkUserAuth()
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const categories = await prisma.category.findMany({
			orderBy: { name: 'asc' },
			include: {
				_count: {
					select: { setlists: true }
				}
			}
		})

		return NextResponse.json(categories)
	} catch (error) {
		console.error("Error fetching categories:", error)
		return NextResponse.json(
			{ error: "Failed to fetch categories" },
			{ status: 500 }
		)
	}
}

export async function POST(request: Request) {
	try {
		const user = await checkUserAuth()
		if (!user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { name, color } = await request.json()

		if (!name || !color) {
			return NextResponse.json(
				{ error: "Name and color are required" },
				{ status: 400 }
			)
		}

		const category = await prisma.category.create({
			data: { name, color }
		})

		return NextResponse.json(category)
	} catch (error) {
		console.error("Error creating category:", error)
		return NextResponse.json(
			{ error: "Failed to create category" },
			{ status: 500 }
		)
	}
}
