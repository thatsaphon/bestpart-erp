import { searchSkuTreeByKeyword } from '../../actions/search-sku-tree-query'

export type SkuTree = Awaited<ReturnType<typeof searchSkuTreeByKeyword>>
