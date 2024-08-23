import prisma from '@/app/db/db'
import React from 'react'
import CreateOrUpdateSalesInvoiceComponent from '../../create/create-update-sales-invoice-component'
import {
    DocumentRemark,
    MainSkuRemark,
    Prisma,
    SkuMasterRemark,
} from '@prisma/client'
import { getPaymentMethods } from '@/app/actions/accounting'
import Link from 'next/link'
import { getDate, isBefore, startOfDay } from 'date-fns'
import { Metadata, ResolvingMetadata } from 'next'
import { getSalesDefaultFunction } from '@/types/sales'

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

    // const defaultPayments = await prisma.generalLedger.findMany({
    //     where: {
    //         Sales:{}
    //         // Document: { some: { id: salesInvoices[0].id } },
    //         // AND: [
    //         //     { chartOfAccountId: { gte: 11000 } },
    //         //     { chartOfAccountId: { lte: 12000 } },
    //         // ],
    //     },
    //     select: {
    //         chartOfAccountId: true,
    //         amount: true,
    //     },
    // })
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
                sales={document}
                paymentMethods={paymentMethods}
                defaultPayments={document.Sales?.GeneralLedger.filter(
                    (gl) => gl.ChartOfAccount.isAr || gl.ChartOfAccount.isCash
                ).map((x) => ({
                    id: x.chartOfAccountId,
                    amount: x.amount,
                }))}
                defaultRemarks={document.DocumentRemark}
            />
        </>
    )
}
