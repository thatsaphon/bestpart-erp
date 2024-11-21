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
import { Payment } from '@/types/payment/payment'

export async function createCustomerOrder(
    {
        contactId,
        contactName,
        address,
        phone,
        taxId,
        date,
        documentNo,
    }: DocumentDetail,
    items: DocumentItem[],
    payments: Payment[],
    remarks: { id?: number; remark: string }[]
) {
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
    //             in: items.map((item) => item.barcode),
    //         },
    //     },
    // })

    if (!documentNo) {
        documentNo = await generateDocumentNumber('CO', date)
    }
    const session = await getServerSession(authOptions)

    const customerOrder = await prisma.document.create({
        data: {
            contactName: contactName || '',
            type: 'CustomerOrder',
            address: address || '',
            phone: phone || '',
            taxId: taxId || '',
            date: new Date(date),
            documentNo: documentNo,
            DocumentRemark: {
                create: remarks.map(({ remark }) => ({
                    remark,
                    userId: session?.user.id,
                })),
            },
            createdBy: session?.user.first_name,
            updatedBy: session?.user.first_name,

            // GeneralLedger: {
            //     create:
            //         payments.length > 0
            //             ? [
            //                   ...payments.map((payment) => ({
            //                       chartOfAccountId: payment.id,
            //                       amount: payment.amount,
            //                   })),
            //                   {
            //                       //เงินมัดจำ
            //                       chartOfAccountId: 22300,
            //                       amount: payments.reduce(
            //                           (acc, payment) => acc - payment.amount,
            //                           0
            //                       ),
            //                   },
            //               ]
            //             : undefined,
            // },
            CustomerOrder: {
                create: {
                    Contact: {
                        connect: { id: contact?.id },
                    },
                    deposit: payments.reduce(
                        (acc, payment) => acc + payment.amount,
                        0
                    ),
                    CustomerOrderItem: {
                        create: items.map((item) => ({
                            description: item.name,
                            pricePerUnit: item.pricePerUnit,
                            quantityPerUnit: item.quantityPerUnit,
                            quantity: item.quantity,
                            barcode: item.barcode,
                            unit: item.unit,
                        })),
                    },
                    status: 'Pending',
                    GeneralLedger: {
                        create:
                            payments.length > 0
                                ? [
                                      ...payments.map((payment) => ({
                                          chartOfAccountId:
                                              payment.chartOfAccountId,
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

            // Quotation: {
            //     create: {
            //         QuotationItem: {
            //             create: items.map((item) => ({
            //                 goodsMasterId: item.goodsMasterId,
            //                 skuMasterId: item.skuMasterId,
            //                 barcode: String(item.barcode),
            //                 unit: item.unit,
            //                 quantityPerUnit: item.quantityPerUnit,
            //                 quantity: item.quantity,
            //                 price: +((100 / 107) * item.price).toFixed(2),
            //                 vat: +((7 / 107) * item.price).toFixed(2),
            //             })),
            //         },
            //         Contact: {
            //             connect: {
            //                 id: contact?.id,
            //             },
            //         },
            //     },
            // },
        },
    })

    revalidatePath('/sales/customer-order')
    redirect(`/sales/customer-order/${customerOrder.documentNo}`)
}
