import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user) {
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
    const session = await auth()
    
    if (!session?.user) {
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
        createdBy: (session.user as any).id
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
