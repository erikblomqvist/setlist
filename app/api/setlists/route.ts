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

    const setlists = await prisma.setlist.findMany({
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
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json(setlists)
  } catch (error) {
    console.error("Error fetching setlists:", error)
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

    const { name, numberOfSets } = await req.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    const setlist = await prisma.setlist.create({
      data: {
        name,
        numberOfSets: numberOfSets || 1,
        createdBy: user!.id
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
        }
      }
    })

    return NextResponse.json(setlist, { status: 201 })
  } catch (error) {
    console.error("Error creating setlist:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
