// store.ts
import { setCookies } from '@/actions/set-cookies'
import {
    DocumentDetail,
    getDefaultDocumentDetail,
} from '@/types/document-detail'
import { DocumentItem } from '@/types/document-item'
import { create } from 'zustand'

// Define the shape of the Zustand store
export type SecondDisplay = {
    documentDetail: DocumentDetail
    items: DocumentItem[]
    customerWindow: Window | null

    // Methods
    postDocumentDetail: (documentDetail: DocumentDetail) => void
    postItems: (items: DocumentItem[]) => void
    openCustomerWindow: () => Promise<void>
}

// Create the Zustand store
const useSecondDisplayStore = create<SecondDisplay>()((set) => ({
    documentDetail: getDefaultDocumentDetail(),
    items: [],
    customerWindow: null,

    postDocumentDetail: (documentDetail) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    { documentDetail: documentDetail, items: state.items },
                    '*'
                )
            }
            return { documentDetail }
        }),
    postItems: (items) =>
        set((state) => {
            console.log('items', items)
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    { items: items, documentDetail: state.documentDetail },
                    '*'
                )
            }
            return { items }
        }),

    openCustomerWindow: async () => {
        set((state) => {
            const newWindow = window.open(
                '/customer-display',
                '_blank',
                'width=800,height=600'
            )

            return {
                customerWindow: newWindow,
                documentDetail: state.documentDetail,
                items: state.items,
            }
        })
    },
}))

export default useSecondDisplayStore
