export type DocumentDetail = {
    contactId?: string
    contactName: string
    address: string
    phone: string
    taxId: string
    date: Date
    documentNo?: string
    referenceNo?: string
}

export const getDefaultDocumentDetail = () =>
    ({
        address: '',
        contactId: '',
        contactName: '',
        date: new Date(),
        phone: '',
        taxId: '',
        documentNo: '',
    }) as DocumentDetail
