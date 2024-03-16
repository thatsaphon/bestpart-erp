import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

type Props = {}

export default function loading({}: Props) {
  return (
    <div className='flex p-12'>
      <Skeleton className='h-12 w-[250px]' />
    </div>
  )
}
