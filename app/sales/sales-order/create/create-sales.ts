// 'use server'

// import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
// import prisma from '@/app/db/db'
// import { Contact, Prisma } from '@prisma/client'
// import { format } from 'date-fns'
// import { getServerSession } from 'next-auth'
// import { revalidatePath } from 'next/cache'
// import { z } from 'zod'
// import { fromZodError } from 'zod-validation-error'
// import { InventoryDetailType } from '@/types/inventory-detail'
// import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
// import { redirect } from 'next/navigation'
// import { calculateArPaymentStatus } from '@/lib/calculate-payment-status'

// export const createSales = async (input: Prisma.DocumentCreateInput) => {
//     const session = await getServerSession(authOptions)
//     if (!session) {
//         redirect('/login')
//     }

//     if (input.type !== 'Sales') throw new Error('Invalid Document Type')
//     if (
//         !Array.isArray(input.Sales?.create?.SalesItem?.create) ||
//         input.Sales?.create?.SalesItem?.create.length === 0
//     ) {
//         throw new Error('Sales Item cannot be empty')
//     }
//     const salesItems = [...input.Sales?.create?.SalesItem?.create]

//     salesItems[0]

// }
