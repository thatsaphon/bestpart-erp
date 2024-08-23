export type DocumentDetail = {
    id: number
    contactId?: number | null
    contactName: string
    address: string
    phone: string
    taxId: string
    date: Date
    documentNo?: string
    referenceNo?: string | null
}

export const getDefaultDocumentDetail = () =>
    ({
        id: 0,
        address: '',
        contactId: undefined,
        contactName: '',
        date: new Date(),
        phone: '',
        taxId: '',
        documentNo: '',
    }) as DocumentDetail
