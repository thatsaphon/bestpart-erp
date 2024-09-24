'use server'

import { getServiceAndNonStockItemsDefaultFunction } from '@/types/service-and-non-stock-item/service-and-non-stock-item'
import { cookies } from 'next/headers'

export const setCookies = async () => {
    const cookieStore = cookies()
    if (!cookieStore.has('non-stock')) {
        const nonStockItems = await getServiceAndNonStockItemsDefaultFunction(
            {}
        )
        cookieStore.set('non-stock', JSON.stringify(nonStockItems), {
            maxAge: 60 * 60 * 24, // 30 days
            sameSite: 'strict',
            path: '/',
        })
    }
}
