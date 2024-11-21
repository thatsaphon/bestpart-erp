CREATE VIEW "StockMovement" AS
SELECT
    "documentId", "documentNo", "contactId", "date", 'Sales' as "documentType", "skuMasterId", -("quantity" * "quantityPerUnit") as "movementCount", "quantityPerUnit", "quantity", "unit", 0 as "costPerUnitExVat", 0 as "costPerUnitIncVat" , "pricePerUnit", 0 as "discountPerUnitExVat", 0 as "discountPerUnitIncVat" , "discountPerUnit"  
FROM
    "Document"
INNER JOIN
    "Sales" ON "Document".id = "Sales"."documentId"
INNER JOIN
    "SalesItem" ON "Sales".id = "SalesItem"."salesId"
UNION
SELECT
    "documentId", "documentNo", "contactId", "date", 'SalesReturn' as "documentType", "skuMasterId", ("quantity" * "quantityPerUnit") as "movementCount", "quantityPerUnit", "quantity", "unit", 0 as "costPerUnitExVat", 0 as "costPerUnitIncVat" , "pricePerUnit", 0 as "discountPerUnitExVat", 0 as "discountPerUnitIncVat" , "discountPerUnit"  
FROM
    "Document"
INNER JOIN
    "SalesReturn" ON "Document".id = "SalesReturn"."documentId"
INNER JOIN
    "SalesReturnItem" ON "SalesReturn".id = "SalesReturnItem"."salesReturnId"
UNION
SELECT
    "documentId", "documentNo", "contactId", "date", 'Purchase' as "documentType", "skuMasterId", ("quantity" * "quantityPerUnit") as "movementCount", "quantityPerUnit", "quantity", "unit", "costPerUnitExVat", "costPerUnitIncVat", 0 as pricePerUnit, "discountPerUnitExVat", "discountPerUnitIncVat", 0 as discountPerUnit  
FROM
    "Document"
INNER JOIN
    "Purchase" ON "Document".id = "Purchase"."documentId"
INNER JOIN
    "PurchaseItem" ON "Purchase".id = "PurchaseItem"."purchaseId"
UNION
SELECT
    "documentId", "documentNo", "contactId", "date", 'PurchaseReturn' as "documentType", "skuMasterId", -("quantity" * "quantityPerUnit") as "movementCount", "quantityPerUnit", "quantity", "unit", "costPerUnitExVat", "costPerUnitIncVat", 0 as pricePerUnit, "discountPerUnitExVat", "discountPerUnitIncVat", 0 as discountPerUnit  
FROM
    "Document"
INNER JOIN
    "PurchaseReturn" ON "Document".id = "PurchaseReturn"."documentId"
INNER JOIN
    "PurchaseReturnItem" ON "PurchaseReturn".id = "PurchaseReturnItem"."purchaseReturnId"
UNION
SELECT
    "documentId", "documentNo", null as "contactId", "date", 'StockAdjustment' as "documentType", "skuMasterId", ("quantity" * "quantityPerUnit") as "movementCount", "quantityPerUnit", "quantity", "unit", "estimatedCost" as "costPerUnitExVat", "estimatedCost" as "costPerUnitIncVat", 0 as pricePerUnit, 0 as "discountPerUnitExVat", 0 as "discountPerUnitIncVat", 0 as discountPerUnit  
FROM
    "Document"
INNER JOIN
    "StockAdjustment" ON "Document".id = "StockAdjustment"."documentId"
INNER JOIN
    "StockAdjustmentItem" ON "StockAdjustment".id = "StockAdjustmentItem"."stockAdjustmentId"
;