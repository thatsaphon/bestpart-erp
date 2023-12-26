import { cookies, headers } from 'next/headers'
import React from 'react'

type Props = {}

export default function Home({}: Props) {
  console.log(headers().get('user'))
  return <div>page</div>
}
