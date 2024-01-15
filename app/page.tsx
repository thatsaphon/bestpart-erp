import { headers } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default function Home() {
  return (
    <div className='p-5'>
      <h1 className='text-3xl font-bold underline mb-5'>
        Welcome to BestPart Alai
      </h1>
      <section className='grid grid-cols-4 gap-6 max-w-full pr-5'>
        <div className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'>
          <Image
            className=''
            src={'/SalesIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>รายการขาย</span>
        </div>
        <div className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'>
          <Image
            className=''
            src={'/BuyIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>รายการซื้อ</span>
        </div>
        <Link
          className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'
          href={'/inventory'}>
          <Image
            className=''
            src={'/InventoryIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>คลังสินค้า</span>
        </Link>
        <div className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'>
          <Image
            className=''
            src={'/ARIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>ลูกหนี้</span>
        </div>
        <div className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'>
          <Image
            className=''
            src={'/APIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>เจ้าหนี้</span>
        </div>
        <div className='flex flex-col items-center rounded-full aspect-square justify-center bg-slate-100'>
          <Image
            className=''
            src={'/ReportIcon.png'}
            alt={'logo'}
            height={200}
            width={200}
          />
          <span>รายงาน</span>
        </div>
      </section>
    </div>
  )
}
