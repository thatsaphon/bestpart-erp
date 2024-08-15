CREATE OR REPLACE VIEW "StockMovement" AS
SELECT
    "documentId", "documentNo", "date", 'Sales' as "documentType", "skuMasterId", ("quantity" * "quantityPerUnit") as quantity, 0 as cost, "price" 
FROM
    "Document"
INNER JOIN
    "Sales" ON "Document".id = "Sales"."documentId"
INNER JOIN
    "SalesItem" ON "Sales".id = "SalesItem"."salesId"
UNION
SELECT
    "documentId", "documentNo", "date", 'SalesReturn' as "documentType", "skuMasterId", -("quantity" * "quantityPerUnit") as quantity, 0 as cost, "price" 
FROM
    "Document"
INNER JOIN
    "SalesReturn" ON "Document".id = "SalesReturn"."documentId"
INNER JOIN
    "SalesReturnItem" ON "SalesReturn".id = "SalesReturnItem"."salesReturnId"
UNION
SELECT
    "documentId", "documentNo", "date", 'Purchase' as "documentType", "skuMasterId", -("quantity" * "quantityPerUnit") as quantity, "cost", 0 as price 
FROM
    "Document"
INNER JOIN
    "Purchase" ON "Document".id = "Purchase"."documentId"
INNER JOIN
    "PurchaseItem" ON "Purchase".id = "PurchaseItem"."purchaseId"
UNION
SELECT
    "documentId", "documentNo", "date", 'PurchaseReturn' as "documentType", "skuMasterId", ("quantity" * "quantityPerUnit") as quantity, cost, 0 as price 
FROM
    "Document"
INNER JOIN
    "PurchaseReturn" ON "Document".id = "PurchaseReturn"."documentId"
INNER JOIN
    "PurchaseReturnItem" ON "PurchaseReturn".id = "PurchaseReturnItem"."purchaseReturnId"
UNION
SELECT
    "documentId", "documentNo", "date", 'StockAdjustment' as "documentType", "skuMasterId", "quantity", "estimatedCost" as cost, 0 as price 
FROM
    "Document"
INNER JOIN
    "StockAdjustment" ON "Document".id = "StockAdjustment"."documentId"
INNER JOIN
    "StockAdjustmentItem" ON "StockAdjustment".id = "StockAdjustmentItem"."stockAdjustmentId"
;