'use client'

import { getSalesInvoiceDetail } from '@/app/actions/sales/invoice-detail'
import { Prisma } from '@prisma/client'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'

const BillingNoteWithSubDocument =
    Prisma.validator<Prisma.DocumentDefaultArgs>()({
        include: {
            ArSubledger: true,
            GeneralLedger: {
                include: {
                    Document: true,
                },
            },
        },
    })
type BillingNoteDetail = Prisma.DocumentGetPayload<
    typeof BillingNoteWithSubDocument
>

type Props = { document: BillingNoteDetail }

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

export default function BillingNotePdf({ document }: Props) {
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

    const getSalesInvoice = () => {
        return document.GeneralLedger.sort(
            (a, b) => a.Document[0].id - b.Document[0].id
        )
    }

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
                        ใบวางบิล
                    </Text>
                </View>
                <View style={styles.header} fixed>
                    <View style={styles.header}>
                        <Text>หจก.จ.สุพรรณบุรีอะไหล่</Text>
                    </View>
                    <View style={{ marginLeft: '10', gap: 2 }}>
                        <Text>เลขที่: {document?.documentId}</Text>
                        <Text>
                            วันที่:{' '}
                            {new Intl.DateTimeFormat('th-TH', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                timeZone: 'Asia/Bangkok', // Set time zone to Bangkok
                                localeMatcher: 'best fit',
                            }).format(document?.date)}
                        </Text>
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
                {getSalesInvoice().map((item, index) => (
                    <View
                        style={styles.row}
                        key={item.Document[0].id}
                        wrap={false}
                    >
                        <Text style={styles.col1}>{index + 1}</Text>
                        <Text style={styles.col2}>
                            {item.Document[0].documentId}
                        </Text>
                        {/* <Text style={styles.col3}>
                            {`${item.GoodsMaster.SkuMaster.mainSku.name} - ${item.GoodsMaster.SkuMaster.detail}`}
                        </Text>
                        <Text style={styles.col4}>
                            {item.quantity / item.quantityPerUnit}
                        </Text>
                        <Text style={styles.col5}>{`${item.unit}`}</Text> */}
                        <Text style={styles.col6}>
                            {item.amount.toLocaleString()}
                        </Text>
                    </View>
                ))}
                <View style={{ ...styles.footer }}>
                    <View style={styles.sum}>
                        {/* {document?.GeneralLedger.filter(
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
                                    {`${item.chartOfAccountId === 12000 ? 'เงินเชื่อ' : item.ChartOfAccount?.name} :`}
                                </Text>
                                <Text style={{ width: 50, textAlign: 'right' }}>
                                    {`${item.amount.toLocaleString()}`} บาท
                                </Text>
                            </View>
                        ))} */}
                        <Text>
                            {`(${bahttext(
                                Number(
                                    getSalesInvoice().reduce(
                                        (a, b) => a + b.amount,
                                        0
                                    )
                                )
                            )})`}
                        </Text>
                    </View>
                    <View style={styles.sum}>
                        {/* <Text>ราคาก่อนภาษี: </Text>
                        <Text>VAT 7%: </Text> */}
                        <Text>รวมเป็นเงินทั้งสิ้น: </Text>
                    </View>
                    <View style={styles.sum}>
                        {/* <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                document?.SkuOut.reduce(
                                    (a, b) => a + b.price * b.quantity,
                                    0
                                )
                            }
                        >
                            {document?.SkuOut.reduce((a, b) => a + b.price, 0)}
                        </Text>
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                document?.SkuOut.reduce(
                                    (a, b) => a + b.vat * b.quantity,
                                    0
                                )
                            }
                        ></Text> */}
                        <Text
                            render={({ pageNumber, totalPages }) =>
                                pageNumber === totalPages &&
                                getSalesInvoice()
                                    .reduce((a, b) => a + b.amount, 0)
                                    .toLocaleString()
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
                    <Text>ผู้รับสินค้า</Text>
                    <Text>ผู้จัดสินค้า</Text>
                    <Text>ผู้รับเงิน</Text>
                </View>
            </Page>
        </Document>
    )
}
