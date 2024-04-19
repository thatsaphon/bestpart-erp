'use client'

import React, { useState } from 'react'
import { Button } from './ui/button'
import { uploadFile } from '@/lib/s3-client'

type Props = {}

export default function UploadButton({}: Props) {
    const [file, setFile] = useState<File | undefined>()
    const upload = async () => {
        if (!file) return

        const binary = await file.arrayBuffer()
        const buffer = Buffer.from(binary)
        console.log(buffer)
        // const result = await fetch(
        //   'https://916b9163e26a35e3b28fd0281f5aedbf.r2.cloudflarestorage.com/bestpart' +
        //     '/test.pdf',
        //   {
        //     method: 'PUT',
        //     body: binary,
        //   }
        // )
        uploadFile('test.jpeg', file)
    }
    return (
        <form action={upload}>
            <input
                type="file"
                name="file"
                onChange={async (e) => {
                    setFile(e.target.files?.[0])
                    console.log('first')
                }}
            />
            <Button type="submit">Submit</Button>
        </form>
    )
}
