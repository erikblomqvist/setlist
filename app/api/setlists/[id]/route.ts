import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const setlist = await prisma.setlist.findUnique({
      where: { id: params.id },
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, numberOfSets, songs } = await req.json()

    // Update setlist basic info
    const setlist = await prisma.setlist.update({
      where: { id: params.id },
      data: {
        name,
        numberOfSets
      }
    })

    // If songs are provided, update them
    if (songs) {
      // Delete existing songs
      await prisma.setlistSong.deleteMany({
        where: { setlistId: params.id }
      })

      // Create new songs
      if (songs.length > 0) {
        await prisma.setlistSong.createMany({
          data: songs.map((song: any) => ({
            setlistId: params.id,
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
      where: { id: params.id },
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.setlist.delete({
      where: { id: params.id }
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
