import { DocumentItem } from '@/types/document-item'

export const convertPricePerUnitToCostPerUnit = (
    items: DocumentItem[],
    vatable?: boolean,
    isIncludeVat?: boolean
) => {
    return items.map((item) => ({
        ...item,
        vatable: vatable,
        isIncludeVat: isIncludeVat,
        costPerUnitExVat: !vatable
            ? item.pricePerUnit
            : isIncludeVat
              ? +((item.pricePerUnit * 100) / 107).toFixed(2)
              : item.pricePerUnit,
        costPerUnitIncVat: !vatable
            ? item.pricePerUnit
            : isIncludeVat
              ? item.pricePerUnit
              : +(item.pricePerUnit * 1.07).toFixed(2),
    }))
}
