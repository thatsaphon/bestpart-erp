'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'

type Props = { document: Awaited<ReturnType<typeof getSalesInvoiceDetail>> }

import { bahttext } from 'bahttext'

Font.register({
    family: 'Inter Sarabun',
    fonts: [
        { src: '/fonts/Sarabun/Sarabun-Regular.ttf' },
        { src: '/fonts/Sarabun/Sarabun-Bold.ttf', fontStyle: 'bold' },
        {
            src: '/fonts/Sarabun/Sarabun-ExtraLight.ttf',
            fontWeight: 200,
        },
    ],
})
Font.register({
    family: 'Inter',
    fonts: [{ src: '/fonts/Inter-VariableFont_slnt,wght.ttf' }],
})

export default function SalesInvoicePdf({ document }: Props) {
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            fontSize: 6,
            gap: 5,
            fontFamily: 'Inter Sarabun',
            alignItems: 'center',
            // padding: 40,
            // paddingBottom: 120,
        },
        title: {
            marginTop: 20,
            width: '100%',
            justifyContent: 'center',
            // position: 'absolute',
            // left: 0,
            // right: 0,
            // top: 20,
        },
        header: {
            // flexDirection: 'row',
            // justifyContent: 'space-between',
            textAlign: 'center',
            marginBottom: 2,
            width: '100%',
        },
        row: {
            flexDirection: 'row',
            gap: 5,
            width: '100%',
            // paddingLeft: 5,
            // paddingRight: 5,
            alignItems: 'flex-start',
        },
        col1: {
            width: 10,
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
            // position: 'absolute',
            // left: 0,
            // right: 70,
            // bottom: 80,
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
            // position: 'absolute',
            // left: 50,
            // right: 0,
            // bottom: 50,
            flexDirection: 'row',
            // alignItems: 'flex-end',
            columnGap: 150,
            // justifyContent: 'space-around',
        },
    })

    return (
        <Document>
            <Page
                // 2.28inch -> 164px, 1.89inch -> 136px, 8.3inch -> 597px 11.69inch -> 841px
                size={{ width: 136, height: 597 }} //บิลขายหน้าร้าน['396', '648']
                orientation="portrait"
                style={styles.page}
                fixed
            >
                <View style={styles.title}>
                    <Text style={styles.header}>หจก.จ.สุพรรณบุรีอะไหล่</Text>
                    <Text style={styles.header}>
                        ใบกำกับภาษีอย่างย่อ/ใบเสร็จรับเงิน{' '}
                    </Text>
                    <Text style={styles.header}>
                        เลขที่: {document?.documentId}
                    </Text>
                    <Text style={styles.header}>
                        วันที่:{' '}
                        {new Intl.DateTimeFormat('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                            localeMatcher: 'best fit',
                        }).format(document?.date)}
                    </Text>
                    <Text style={styles.header}>ราคารวมภาษีมูลค่าเพิ่ม</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.col1}>ที่</Text>
                    {/* <Text style={styles.col2}>Barcode</Text> */}
                    <Text style={styles.col3}>ชื่อสินค้า</Text>
                    <Text style={styles.col4}>จำนวน </Text>
                    <Text style={styles.col5}>หน่วย</Text>
                    <Text style={styles.col6}>รวม</Text>
                </View>
                {document?.SkuOut.map((item, index) => (
                    <View style={styles.row} key={item.barcode} wrap={false}>
                        <Text style={styles.col1}>{index + 1}</Text>
                        {/* <Text style={styles.col2}>{item.barcode}</Text> */}
                        <Text style={styles.col3}>
                            {`${item.GoodsMaster.SkuMaster.mainSku.name}`}
                            <Text style={{ fontWeight: 200 }}>
                                {item.GoodsMaster.SkuMaster.detail && ' - '}
                                {`${item.GoodsMaster.SkuMaster.detail}`}
                            </Text>
                        </Text>
                        <Text style={styles.col4}>
                            {item.quantity / item.quantityPerUnit}
                            {` ${item.unit}`}
                        </Text>
                        <Text style={styles.col5}>{item.price + item.vat}</Text>
                        <Text style={styles.col6}>
                            {(item.price + item.vat) * item.quantity}
                        </Text>
                    </View>
                ))}
                <View style={styles.row} wrap={false}>
                    <Text style={styles.col1}></Text>
                    <Text style={styles.col3}></Text>
                    <Text style={styles.col4}></Text>
                    <Text style={styles.col5}>รวม: </Text>
                    <Text style={styles.col6}>
                        {document?.SkuOut.reduce(
                            (a, b) => a + (b.price + b.vat) * b.quantity,
                            0
                        )}
                    </Text>
                </View>
                {/* <View style={{ ...styles.footer }}>
                    <View style={styles.sum}>
                        <Text>รวม: </Text>
                    </View>
                    <View style={styles.sum}>
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                document?.SkuOut.reduce(
                                    (a, b) => a + b.price + b.vat,
                                    0
                                )
                            }
                        >
                            {document?.SkuOut.reduce(
                                (a, b) => a + b.price + b.vat,
                                0
                            )}
                        </Text>
                    </View>
                </View> */}
            </Page>
        </Document>
    )
}
