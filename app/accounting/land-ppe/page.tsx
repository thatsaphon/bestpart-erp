'use client'

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import React from 'react'

type Props = {}

export default function LandAndPPE({}: Props) {
  return (
    <main className='p-3 w-full h-full'>
      <h1 className='text-3xl font-bold mb-3'>Land and PP&E</h1>

      <div className='p-6'>
        <Accordion type='single' collapsible className='w-full max-w-[700px]'>
          <AccordionItem value='assets'>
            <AccordionTrigger>Land</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'></div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {/* {chartOfAccount
                  .filter((account) => account.type === 'Assets')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))} */}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='liabilities'>
            <AccordionTrigger>Plant</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='equity'>
            <AccordionTrigger>Equipment</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  )
}
