import prisma from '@/app/db/db'
import CashAccountDialog from '@/components/cash-account-dialog'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import React from 'react'
import { Prisma } from '@prisma/client'
import { AuthPayloadSchema } from '@/app/schema/authPayloadSchema'

type Props = {}

export default async function CashPage({}: Props) {
    const users = await prisma.user.findMany({
        select: {
            username: true,
            first_name: true,
            last_name: true,
            accountOwners: { select: { accountNumberId: true } },
            role: true,
            avatarUrl: true,
            flag: true,
        },
    })
    const validated = AuthPayloadSchema.array().safeParse(users)

    return (
        <main className="max-w-[724px] p-3">
            <div className="mb-3 flex items-center justify-between">
                <h1 className="text-3xl font-bold ">Cash</h1>
                <Card>
                    <CardContent className="py-2">
                        <p className="h-full">Account Number: 11000</p>
                    </CardContent>
                </Card>
            </div>
            <div className="p-6">
                <Accordion type="multiple" className="w-full">
                    <AccordionItem value="petty cash">
                        <AccordionTrigger>Petty Cash</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right">
                                <CashAccountDialog
                                    users={
                                        validated.success ? validated.data : []
                                    }
                                    type="Petty Cash"
                                    label="Add new Petty Cash"
                                />
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
                    <AccordionItem value="bank account">
                        <AccordionTrigger>Bank Account</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right">
                                <CashAccountDialog
                                    users={
                                        validated.success ? validated.data : []
                                    }
                                    type="Bank Account"
                                    label="Add new Bank Account"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="cashier">
                        <AccordionTrigger>Cashier</AccordionTrigger>
                        <AccordionContent>
                            <div className="text-right">
                                <CashAccountDialog
                                    users={
                                        validated.success ? validated.data : []
                                    }
                                    type="Cashier"
                                    label="Add new Cashier"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </main>
    )
}
