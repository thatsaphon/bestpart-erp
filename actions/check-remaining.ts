'use server'

import prisma from '@/app/db/db'
import { isBefore, startOfDay } from 'date-fns'

export const checkRemaining = async (skuMasterIds: number[]) => {
    const cache = await checkCacheRemaining(skuMasterIds)

    const filter = cache.filter(
        (x) =>
            !x.remaining ||
            !x.remainingAt ||
            isBefore(x.remainingAt, startOfDay(new Date()))
    )

    const stockMovement = await prisma.stockMovement.groupBy({
        by: ['skuMasterId'],
        where: {
            skuMasterId: {
                in: filter.map((x) => x.skuMasterId),
            },
        },
        _sum: {
            quantity: true,
        },
    })

    const stockMovementUpserts = stockMovement.map((x) => {
        return prisma.skuRemainingCache.upsert({
            where: {
                skuMasterId: x.skuMasterId,
            },
            update: {
                remaining: x._sum.quantity || 0,
                date: new Date(),
            },
            create: {
                date: new Date(),
                skuMasterId: x.skuMasterId,
            },
        })
    })
    await prisma.$transaction(stockMovementUpserts)

    return [
        ...cache.filter(
            (x) =>
                !(
                    !x.remaining ||
                    !x.remainingAt ||
                    isBefore(x.remainingAt, startOfDay(new Date()))
                )
        ),
        ...stockMovement.map((x) => ({
            skuMasterId: x.skuMasterId,
            remaining: x._sum.quantity || 0,
            remainingAt: new Date(),
        })),
    ]
}

export const checkCacheRemaining = async (skuMasterIds: number[]) => {
    const caches = await prisma.skuRemainingCache.findMany({
        where: {
            skuMasterId: {
                in: skuMasterIds,
            },
        },
    })

    return skuMasterIds.map((id) => ({
        skuMasterId: id,
        remaining: caches.find((x) => x.skuMasterId === id)?.remaining,
        remainingAt: caches.find((x) => x.skuMasterId === id)?.date,
    }))
}
