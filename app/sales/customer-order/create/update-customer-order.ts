'use server'

import prisma from '@/app/db/db'
import { generateDocumentNumber } from '@/actions/generateDocumentNumber'
import { DocumentItem } from '@/types/document-item'
import { Contact } from '@prisma/client'
import { z } from 'zod'
import { fromZodError } from 'zod-validation-error'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { DocumentDetail } from '@/types/document-detail'

export async function updateCustomerOrder(
    id: number,
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        documentNo,
    }: DocumentDetail,
    items: (DocumentItem & { description: string })[],
    payments: {
        id: number
        amount: number
    }[],
    remarks: { id?: number; remark: string }[]
) {
    const customerOrder = await prisma.document.findUnique({
        where: {
            id,
        },
        include: {
            CustomerOrder: {
                include: {
                    GeneralLedger: true,
                    Contact: true,
                    PurchasOrderLink: true,
                    CustomerOrderItem: true,
                },
            },
        },
    })
    const getContact = async () => {
        if (contactId) {
            const contact = await prisma.contact.findUnique({
                where: {
                    id: Number(contactId),
                },
            })
            if (!contact) {
                throw new Error('contact not found')
            }
            return contact
        }
    }
    let contact: Contact | undefined = await getContact()

    // const goodsMasters = await prisma.goodsMaster.findMany({
    //     where: {
    //         barcode: {
    //             in: items
    //                 .map((item) => item.barcode)
    //                 .filter((barcode) => typeof barcode === 'string'),
    //         },
    //     },
    // })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('CO', date)
    }
    const session = await getServerSession(authOptions)

    const deleteGeneralLedger = prisma.generalLedger.deleteMany({
        where: {
            customerOrderId: customerOrder?.CustomerOrder?.id,
        },
    })
    const updatedCustomerOrder = prisma.document.update({
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
            DocumentRemark: { create: remarks },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,

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
                            pricePerUnit: item.pricePerUnit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            barcode: item.barcode,
                            unit: item.unit,
                        })),
                    },
                    GeneralLedger: {
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
                                              (acc, payment) =>
                                                  acc - payment.amount,
                                              0
                                          ),
                                      },
                                  ]
                                : undefined,
                    },
                },
            },
        },
    })

    const result = await prisma.$transaction([
        deleteGeneralLedger,
        updatedCustomerOrder,
    ])

    revalidatePath('/sales/customer-order')
    redirect(`/sales/customer-order/${result[1].documentNo}`)
}
