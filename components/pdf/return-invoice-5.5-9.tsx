'use client'

import { getSalesReturnInvoiceDetail } from '@/app/actions/sales/return-invoice-detail'
import { fullDateFormat } from '@/lib/date-format'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'
import { bahttext } from 'bahttext'

type Props = {
    document: Awaited<ReturnType<typeof getSalesReturnInvoiceDetail>>
}

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

export default function SalesReturnInvoicePdf_5x9({ document }: Props) {
    const styles = StyleSheet.create({
        page: {
            flexDirection: 'column',
            fontSize: 9,
            gap: 5,
            fontFamily: 'Inter Sarabun',
            alignItems: 'center',
            padding: 40,
            paddingLeft: 40,
            paddingRight: 30,
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
            alignItems: 'flex-start',
            justifyContent: 'space-between',
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
            right: 30,
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
            left: 40,
            right: 30,
            bottom: 40,
            flexDirection: 'row',
            justifyContent: 'space-between',
        },
    })

    return (
        <Document>
            <Page
                size={['612', '396']}
                orientation="portrait"
                style={styles.page}
                fixed
            >
                <View style={styles.title} fixed>
                    <Text style={{ textAlign: 'center', width: '100%' }}>
                        ใบรับคืนสินค้า/ใบลดหนี้
                    </Text>
                    <Text style={{ textAlign: 'center', width: '100%' }}>
                        หจก.จ.สุพรรณบุรีอะไหล่
                    </Text>
                    <Text style={{ textAlign: 'center', width: '100%' }}>
                        เลขประจำตัวผู้เสียภาษี: 123456789012{' '}
                    </Text>
                </View>
                <View style={styles.header} fixed>
                    <View style={{ gap: 2 }}>
                        <Text>{`ชื่อลูกค้า: ${document?.contactName}`}</Text>
                        <Text>{`โทร: ${document?.phone}`}</Text>
                    </View>
                    <View style={{ gap: 2 }}>
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
                {document?.SkuIn.map((item, index) => (
                    <View style={styles.row} key={item.barcode} wrap={false}>
                        <Text style={styles.col1}>{index + 1}</Text>
                        <Text style={styles.col2}>{item.barcode}</Text>
                        <Text style={styles.col3}>
                            {`${item.GoodsMaster.SkuMaster.mainSku.name} - ${item.GoodsMaster.SkuMaster.detail}`}
                        </Text>
                        <Text style={styles.col4}>
                            {(
                                item.quantity / item.quantityPerUnit
                            ).toLocaleString()}
                        </Text>
                        <Text style={styles.col5}>{`${item.unit}`}</Text>
                        <Text style={styles.col6}>
                            {(
                                (item.cost + item.vat) *
                                item.quantity
                            ).toLocaleString()}
                        </Text>
                    </View>
                ))}
                <View style={{ ...styles.footer }}>
                    <View style={styles.sum}>
                        {document?.GeneralLedger.filter(
                            ({ chartOfAccountId }) =>
                                chartOfAccountId >= 11000 &&
                                chartOfAccountId <= 12000
                        ).map((item) => (
                            <View
                                key={item.chartOfAccountId}
                                style={{
                                    justifyContent: 'flex-end',
                                    display: 'flex',
                                    flexDirection: 'row',
                                }}
                            >
                                <Text style={{ textAlign: 'right' }}>
                                    {`${item.chartOfAccountId === 12000 ? 'หักลบเงินเชื่อ' : item.chartOfAccountId === 11000 ? 'คืนเป็นเงินสด' : item.ChartOfAccount?.name} :`}
                                </Text>
                                <Text style={{ width: 50, textAlign: 'right' }}>
                                    {`${-item.amount.toLocaleString()}`} บาท
                                </Text>
                            </View>
                        ))}
                        <Text>
                            {`(${bahttext(
                                Number(
                                    document?.SkuIn.reduce(
                                        (a, b) =>
                                            a + (b.cost + b.vat) * b.quantity,
                                        0
                                    )
                                )
                            )})`}
                        </Text>
                    </View>
                    <View style={styles.sum}>
                        <Text>รวมเป็นเงินทั้งสิ้น: </Text>
                    </View>
                    <View style={styles.sum}>
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                document?.SkuIn.reduce(
                                    (a, b) => a + (b.cost + b.vat) * b.quantity,
                                    0
                                ).toLocaleString()
                            }
                        ></Text>
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
                    <Text style={{ width: 120 }}>
                        ผู้คิดเงิน:{`\n`}
                        {document?.createdBy}
                    </Text>
                    <Text style={{ width: 120 }}>ผู้จัดสินค้า</Text>
                    <Text style={{ width: 120 }}>ผู้รับเงิน</Text>
                    <Text style={{ width: 120 }}>ผู้รับสินค้า</Text>
                </View>
            </Page>
        </Document>
    )
}
