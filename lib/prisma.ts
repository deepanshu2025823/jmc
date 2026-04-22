import { PrismaClient, Prisma } from '@prisma/client'

function createPrismaClient() {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          let lastError: unknown
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              return await query(args)
            } catch (e) {
              if (e instanceof Prisma.PrismaClientInitializationError && attempt < 3) {
                lastError = e
                await new Promise<void>((r) => setTimeout(r, 2000 * attempt))
              } else {
                throw e
              }
            }
          }
          throw lastError
        },
      },
    },
  })
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>

const globalForPrisma = globalThis as typeof globalThis & {
  prismaGlobal?: ExtendedPrismaClient
}

const prisma = globalForPrisma.prismaGlobal ?? createPrismaClient()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaGlobal = prisma
