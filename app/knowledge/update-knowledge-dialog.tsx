'use client'

import React from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import UpdateKnowledgeForm from './update-knowledge-form'
import DeleteAlert from './delete-alert'
import { ImageIcon } from 'lucide-react'
import { TextIcon } from '@radix-ui/react-icons'
import UploadKnowledgeImage from './upload-knowledge-image'
import { KnowledgeImage } from '@prisma/client'

type Props = {
    knowledge: { id: number; content: string; KnowledgeImage: KnowledgeImage[] }
}

export default function UpdateKnowledgeDialog({ knowledge }: Props) {
    const [mode, setMode] = React.useState<'content' | 'upload'>('content')
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>แก้ไข</Button>
            </DialogTrigger>
            {
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-5">
                            <DialogTitle className="flex items-center gap-2">
                                {mode === 'content'
                                    ? 'แก้ไขข้อความ'
                                    : 'แก้ไขรูปภาพ'}
                                {mode === 'content' && (
                                    <ImageIcon
                                        className="h-4 w-4"
                                        onClick={() => setMode('upload')}
                                    />
                                )}
                                {mode === 'upload' && (
                                    <TextIcon
                                        className="h-4 w-4"
                                        onClick={() => setMode('content')}
                                    />
                                )}
                            </DialogTitle>

                            {mode === 'content' && (
                                <DeleteAlert knowledge={knowledge} />
                            )}
                        </div>
                    </DialogHeader>
                    {mode === 'content' && (
                        <UpdateKnowledgeForm knowledge={knowledge} />
                    )}
                    {mode === 'upload' && (
                        <UploadKnowledgeImage knowledge={knowledge} />
                    )}
                </DialogContent>
            }
        </Dialog>
    )
}
