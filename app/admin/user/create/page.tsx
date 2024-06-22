import React from 'react'
import CreateUserForm from './create-user-form'

type Props = {}

export default function CreateUserPage({}: Props) {
    return (
        <>
            <h2 className="my-3 flex items-center gap-3 text-2xl font-semibold transition-colors">
                สร้างผู้ใช้งานใหม่
            </h2>
            <CreateUserForm />
        </>
    )
}
