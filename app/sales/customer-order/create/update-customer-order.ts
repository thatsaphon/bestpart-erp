'use server'

import prisma from '@/app/db/db'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { InventoryDetailType } from '@/types/inventory-detail'
import { Contact } from '@prisma/client'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateCustomerOrder(
    id: number,
    formData: FormData,
    items: (InventoryDetailType & { description: string })[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) {
    const validator = z.object({
        customerId: z.string().trim().nullable(),
        contactName: z.string().trim().optional(),
        address: z.string().trim().optional(),
        phone: z.string().trim().optional().nullable(),
        taxId: z.string().trim().optional().nullable(),
        date: z.string().trim().min(1, 'date must not be empty'),
        documentNo: z.string().trim().optional().nullable(),
    })

    const result = validator.safeParse({
        customerId: formData.get('customerId'),
        contactName: formData.get('contactName') || undefined,
        address: formData.get('address') || undefined,
        phone: formData.get('phone') || undefined,
        taxId: formData.get('taxId') || undefined,
        date: formData.get('date'),
        documentNo: formData.get('documentNo'),
    })

    if (!result.success) {
        throw new Error(
            fromZodError(result.error, {
                prefix: '- ',
                prefixSeparator: ' ',
                includePath: false,
                issueSeparator: '\n',
            }).message
        )
    }
    let { customerId, contactName, address, phone, taxId, date, documentNo } =
        result.data

    const customerOrder = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            GeneralLedger: true,
            CustomerOrder: {
                include: {
                    Contact: true,
                    PurchasOrderLink: true,
                    CustomerOrderItem: true,
                },
            },
        },
    })
    const getContact = async () => {
        if (customerId) {
            const contact = await prisma.contact.findUnique({
                where: {
                    id: Number(customerId),
                },
            })
            if (!contact) {
                throw new Error('contact not found')
            }
            return contact
        }
    }
    let contact: Contact | undefined = await getContact()

    const goodsMasters = await prisma.goodsMaster.findMany({
        where: {
            barcode: {
                in: items.map((item) => item.barcode),
            },
        },
    })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('CO', date)
    }
    const session = await getServerSession(authOptions)

    const updatedCustomerOrder = await prisma.document.update({
        where: {
            id,
        },
        data: {
            contactName: contactName || '',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            remark: { create: remarks },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,
            GeneralLedger: {
                deleteMany: {
                    id: {
                        in:
                            customerOrder?.GeneralLedger.map((gl) => gl.id) ||
                            [],
                    },
                },
                create:
                    payments.length > 0
                        ? [
                              ...payments.map((payment) => ({
                                  chartOfAccountId: payment.id,
                                  amount: payment.amount,
                              })),
                              {
                                  //เงินมัดจำ
                                  chartOfAccountId: 22300,
                                  amount: payments.reduce(
                                      (acc, payment) => acc - payment.amount,
                                      0
                                  ),
                              },
                          ]
                        : undefined,
            },
            CustomerOrder: {
                update: {
                    Contact: {
                        connect: { id: contact?.id },
                    },
                    deposit: payments.reduce(
                        (acc, payment) => acc + payment.amount,
                        0
                    ),
                    CustomerOrderItem: {
                        deleteMany: {
                            id: {
                                in:
                                    customerOrder?.CustomerOrder?.CustomerOrderItem.map(
                                        (item) => item.id
                                    ) || [],
                            },
                        },
                        create: items.map((item) => ({
                            description: item.description,
                            price: item.price,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            barcode: item.barcode,
                            unit: item.unit,
                        })),
                    },
                    // status: 'Open',
                },
            },
        },
    })

    revalidatePath('/sales/customer-order')
    redirect(`/sales/customer-order/${updatedCustomerOrder.documentNo}`)
}
