'use client'

import {
    $Enums,
    AssetTypeToChartOfAccount,
    ChartOfAccount,
} from '@prisma/client'
import {
    Table,
    TableBody,
    TableCell,
    TableCaption,
    TableFooter,
    TableHeader,
    TableRow,
    TableHead,
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import React from 'react'
import toast from 'react-hot-toast'
import { updateChartOfAccountAssetType } from './update-chart-of-account-asset-type'

type Props = {
    chartOfAccounts: (ChartOfAccount & {
        assetTypeToChartOfAccount?: AssetTypeToChartOfAccount
    })[]
}

export default function AssetTypeToChartOfAccountSetup({
    chartOfAccounts,
}: Props) {
    return (
        <Table className="max-w-[80vw]">
            <TableCaption>Chart of Accounts</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Account ID</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Asset Type</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {chartOfAccounts.map(
                    ({ id, name, type, assetTypeToChartOfAccountId }) => (
                        <TableRow key={id}>
                            <TableCell>{id}</TableCell>
                            <TableCell>{name}</TableCell>
                            <TableCell>{type}</TableCell>
                            <TableCell>
                                <Select
                                    defaultValue={String(
                                        assetTypeToChartOfAccountId || 'none'
                                    )}
                                    onValueChange={async (value) => {
                                        try {
                                            if (value === 'none') {
                                                await updateChartOfAccountAssetType(
                                                    id,
                                                    'none'
                                                )
                                            } else {
                                                await updateChartOfAccountAssetType(
                                                    id,
                                                    value as $Enums.AssetType
                                                )
                                            }
                                            toast.success('Updated')
                                        } catch (err) {
                                            if (err instanceof Error)
                                                return toast.error(err.message)
                                            return toast.error(
                                                'Something went wrong'
                                            )
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-[250px]">
                                        <SelectValue placeholder="Asset Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>
                                                Asset Types
                                            </SelectLabel>
                                            <SelectItem value="none">
                                                Disabled
                                            </SelectItem>
                                            {Object.entries(
                                                $Enums.AssetType
                                            ).map(([key, value]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </TableCell>
                        </TableRow>
                    )
                )}
            </TableBody>
            <TableFooter>
                <TableRow>
                    <TableCell>Total</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                </TableRow>
            </TableFooter>
        </Table>
    )
}
