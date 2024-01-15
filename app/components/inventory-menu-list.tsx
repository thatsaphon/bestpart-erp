'use client'

import Link from 'next/link'
import {
  usePathname,
  useSearchParams,
} from 'next/navigation'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
} from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Props = {}
export default function InventoryMenuList({}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const createQueryString = useCallback(
    (name: string) => {
      const params =
        new URLSearchParams(
          searchParams
        )
      if (params.get(name) === 'true') {
        params.delete(name)
      } else {
        params.set(name, 'true')
      }

      return params.toString()
    },
    [searchParams]
  )

  return (
    <>
      <Accordion type='multiple'>
        <AccordionItem value='item-1'>
          <AccordionTrigger>
            Is it accessible?
          </AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the
            WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value='item-2'>
          <AccordionTrigger>
            Is it accessible?
          </AccordionTrigger>
          <AccordionContent>
            Yes. It adheres to the
            WAI-ARIA design pattern.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <ul>
        <li>
          <p
            className={`hover:text-slate-600 cursor-pointer ${
              searchParams.get(
                'report'
              ) === 'true'
                ? 'underline'
                : ''
            }`}
            onClick={() =>
              router.push(
                '?' +
                  createQueryString(
                    'report'
                  )
              )
            }>
            + รายงาน
          </p>
          {searchParams.get(
            'report'
          ) === 'true' && (
            <p className='ml-5'>test</p>
          )}
        </li>
        <li>
          <p
            className={`hover:text-slate-600 cursor-pointer ${
              searchParams.get(
                'all'
              ) === 'true'
                ? 'underline'
                : ''
            }`}
            onClick={() =>
              router.push(
                '?' +
                  createQueryString(
                    'all'
                  )
              )
            }>
            + สินค้าทั้งหมด
          </p>
        </li>
        <li>
          <p
            className={`hover:text-slate-600 cursor-pointer ${
              searchParams.get(
                'brand'
              ) === 'true'
                ? 'underline'
                : ''
            }`}
            onClick={() =>
              router.push(
                '?' +
                  createQueryString(
                    'brand'
                  )
              )
            }>
            + ยี่ห้อ
          </p>
        </li>
        <li>
          <p
            className={`hover:text-slate-600 cursor-pointer ${
              searchParams.get(
                'model'
              ) === 'true'
                ? 'underline'
                : ''
            }`}
            onClick={() =>
              router.push(
                '?' +
                  createQueryString(
                    'model'
                  )
              )
            }>
            + รุ่นรถ
          </p>
        </li>
      </ul>
    </>
  )
}
