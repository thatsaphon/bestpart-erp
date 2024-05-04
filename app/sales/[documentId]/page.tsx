import { DatePickerWithPresets } from '@/components/date-picker-preset'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useRef } from 'react'
import {
    Table,
    TableCaption,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import TableBodyFooterWrapper from '@/components/select-search-main-sku/table-body-footer-wrapper'
import { createInvoice } from '@/app/actions/sales/create-invoice'
import toast from 'react-hot-toast'
import SelectSearchCustomer from '@/components/select-search-customer'
import InvoiceDetailComponent from '@/components/invoice-detail-component'
import prisma from '@/app/db/db'
import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'

type Props = {
    params: { documentId: string }
}

export default async function InvoiceDetailPage({
    params: { documentId },
}: Props) {
    const document = await getSalesInvoiceDetail(documentId)

    return <InvoiceDetailComponent document={document} />
}
