'use client'

import { fullDateFormat } from '@/lib/date-format'
import { GetPurchase } from '@/types/purchase/purchase'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'

type Props = { document: GetPurchase }

import { bahttext } from 'bahttext'

Font.register({
    family: 'Inter Sarabun',
    fonts: [
        { src: '/fonts/Sarabun-Regular.ttf' },
        { src: '/fonts/Sarabun-Bold.ttf', fontStyle: 'bold' },
    ],
})
Font.register({
    family: 'Inter',
    fonts: [{ src: '/fonts/Inter-VariableFont_slnt,wght.ttf' }],
})

export default function PurchaseInvoicePdf({ document }: Props) {
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            fontSize: 8,
            gap: 5,
            fontFamily: 'Inter Sarabun',
            alignItems: 'center',
            padding: 40,
            paddingBottom: 120,
        },
        title: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 20,
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            textAlign: 'center',
            marginBottom: 15,
            width: '100%',
        },
        row: {
            flexDirection: 'row',
            gap: 5,
            width: '100%',
            paddingLeft: 20,
            paddingRight: 30,
            alignItems: 'flex-start',
        },
        col1: {
            width: 20,
        },
        col2: {
            width: 100,
        },
        col3: {
            width: 170,
            flexGrow: 1,
        },
        col4: {
            width: 50,
            textAlign: 'right',
        },
        col5: {
            width: 50,
            textAlign: 'right',
        },
        col6: {
            width: 50,
            textAlign: 'right',
        },
        footer: {
            position: 'absolute',
            left: 0,
            right: 70,
            bottom: 80,
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            textAlign: 'right',
            columnGap: 100,
        },
        sum: {
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: 5,
        },
        footer2: {
            position: 'absolute',
            left: 50,
            right: 0,
            bottom: 50,
            flexDirection: 'row',
            // alignItems: 'flex-end',
            columnGap: 150,
            // justifyContent: 'space-around',
        },
    })

    return (
        <Document>
            <Page
                size={['396', '648']}
                orientation="landscape"
                style={styles.page}
                fixed
            >
                <View style={styles.title} fixed>
                    <Text style={{ textAlign: 'center', width: '100%' }}>
                        ใบกำกับภาษีอย่างย่อ/ใบเสร็จรับเงิน{' '}
                    </Text>
                </View>
                <View style={styles.header} fixed>
                    <View style={{ flexDirection: 'column' }}>
                        <Text>{document?.contactName}</Text>
                        <Text>{document?.address}</Text>
                        <Text>{`โทร: ${document?.phone}`}</Text>
                        <Text>{`เลขประจำตัวผู้เสียภาษี: ${document?.taxId}`}</Text>
                    </View>
                    <View style={{ marginLeft: '10', gap: 2 }}>
                        <Text>เลขที่: {document?.documentNo}</Text>
                        <Text>วันที่: {fullDateFormat(document?.date)}</Text>
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                `หน้าที่: ${pageNumber} / ${totalPages}`
                            }
                        ></Text>
                    </View>
                </View>
                <View style={styles.row} fixed>
                    <Text style={styles.col1}>ที่</Text>
                    <Text style={styles.col2}>Barcode</Text>
                    <Text style={styles.col3}>ชื่อสินค้า</Text>
                    <Text style={styles.col4}>จำนวน </Text>
                    <Text style={styles.col5}>หน่วย</Text>
                    <Text style={styles.col6}>รวม</Text>
                </View>
                {document?.Purchase?.PurchaseItem.map((item, index) => (
                    <View style={styles.row} key={item.barcode} wrap={false}>
                        <Text style={styles.col1}>{index + 1}</Text>
                        <Text style={styles.col2}>{item.barcode}</Text>
                        <Text style={styles.col3}>
                            {`${item.name}\n${item.description}`}
                        </Text>
                        <Text style={styles.col4}>
                            {item.quantity / item.quantityPerUnit}
                        </Text>
                        <Text
                            style={styles.col5}
                        >{`${item.unit}(${item.quantityPerUnit})`}</Text>
                        <Text style={styles.col6}>
                            {item.costPerUnitIncVat}
                        </Text>
                    </View>
                ))}
                <View style={{ ...styles.footer }}>
                    <View style={styles.sum}>
                        <Text>รวมเป็นเงินทั้งสิ้น: </Text>
                    </View>
                    <View style={styles.sum}>
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                document?.Purchase?.PurchaseItem.reduce(
                                    (a, b) => a + b.costPerUnitIncVat,
                                    0
                                )
                            }
                        >
                            {document?.Purchase?.PurchaseItem.reduce(
                                (a, b) => a + b.costPerUnitIncVat,
                                0
                            )}
                        </Text>
                    </View>
                </View>

                <Text
                    style={{ ...styles.footer }}
                    render={({ pageNumber, totalPages }) =>
                        pageNumber !== totalPages && 'มีหน้าต่อไป'
                    }
                    fixed
                ></Text>

                <View style={{ ...styles.footer2 }}>
                    <Text>ผู้รับสินค้า</Text>
                    <Text>ผู้จัดสินค้า</Text>
                    <Text>ผู้รับเงิน</Text>
                </View>
            </Page>
        </Document>
    )
}
