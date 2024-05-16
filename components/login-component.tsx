'use client'

import toast from 'react-hot-toast'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Props = {}

export default function LoginComponent({}: Props) {
    const router = useRouter()
    return (
        <form
            action={async (formData) => {
                const result = await signIn('credentials', {
                    redirect: false,
                    username: formData.get('username'),
                    password: formData.get('password'),
                })
                if (result?.error) {
                    toast.error(result.error)
                    console.error(result.error)
                    return
                } else {
                    toast.success('Login success')
                    router.refresh()
                }
            }}
        >
            <div className="flex w-full flex-col gap-2 rounded-md border border-black p-12">
                <div className="grid grid-cols-[100px_200px] items-center justify-center">
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        className="my-2 border border-black px-2"
                    />
                </div>
                <div className="grid grid-cols-[100px_200px] items-center justify-center">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        className="my-2 border border-black px-2"
                    />
                </div>
                <div className="text-center">
                    <button
                        type="submit"
                        className="rounded-md border border-black p-2"
                    >
                        Login
                    </button>
                </div>
            </div>
        </form>
    )
}
