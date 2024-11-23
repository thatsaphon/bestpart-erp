'use client'

import { PrintBarcode } from '@/types/barcode/print-barcode'
import {
    Page,
    Text,
    View,
    Document,
    StyleSheet,
    Font,
} from '@react-pdf/renderer'

type Props = { items: PrintBarcode }

Font.register({
    family: 'Sarabun',
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
    family: 'LibreBarcodeText',
    fonts: [{ src: '/fonts/LibreBarcode128Text-Regular.ttf' }],
})

export default function BarcodePdf({ items }: Props) {
    const styles = StyleSheet.create({
        page: {
            fontFamily: 'Sarabun',
            paddingLeft: 10,
            fontSize: 6,
        },
        content: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 7,
        },
        item: {
            width: 70,
            display: 'flex',
        },
        partNumber: {
            maxLines: 1,
            height: 10,
        },
        name: {
            maxLines: 2,
            height: 20,
        },
        detail: {
            maxLines: 1,
            height: 10,
        },
        barcode: {
            fontFamily: 'LibreBarcodeText',
            fontSize: 16,
        },
        priceCode: {
            maxLines: 1,
            height: 10,
        },
    })
    console.log(items)

    return (
        <Document>
            <Page
                size={['250']}
                orientation="portrait"
                style={styles.page}
                fixed
            >
                <View style={styles.content}>
                    {items.flatMap((item, index) =>
                        Array.from({ length: item.quantity || 0 }).map(
                            (_, i) => (
                                <View
                                    style={styles.item}
                                    key={`${index}-${item.barcode}-${i}`}
                                >
                                    <Text style={styles.partNumber}>
                                        {item.partNumber}
                                    </Text>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.detail}>
                                        {item.detail}
                                    </Text>
                                    <Text style={styles.barcode}>
                                        {item.barcode}
                                    </Text>
                                    <Text style={styles.priceCode}>
                                        {item.priceCode}
                                    </Text>
                                </View>
                            )
                        )
                    )}
                </View>
            </Page>
        </Document>
    )
}
