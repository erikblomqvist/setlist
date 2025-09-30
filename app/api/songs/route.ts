import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

async function checkUserAuth() {
	const session = await auth()

	if (!session?.user?.email) {
		return { authorized: false, user: null }
	}

	const user = await prisma.user.findUnique({
		where: { email: session.user.email }
	})

	if (!user) {
		return { authorized: false, user: null }
	}

	return { authorized: true, user }
}

export async function GET() {
	try {
		const { authorized } = await checkUserAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const songs = await prisma.song.findMany({
			include: {
				user: {
					select: {
						name: true
					}
				}
			},
			orderBy: {
				title: 'asc'
			}
		})

		return NextResponse.json(songs)
	} catch (error) {
		console.error("Error fetching songs:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}

export async function POST(req: NextRequest) {
	try {
		const { authorized, user } = await checkUserAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { title, key, tempo } = await req.json()

		if (!title) {
			return NextResponse.json(
				{ error: "Title is required" },
				{ status: 400 }
			)
		}

		const song = await prisma.song.create({
			data: {
				title,
				key: key || null,
				tempo: tempo || null,
				createdBy: user!.id
			},
			include: {
				user: {
					select: {
						name: true
					}
				}
			}
		})

		return NextResponse.json(song, { status: 201 })
	} catch (error) {
		console.error("Error creating song:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
