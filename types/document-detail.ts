export type DocumentDetail = {
    contactId?: number
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
        contactId: undefined,
        contactName: '',
        date: new Date(),
        phone: '',
        taxId: '',
        documentNo: '',
    }) as DocumentDetail
