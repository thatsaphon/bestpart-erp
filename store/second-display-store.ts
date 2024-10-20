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
    showImage: boolean
    images: string[]
    imageIndex: number

    // Methods
    postDocumentDetail: (documentDetail: DocumentDetail) => void
    postItems: (items: DocumentItem[]) => void
    openCustomerWindow: () => Promise<void>
    setShowImage: () => void
    addImage: (image: string) => void
    removeImage: (image: string) => void
    clearImages: () => void
    setImageIndex: (index: number) => void
}

// Create the Zustand store
const useSecondDisplayStore = create<SecondDisplay>()((set) => ({
    documentDetail: getDefaultDocumentDetail(),
    items: [],
    customerWindow: null,
    showImage: false,
    images: [],
    imageIndex: 0,

    postDocumentDetail: (documentDetail) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        documentDetail: documentDetail,
                        items: state.items,
                        images: state.images,
                        showImage: state.showImage,
                        imageIndex: state.imageIndex,
                    },
                    '*'
                )
            }
            return { documentDetail }
        }),
    postItems: (items) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: items,
                        documentDetail: state.documentDetail,
                        images: state.images,
                        showImage: false,
                        imageIndex: state.imageIndex,
                    },
                    '*'
                )
            }
            return { items, showImage: false }
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
                showImage: state.showImage,
                images: state.images,
                imageIndex: state.imageIndex,
            }
        })
    },
    setShowImage: () =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: state.items,
                        documentDetail: state.documentDetail,
                        images: state.images,
                        showImage: !state.showImage,
                        imageIndex: state.imageIndex,
                    },
                    '*'
                )
            }
            return { showImage: !state.showImage }
        }),
    addImage: (image) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: state.items,
                        documentDetail: state.documentDetail,
                        images: [...state.images, image],
                        showImage: true,
                        imageIndex: state.images.length,
                    },
                    '*'
                )
            }
            return {
                images: [...state.images, image],
                showImage: true,
                imageIndex: state.images.length,
            }
        }),
    removeImage: (image) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: state.items,
                        documentDetail: state.documentDetail,
                        images: state.images.filter((i) => i !== image),
                        showImage: state.showImage,
                        imageIndex:
                            state.imageIndex - 1 < 0 ? 0 : state.imageIndex - 1,
                    },
                    '*'
                )
            }
            return {
                images: state.images.filter((i) => i !== image),
                imageIndex: state.imageIndex - 1 < 0 ? 0 : state.imageIndex - 1,
            }
        }),
    clearImages: () =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: state.items,
                        documentDetail: state.documentDetail,
                        images: [],
                        showImage: state.showImage,
                        imageIndex: 0,
                    },
                    '*'
                )
            }
            return { images: [] }
        }),
    setImageIndex: (index) =>
        set((state) => {
            if (state.customerWindow) {
                state.customerWindow?.postMessage(
                    {
                        items: state.items,
                        documentDetail: state.documentDetail,
                        images: state.images,
                        showImage: state.showImage,
                        imageIndex: index,
                    },
                    '*'
                )
            }
            return { imageIndex: index }
        }),
}))

export default useSecondDisplayStore
