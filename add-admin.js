const { PrismaClient } = require('@prisma/client')

async function addAdmin() {
  const prisma = new PrismaClient()
  
  try {
    // Replace with your actual Gmail address and name
    const user = await prisma.user.create({
      data: {
        email: 'erik.blomqvist@gmail.com', // ← Change this to your Gmail
        name: 'Erik', // ← Change this to your name
        role: 'admin'
      }
    })
    
    console.log('✅ Admin user created:', user)
  } catch (error) {
    console.error('❌ Error creating user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addAdmin()
