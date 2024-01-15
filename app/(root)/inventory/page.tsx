import { InventoryCard } from '@/components/inventory-card'
import InventoryMenuList from '@/app/components/inventory-menu-list'
import { prisma } from '@/app/db/db'
import { CreateInventoryDialog } from '@/components/create-inventory-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SkuMaster } from '@prisma/client'
import Link from 'next/link'
import React from 'react'
import { deleteInventory } from './action'

type Props = {}

export default async function InventoryListPage({}: Props) {
  // const result:SkuMaster[] =
  //   await prisma.$queryRaw`select * from SkuMaster where JSON_SEARCH(flag, "all", "%tes%")`
  const result: SkuMaster[] =
    await prisma.skuMaster.findMany({})

  console.log(result.length)
  //   const inventory = await prisma.skuMaster.findMany({
  //     where: {
  //       //   flag: { equals: { tags: ['test'] } },
  //       flag: {
  //         path: '$.tags',
  //         array_contains: ['test'],
  //         // path: '$.tags',
  //         //   string_contains: 'tes',
  //         // array_contains: ['%test%'],
  //         // string_contains: '%test%',
  //       },
  //     },
  //   })
  //   console.log(inventory)
  return (
    <div className=''>
      {/* <div className='p-3'>
        <InventoryMenuList />
      </div> */}
      <div className='mb-2 p-3'>
        <h1 className='text-3xl flex items-center gap-2 text-primary'>
          <span>สินค้าคงคลัง</span>
          <CreateInventoryDialog />
          {/* <Link
            href={'/inventory/create'}
            className='p-2 bg-green-700 text-white rounded-md text-xl'>
            สร้าง
          </Link> */}
        </h1>
        <div className='grid w-full max-w-sm items-center gap-1.5 mt-2'>
          {/* <Label htmlFor='search'>
            Search
          </Label> */}
          <Input
            type='search'
            id='search'
            placeholder='Search'
          />
        </div>
        <div className='grid grid-cols-3  gap-2'>
          {result.map((item, index) => (
            <form
              key={index}
              action={deleteInventory}>
              <input
                type='hidden'
                name='code'
                value={item.code}
              />
              <Button type='submit'>
                {item.name}
              </Button>
            </form>
            // <InventoryCard
            //   key={index}
            //   inventory={item}
            // />
          ))}
        </div>
      </div>
    </div>
  )
}
