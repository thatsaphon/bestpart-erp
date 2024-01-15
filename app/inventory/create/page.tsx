import CreateInventoryForm from '@/app/components/create-inventory-form'
import React from 'react'

type Props = {}

export default function CreateInventoryPage({}: Props) {
  return (
    <div className='flex flex-col gap-2'>
      <h1 className='text-3xl'>สร้างสินค้า</h1>
      <CreateInventoryForm />
      <div>
        <button className='col-start-2 justify-self-end self-end bg-indigo-700 text-white rounded-md p-2'>
          บันทึก
        </button>
      </div>
    </div>
  )
}
