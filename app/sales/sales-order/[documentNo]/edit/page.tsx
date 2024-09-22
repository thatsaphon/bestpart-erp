import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from '../../create/create-update-sales-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import { getPaymentMethods } from '@/actions/get-payment-methods'
import Link from 'next/link'
import { getDate, isBefore, startOfDay } from 'date-fns'
import { Metadata, ResolvingMetadata } from 'next'
import { getSalesDefaultFunction } from '@/types/sales/sales'
import { getDepositAmount } from '@/actions/get-deposit-amount'
import { getCustomerOrderDefaultFunction } from '@/types/customer-order/customer-order'
import { getQuotationDefaultFunction } from '@/types/quotation/quotation'

type Props = { params: { documentNo: string } }

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    return {
        title: `แก้ไขบิลขาย - ${params.documentNo}`,
    }
}

export default async function EditSalesInvoicePage({
    params: { documentNo },
}: Props) {
    const [document] = await getSalesDefaultFunction({
        documentNo,
        type: 'Sales',
    })
    const paymentMethods = await getPaymentMethods()
    const pendingOrExistingCustomerOrders = document.Sales?.contactId
        ? await getCustomerOrderDefaultFunction({
              OR: [
                  {
                      CustomerOrder: {
                          contactId: document.Sales.contactId,
                          status: {
                              notIn: ['Cancelled', 'Closed'],
                          },
                      },
                  },
                  {
                      id: {
                          in: document.Sales.CustomerOrder.map(
                              (x) => x.documentId
                          ),
                      },
                  },
              ],
          })
        : []
    const quotations = document.Sales?.contactId
        ? await getQuotationDefaultFunction({
              Quotation: {
                  contactId: document.Sales?.contactId,
              },
          })
        : []

    const depositAmount = document.Sales?.contactId
        ? await getDepositAmount(document.Sales?.contactId)
        : 0

    return (
        <>
            <div className="flex justify-between">
                <Link
                    href={`/sales/sales-order/${documentNo}`}
                    className="text-primary/50 underline hover:text-primary"
                >{`< ย้อนกลับ`}</Link>

                {/* <Link href="/sales/create">
                    <Button
                        variant="ghost"
                        className="mb-2"
                    >{`Create New`}</Button>
                </Link> */}
            </div>
            <h1 className="my-2 text-3xl transition-colors">
                แก้ไขรายละเอียดบิลขาย
            </h1>
            <CreateOrUpdateSalesInvoiceComponent
                existingSales={document}
                paymentMethods={paymentMethods}
                quotations={quotations}
                pendingOrExistingCustomerOrders={
                    pendingOrExistingCustomerOrders
                }
                depositAmount={depositAmount}
            />
        </>
    )
}
