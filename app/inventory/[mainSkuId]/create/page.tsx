import { searchSkuTreeDetail } from '@/actions/search-sku-tree-detail'
import { Badge } from '@/components/ui/badge'

import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSkuMasterHistory } from '@/types/sku-tree/sku-history'
import SkuMasterCreateForm from './sku-master-create-form'
import { searchSkuTree } from '@/actions/search-sku-tree'
// import UpdateSkuMasterForm from '../[skuMasterId]/update-sku-master-form'

type Props = {
    params: Promise<{
        mainSkuId: string
        skuMasterId: string
    }>
}

export default async function SkuMasterDetailPage(props: Props) {
    const params = await props.params;

    const {
        mainSkuId,
        skuMasterId
    } = params;

    const {
        items: [skuTree],
        count,
    } = await searchSkuTree({ id: Number(mainSkuId) })

    return (
        <div className="p-3">
            <h1 className="text-3xl">{skuTree.name}</h1>
            <h2 className="text-primary">{skuTree.partNumber}</h2>
            <h2 className="flex gap-2 text-primary">
                {skuTree.MainSkuRemark.map((remark) => (
                    <Badge key={remark.remark} variant={'outline'}>
                        {remark.remark}
                    </Badge>
                ))}
            </h2>
            <Separator className="my-2" />
            <SkuMasterCreateForm mainSku={skuTree} />
        </div>
    )
}
