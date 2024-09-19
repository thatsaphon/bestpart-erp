'use client'

import { useState, useCallback } from 'react'
import { Upload } from 'lucide-react'

type Props = {
    submitFunction: (formData: FormData) => Promise<void>
}

export default function DragDropUpload({ submitFunction }: Props) {
    const [file, setFile] = useState<File | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }, [])

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }, [])

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const droppedFiles = Array.from(e.dataTransfer.files)
        setFile(droppedFiles[0])
    }, [])

    const onFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                const selectedFile = e.target.files[0]
                setFile(selectedFile)
            }
        },
        []
    )

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault()

            if (file) {
                const formData = new FormData()
                formData.append('file', file)

                await submitFunction(formData)
            }
        },
        [file, submitFunction]
    )

    return (
        <form onSubmit={handleSubmit}>
            <div className="mx-auto w-full max-w-md p-6">
                <div
                    className={`rounded-lg border-2 border-dashed p-8 text-center ${
                        isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300'
                    }`}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                >
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">
                        Drag and drop your files here, or click to select files
                    </p>
                    <input
                        type="file"
                        onChange={onFileInputChange}
                        className="hidden"
                        name="file"
                        id="fileInput"
                    />
                    <label
                        htmlFor="fileInput"
                        className="mt-4 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Select File
                    </label>
                </div>
                {file && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900">
                            Selected File:
                        </h3>
                        <ul className="mt-2 divide-y divide-gray-200 rounded-md border border-gray-200">
                            <li className="flex items-center justify-between py-3 pl-3 pr-4 text-sm">
                                <div className="flex w-0 flex-1 items-center">
                                    <span className="ml-2 w-0 flex-1 truncate">
                                        {file.name}
                                    </span>
                                </div>
                                <span className="font-medium text-primary">
                                    {file.size} bytes
                                </span>
                            </li>
                        </ul>
                    </div>
                )}
                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </form>
    )
}
