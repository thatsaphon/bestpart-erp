import { DocumentItem } from '../document-item'
import { GetServiceAndNonStockItem } from './service-and-non-stock-item'

export const nonStockItemToDocumentItem = (item: GetServiceAndNonStockItem) => {
    const documentItem: DocumentItem = {
        name: item.name,
        detail: '',
        MainSkuRemark: [],
        SkuMasterRemark: [],
        unit: 'หน่วย',
        quantityPerUnit: 1,
        quantity: 1,
        pricePerUnit: 0,
        Image: [],
        serviceAndNonStockItemId: item.id,
    }
    return documentItem
}
