'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KnowledgeImage } from '@prisma/client'
import React, { useRef } from 'react'
import { uploadKnowledgeImage } from './upload-knowledge'
import toast from 'react-hot-toast'
import Image from 'next/image'

type Props = {
    knowledge: { id: number; content: string; KnowledgeImage: KnowledgeImage[] }
}

export default function UploadKnowledgeImage({ knowledge }: Props) {
    const ref = useRef<HTMLFormElement>(null)

    return (
        <div>
            <form>
                <Input type="file" name="file" />
                <Button
                    formAction={async (formData) => {
                        try {
                            formData.append(
                                'fileName',
                                `knowledge-${knowledge.id}`
                            )
                            const result = await uploadKnowledgeImage(
                                knowledge.id,
                                formData
                            )
                            toast.success('upload successfully')
                            ref.current?.reset()
                        } catch (err) {
                            console.log(err)
                            toast.success('Something went wrong')
                        }
                    }}
                >
                    Submit
                </Button>
            </form>
            <div className="mt-2 grid grid-cols-3 gap-1">
                {knowledge.KnowledgeImage.map((image) => (
                    <Image
                        key={image.id}
                        src={image.path}
                        alt={`knowledge-${knowledge.content}-${image.id}`}
                        width={500}
                        height={500}
                        unoptimized
                    />
                ))}
            </div>
        </div>
    )
}
