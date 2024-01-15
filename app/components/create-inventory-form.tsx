'use client'

import React, {
  Fragment,
  useState,
} from 'react'
import { createInventory } from '../abc/inventory/action'
import { Button } from '@/components/ui/button'

type Props = {}
const initialState = {
  message: '',
  data: undefined,
}

export default function CreateInventoryForm({}: Props) {
  const [tags, setTags] = useState([
    'test',
  ])
  const [goodsCodes, setGoodsCodes] =
    useState([])
  return (
    <form
      action={createInventory}
      className='lg:grid lg:grid-cols-2 lg:gap-6 flex-1 lg:divide-x border-b'>
      <div className='p-4 grid grid-cols-[1fr_2fr] content-start gap-3'>
        <label htmlFor=''>
          รหัสสินค้า
        </label>
        <input
          name='code'
          type='text'
          className='px-2 border border-slate-400 ml-2'
        />
        <label htmlFor=''>
          ชื่อสินค้า
        </label>
        <input
          name='name'
          type='text'
          className='px-2 border border-slate-400 ml-2'
        />
        <label htmlFor=''>ยี่ห้อ</label>
        <input
          name='brand'
          type='text'
          className='px-2 border border-slate-400 ml-2'
        />
        <label htmlFor=''>รุ่นรถ</label>
        <input
          name='model'
          type='text'
          className='px-2 border border-slate-400 ml-2'
        />
        <label htmlFor=''>
          คำค้นหาอื่นๆ
        </label>
        <div className='flex gap-2'>
          <input
            type='text'
            className='px-2 border border-slate-400 ml-2'
          />
          <button>เพิ่ม</button>
        </div>
        <div className='col-span-2'>
          {tags.map((tag) => (
            <span
              key={tag}
              className='p-1 px-2 border border-slate-800 rounded-md ml-2 text-xs'>
              {tag}
            </span>
          ))}
        </div>
        <Button
          className='col-start-2 justify-self-end'
          type='submit'>
          บันทึก
        </Button>
      </div>

      <div className='flex flex-col p-4 content-start gap-3 justify-between'>
        <h2 className='col-span-2 text-2xl flex items-center'>
          ตั้งราคาขาย{' '}
          <button className='p-1 px-2 ml-2 bg-green-500 text-white text-base rounded-md'>
            เพิ่ม
          </button>
        </h2>
        <div className='grid grid-cols-2 gap-2 w-[400px] p-5 m-3 border border-slate-600 rounded-xl'>
          <label htmlFor=''>
            รหัสขาย
          </label>
          <input
            type='text'
            className='px-2 border border-slate-400 ml-2'
            disabled
          />
          <label htmlFor=''>
            หน่วย
          </label>
          <input
            type='text'
            className='px-2 border border-slate-400 ml-2'
          />
          <label htmlFor=''>
            ราคาสินค้า
          </label>
          <input
            type='text'
            className='px-2 border border-slate-400 ml-2'
          />
        </div>
        {goodsCodes.map(
          (goodsCode, index) => (
            <div key={index}></div>
          )
        )}
        <div className='flex-1'></div>
        <Button className='self-end'>
          บันทึก
        </Button>
      </div>
    </form>
  )
}
