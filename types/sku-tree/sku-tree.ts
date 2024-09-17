import { searchSkuTree } from '../../actions/search-sku-tree'

export type SkuTree = Awaited<ReturnType<typeof searchSkuTree>>
