import LandAndPPEAccountDialog from '@/components/land-ppe-account-dialog'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Metadata } from 'next'
import React from 'react'

type Props = {}
export const metadata: Metadata = {
    title: 'Land & PPE',
}

export default function LandAndPPE({}: Props) {
    return (
        <main className="h-full w-full p-3">
            <h1 className="mb-3 text-3xl font-bold">Land and PP&E</h1>

            <div className="p-6">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full max-w-[700px]"
                >
                    <AccordionItem value="assets">
                        <AccordionTrigger>Land</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right">
                                {/* <LandAndPPEAccountDialog /> */}
                            </div>
                            <div className="mt-3 grid grid-cols-2 px-3">
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
                    <AccordionItem value="liabilities">
                        <AccordionTrigger>Plant</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right"></div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="equity">
                        <AccordionTrigger>Equipment</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right"></div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </main>
    )
}
