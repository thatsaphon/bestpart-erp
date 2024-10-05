import { searchSkuTree } from '@/actions/search-sku-tree'
import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'
import React from 'react'
import UpdateSkuMasterForm from './update-sku-master-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { shortDateFormat } from '@/lib/date-format'
import { getSkuMasterHistory } from '@/types/sku-tree/sku-history'
import SkuMasterHistoryTable from './sku-master-history-table'
import QuickSearchInventory from '@/components/quick-search-inventory'
import UploadImage from './upload-image'

type Props = {
    params: {
        mainSkuId: string
        skuMasterId: string
    }
}

export default async function SkuMasterDetailPage({
    params: { mainSkuId, skuMasterId },
}: Props) {
    const {
        items: [skuTree],
        count,
    } = await searchSkuTreeDetail(
        { id: Number(mainSkuId) },
        { id: Number(skuMasterId) }
    )

    const histories = getSkuMasterHistory(skuTree.SkuMaster[0])

    return (
        <div className="space-y-2 p-3">
            <h1 className="text-3xl">{skuTree.name}</h1>
            <h2 className="text-primary">{skuTree.partNumber}</h2>
            <h2 className="flex gap-2 text-primary">
                {skuTree.MainSkuRemark.map((remark) => (
                    <Badge key={remark.remark} variant={'outline'}>
                        {remark.remark}
                    </Badge>
                ))}
            </h2>
            <p>ตำแหน่งเก็บ: {skuTree?.SkuMaster[0]?.position}</p>
            <Separator className="my-2" />
            <Tabs defaultValue="detail">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="detail">Detail</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="upload">Upload Image</TabsTrigger>
                </TabsList>
                <TabsContent value="detail">
                    <UpdateSkuMasterForm skuMaster={skuTree.SkuMaster[0]} />
                </TabsContent>
                <TabsContent value="history">
                    <SkuMasterHistoryTable histories={histories} />
                </TabsContent>
                <TabsContent value="upload">
                    <UploadImage
                        skuMasterId={Number(skuMasterId)}
                        fileName={`${skuTree.name}-${skuTree.SkuMaster[0].detail}`}
                    />
                </TabsContent>
            </Tabs>
        </div>
    )
}
