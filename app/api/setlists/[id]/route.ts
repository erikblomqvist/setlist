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
    const { name, numberOfSets, songs } = await req.json()

    // Update setlist basic info
    const setlist = await prisma.setlist.update({
      where: { id },
      data: {
        name,
        numberOfSets
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
