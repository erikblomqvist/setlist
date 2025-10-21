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

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { authorized } = await checkUserAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { id } = await params
		const setlist = await prisma.setlist.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						name: true
					}
				},
				songs: {
					include: {
						song: true
					},
					orderBy: [
						{ setNumber: 'asc' },
						{ position: 'asc' }
					]
				},
				categories: {
					select: {
						id: true,
						name: true,
						color: true
					}
				}
			}
		})

		if (!setlist) {
			return NextResponse.json(
				{ error: "Setlist not found" },
				{ status: 404 }
			)
		}

		return NextResponse.json(setlist)
	} catch (error) {
		console.error("Error fetching setlist:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
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

    const { id } = await params
    const { name, numberOfSets, songs, categoryIds, date } = await req.json()

    // Update setlist basic info
    const setlist = await prisma.setlist.update({
      where: { id },
      data: {
        name,
        numberOfSets,
        date: date !== undefined ? (date ? new Date(date) : null) : undefined,
        categories: categoryIds !== undefined ? {
          set: categoryIds.map((catId: string) => ({ id: catId }))
        } : undefined
      }
    })

		// If songs are provided, update them
		if (songs) {
			// Delete existing songs
			await prisma.setlistSong.deleteMany({
				where: { setlistId: id }
			})

			// Create new songs
			if (songs.length > 0) {
				await prisma.setlistSong.createMany({
					data: songs.map((song: any) => ({
						setlistId: id,
						songId: song.songId,
						setNumber: song.setNumber,
						position: song.position,
						comments: song.comments || null,
						backgroundColor: song.backgroundColor || null
					}))
				})
			}
		}

		// Fetch updated setlist with songs
		const updatedSetlist = await prisma.setlist.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						name: true
					}
				},
				songs: {
					include: {
						song: true
					},
					orderBy: [
						{ setNumber: 'asc' },
						{ position: 'asc' }
					]
				},
				categories: {
					select: {
						id: true,
						name: true,
						color: true
					}
				}
			}
		})

		return NextResponse.json(updatedSetlist)
	} catch (error) {
		console.error("Error updating setlist:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { authorized, user } = await checkUserAuth()

		if (!authorized) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { id } = await params
		
		// Get the original setlist with all its data
		const originalSetlist = await prisma.setlist.findUnique({
			where: { id },
			include: {
				songs: {
					include: {
						song: true
					},
					orderBy: [
						{ setNumber: 'asc' },
						{ position: 'asc' }
					]
				},
				categories: {
					select: {
						id: true,
						name: true,
						color: true
					}
				}
			}
		})

		if (!originalSetlist) {
			return NextResponse.json(
				{ error: "Setlist not found" },
				{ status: 404 }
			)
		}

		// Create the duplicated setlist
		const duplicatedSetlist = await prisma.setlist.create({
			data: {
				name: `${originalSetlist.name} (Kopia)`,
				numberOfSets: originalSetlist.numberOfSets,
				date: originalSetlist.date,
				createdBy: user!.id,
				categories: {
					connect: originalSetlist.categories.map(cat => ({ id: cat.id }))
				}
			},
			include: {
				user: {
					select: {
						name: true
					}
				},
				songs: {
					include: {
						song: true
					}
				},
				categories: {
					select: {
						id: true,
						name: true,
						color: true
					}
				}
			}
		})

		// Copy all the songs from the original setlist
		if (originalSetlist.songs.length > 0) {
			await prisma.setlistSong.createMany({
				data: originalSetlist.songs.map(setlistSong => ({
					setlistId: duplicatedSetlist.id,
					songId: setlistSong.songId,
					setNumber: setlistSong.setNumber,
					position: setlistSong.position,
					comments: setlistSong.comments,
					backgroundColor: setlistSong.backgroundColor
				}))
			})
		}

		// Fetch the complete duplicated setlist with songs
		const completeDuplicatedSetlist = await prisma.setlist.findUnique({
			where: { id: duplicatedSetlist.id },
			include: {
				user: {
					select: {
						name: true
					}
				},
				songs: {
					include: {
						song: true
					},
					orderBy: [
						{ setNumber: 'asc' },
						{ position: 'asc' }
					]
				},
				categories: {
					select: {
						id: true,
						name: true,
						color: true
					}
				}
			}
		})

		return NextResponse.json(completeDuplicatedSetlist, { status: 201 })
	} catch (error) {
		console.error("Error duplicating setlist:", error)
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
		await prisma.setlist.delete({
			where: { id }
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error deleting setlist:", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
