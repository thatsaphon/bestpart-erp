import * as React from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Brand,
  CarModel,
  SkuMaster,
} from '@prisma/client'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'

type Props = {
  inventory: SkuMaster & {
    brand?: Brand | null
    carModel?: CarModel | null
  }
}

const SkuFlagSchema = z.object({
  tags: z.array(z.string()).optional(),
})

export function InventoryCard({
  inventory,
}: Props) {
  let tags: string[] = []
  const skuFlag =
    SkuFlagSchema.safeParse(
      inventory.flag
    )
  tags =
    skuFlag.success && skuFlag.data.tags
      ? skuFlag.data.tags
      : []

  return (
    <Card className='w-[350px]'>
      <CardHeader>
        <CardTitle>
          {inventory?.code}
          {/* Create project */}
        </CardTitle>
        <CardDescription>
          {inventory?.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className='grid w-full items-center gap-4'>
            <div className='grid gird-cols-[30px_1fr]'>
              <Label htmlFor='name'>
                ยี่ห้อ
              </Label>
              <span>
                {inventory?.brand?.name}
              </span>
            </div>
            <div className='grid gird-cols-[30px_1fr]'>
              <Label htmlFor='framework'>
                รุ่นรถ
              </Label>
              <span>
                {
                  inventory?.carModel
                    ?.name
                }
              </span>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className='flex justify-between'>
        <div className='flex gap-1'>
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant={'outline'}>
              {tag}
            </Badge>
          ))}
        </div>
        {/* <Button>Deploy</Button> */}
      </CardFooter>
    </Card>
  )
}
