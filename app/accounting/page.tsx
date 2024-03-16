import React from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type Props = {}

export default async function AccountingPage({}: Props) {
  return (
    <main className='p-3 h-full w-full'>
      <h1 className='text-3xl font-bold'>Balance sheet</h1>
      <div className='p-6'>
        <Accordion type='single' collapsible className='w-full'>
          <AccordionItem value='assets'>
            <AccordionTrigger>Assets</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='liabilities'>
            <AccordionTrigger>Liabilities</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='equity'>
            <AccordionTrigger>Equity</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='revenue'>
            <AccordionTrigger>Revenue</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='expense'>
            <AccordionTrigger>Expense</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='other-income'>
            <AccordionTrigger>Other Income</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='other-expense'>
            <AccordionTrigger>Other Expense</AccordionTrigger>
            <AccordionContent>
              Yes. It adheres to the WAI-ARIA design pattern.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* <div className='flex flex-wrap lg:grid lg:grid-cols-3 mb-3 gap-3'>
      </div> */}
    </main>
  )
}
