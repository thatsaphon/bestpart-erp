import React from 'react'
import { useFormStatus } from 'react-dom'

type Props = {}

export function SubmitButton({}: Props) {
  const { pending } = useFormStatus()
  return (
    <button type='submit' aria-disabled={pending}>
      Add
    </button>
  )
}
