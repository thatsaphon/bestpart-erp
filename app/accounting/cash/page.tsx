import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import React from 'react'

type Props = {}

export default function CashPage({}: Props) {
  return (
    <main className='p-3'>
      <h1 className='text-3xl font-bold mb-3'>Cash</h1>
      <div className='p-6'>
        <Accordion type='single' collapsible className='w-full max-w-[700px]'>
          <AccordionItem value='assets'>
            <AccordionTrigger>Petty Cash</AccordionTrigger>
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
            <AccordionTrigger>Bank Account</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'></div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='equity'>
            <AccordionTrigger>Cashier</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'></div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </main>
  )
}
