'use server'

import prisma from '@/app/db/db'
import { isBefore, startOfDay } from 'date-fns'

export const checkRemaining = async (skuMasterIds: number[]) => {
    const nonDuplicatedSkuMasterIds = skuMasterIds.filter(
        (x, i) => skuMasterIds.indexOf(x) === i
    )
    const cache = await checkCacheRemaining(nonDuplicatedSkuMasterIds)

    //หาจำนวนคงเหลือที่ต้องหาซ้ำ
    const filter = cache.filter(
        (x) =>
            x.remaining == null ||
            !x.remainingAt ||
            x.shouldRecheck ||
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
            movementCount: true,
        },
    })

    const stockMovement2 = filter.map((x) => ({
        skuMasterId: x.skuMasterId,
        _sum: {
            movementCount:
                stockMovement.find((y) => y.skuMasterId === x.skuMasterId)?._sum
                    .movementCount || 0,
        },
    }))

    const stockMovementUpserts = stockMovement2.map((x) => {
        return prisma.skuRemainingCache.upsert({
            where: {
                skuMasterId: x.skuMasterId,
            },
            update: {
                remaining: x._sum.movementCount || 0,
                date: new Date(),
                shouldRecheck: false,
            },
            create: {
                date: new Date(),
                skuMasterId: x.skuMasterId,
                remaining: x._sum.movementCount || 0,
                shouldRecheck: false,
            },
        })
    })

    await prisma.$transaction([...stockMovementUpserts])

    return [
        ...cache.filter(
            (x) =>
                !(
                    !x.remaining ||
                    !x.remainingAt ||
                    x.shouldRecheck ||
                    isBefore(x.remainingAt, startOfDay(new Date()))
                )
        ),
        ...stockMovement.map((x) => ({
            skuMasterId: x.skuMasterId,
            remaining: x._sum.movementCount || 0,
            remainingAt: new Date(),
        })),
        ...filter
            .filter(
                (x) =>
                    !stockMovement
                        .map((x) => x.skuMasterId)
                        .includes(x.skuMasterId)
            )
            .map((x) => ({
                skuMasterId: x.skuMasterId,
                remaining: 0,
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
        shouldRecheck: caches.find((x) => x.skuMasterId === id)?.shouldRecheck,
    }))
}
