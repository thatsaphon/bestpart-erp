import React, { Fragment } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ChartOfAccountDialog from '@/components/chart-of-account-dialog'
import prisma from '../db/db'
import ResetChartOfAccountDialog from '@/components/reset-chart-of-account-dialog'
import { revalidatePath } from 'next/cache'
import { promises as fs } from 'fs'
import { csvToJSONObject } from '@/lib/csvToObject'
import { chartOfAccountSchema } from '../schema/chart-of-accounts-schema'

type Props = {}

export const revalidate = 600

export default async function AccountingPage({}: Props) {
  const chartOfAccount = await prisma.chartOfAccount.findMany({})

  const resetChartOfAccount = async () => {
    'use server'
    console.log(__dirname)
    console.log(process.cwd())
    const file = await fs.readFile(
      process.cwd() + `/master-data/chart-of-accounts.csv`,
      'utf8'
    )
    console.log(file)
    const result = await csvToJSONObject(file)
    // console.log(result)
    const validated = chartOfAccountSchema.array().safeParse(result)

    if (!validated.success) {
      // console.log(validated.error)
      return {
        error: 'invalid data',
      }
    }

    await prisma.chartOfAccount.deleteMany({})
    await prisma.chartOfAccount.createMany({
      data: validated.data,
    })
    revalidatePath('/accounting')
  }

  return (
    <main className='p-3 h-full w-full'>
      <div className='flex gap-x-3'>
        <h1 className='text-3xl font-bold'>Chart of Account</h1>
        <ResetChartOfAccountDialog resetChartOfAccount={resetChartOfAccount} />
      </div>
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
