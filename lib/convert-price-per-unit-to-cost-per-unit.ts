import { DocumentItem } from '@/types/document-item'
import { calculateDiscount } from './calculate-discount'

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
        discountPerUnitExVat: !vatable
            ? item.pricePerUnit -
              calculateDiscount(item.pricePerUnit, item.discountString)
            : isIncludeVat
              ? +(
                    ((item.pricePerUnit -
                        calculateDiscount(
                            item.pricePerUnit,
                            item.discountString
                        )) *
                        100) /
                    107
                ).toFixed(2)
              : item.pricePerUnit -
                calculateDiscount(item.pricePerUnit, item.discountString),
        discountPerUnitIncVat: !vatable
            ? item.pricePerUnit -
              calculateDiscount(item.pricePerUnit, item.discountString)
            : isIncludeVat
              ? item.pricePerUnit -
                calculateDiscount(item.pricePerUnit, item.discountString)
              : +(
                    (item.pricePerUnit -
                        calculateDiscount(
                            item.pricePerUnit,
                            item.discountString
                        )) *
                    1.07
                ).toFixed(2),
    }))
}
