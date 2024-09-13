import { DocumentType } from '@prisma/client'
// Sales
// SalesReturn
// SalesBill
// SalesReceived
// Purchase
// PurchaseReturn
// PurchasePayment
// JournalVoucher
// Quotation
// CustomerOrder
// PurchaseOrder
// OtherInvoice

// export const documentRoutes: { type: DocumentType; path: string } = [
//     { type: DocumentType.Sales, path: '/sales/sales-order' },
//     { type: DocumentType.SalesReturn, path: '/sales/sales-return' },
//     { type: DocumentType.SalesBill, path: '/sales/bill' },
//     { type: DocumentType.SalesReceived, path: '/sales/sales-received' },
//     { type: DocumentType.PurchaseOrder, path: '/purchase/purchase-order' },
//     { type: DocumentType.Purchase, path: '/purchase/purchase-received' },
//     { type: DocumentType.PurchaseReturn, path: '/purchase/purchase-return' },
//     { type: DocumentType.PurchasePayment, path: '/purchase/purchase-payment' },
//     { type: DocumentType.JournalVoucher, path: '/accounting/journal-voucher' },
//     { type: DocumentType.Quotation, path: '/sales/quotation' },
//     { type: DocumentType.CustomerOrder, path: '/sales/customer-order' },
//     { type: DocumentType.PurchaseOrder, path: '/purchase/purchase-order' },
//     { type: DocumentType.OtherInvoice, path: '/accounting/other-invoice' },
// ]
const documentRoutes: Record<DocumentType, string> = {
    Sales: '/sales/sales-order',
    SalesReturn: '/sales/sales-return',
    SalesBill: '/sales/bill',
    SalesReceived: '/sales/sales-received',
    Purchase: '/purchase/purchase-received',
    PurchaseReturn: '/purchase/purchase-return',
    PurchasePayment: '/purchase/purchase-payment',
    JournalVoucher: '/accounting/journal-voucher',
    Quotation: '/sales/quotation',
    CustomerOrder: '/sales/customer-order',
    PurchaseOrder: '/purchase/purchase-order',
    OtherInvoice: '/accounting/other-invoice',
}

export enum FullRoute {
    Sales = '/sales/sales-order',
    SalesReturn = '/sales/sales-return',
    SalesBill = '/sales/bill',
    SalesReceived = '/sales/sales-received',
    Purchase = '/purchase/purchase-received',
    PurchaseReturn = '/purchase/purchase-return',
    PurchasePayment = '/purchase/purchase-payment',
    JournalVoucher = '/accounting/journal-voucher',
    Quotation = '/sales/quotation',
    CustomerOrder = '/sales/customer-order',
    PurchaseOrder = '/purchase/purchase-order',
    OtherInvoice = '/accounting/other-invoice',
}
export enum SubRoute {
    Sales = 'sales-order',
    SalesReturn = 'sales-return',
    SalesBill = 'bill',
    SalesReceived = 'sales-received',
    Purchase = 'purchase-received',
    PurchaseReturn = 'purchase-return',
    PurchasePayment = 'purchase-payment',
    JournalVoucher = 'journal-voucher',
    Quotation = 'quotation',
    CustomerOrder = 'customer-order',
    PurchaseOrder = 'purchase-order',
    OtherInvoice = 'other-invoice',
}

// export const documentRoutes: <Record<Prisma,string>> = {
// }
