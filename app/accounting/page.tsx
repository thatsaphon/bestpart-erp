import React, { Fragment } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ChartOfAccountDialog from '@/components/chart-of-account-dialog'
import prisma from '../db/db'

type Props = {}

export const revalidate = 600

export default async function AccountingPage({}: Props) {
  const chartOfAccount = await prisma.chartOfAccount.findMany({})
  console.log(chartOfAccount)
  return (
    <main className='p-3 h-full w-full'>
      <h1 className='text-3xl font-bold'>Chart of Account</h1>
      <div className='p-6'>
        <Accordion type='single' collapsible className='w-full max-w-[700px]'>
          <AccordionItem value='assets'>
            <AccordionTrigger>Assets</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'Assets')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='liabilities'>
            <AccordionTrigger>Liabilities</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'Liabilities')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='equity'>
            <AccordionTrigger>Equity</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'Equity')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>{' '}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='revenue'>
            <AccordionTrigger>Revenue</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'Revenue')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>{' '}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='expense'>
            <AccordionTrigger>Expense</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'Expense')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>{' '}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='other-income'>
            <AccordionTrigger>Other Income</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'OtherIncome')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>{' '}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value='other-expense'>
            <AccordionTrigger>Other Expense</AccordionTrigger>
            <AccordionContent>
              <div className='text-right'>
                <ChartOfAccountDialog />
              </div>
              <div className='grid grid-cols-2 mt-3 px-3'>
                {chartOfAccount
                  .filter((account) => account.type === 'OtherExpense')
                  .sort((a, b) => a.id - b.id)
                  .map((account, index) => (
                    <Fragment key={index}>
                      <span>{account.id}</span>
                      <span className='text-right'>{account.name}</span>
                    </Fragment>
                  ))}
              </div>{' '}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      {/* <div className='flex flex-wrap lg:grid lg:grid-cols-3 mb-3 gap-3'>
      </div> */}
    </main>
  )
}
