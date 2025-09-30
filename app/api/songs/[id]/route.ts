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

export async function PUT(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { authorized } = await checkUserAuth()

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

		const { id } = await params
		const song = await prisma.song.update({
			where: { id },
			data: {
				title,
				key: key || null,
				tempo: tempo || null
			},
			include: {
				user: {
					select: {
						name: true
					}
				}
			}
		})

		return NextResponse.json(song)
	} catch (error) {
		console.error("Error updating song:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { authorized } = await checkUserAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { id } = await params
		await prisma.song.delete({
			where: { id }
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error deleting song:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
