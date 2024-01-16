'use client'
import { createInventory } from '@/app/inventory/action'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Fragment,
  useRef,
  useState,
} from 'react'
import {
  useFormState,
  useFormStatus,
} from 'react-dom'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './ui/tabs'
import { Badge } from './ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from './ui/separator'
import { signal } from '@preact/signals'
import { Tooltip } from 'react-tooltip'
import { SkuMaster } from '@prisma/client'
import {
  useRouter,
  useSearchParams,
} from 'next/navigation'

type Props = {
  inventory?: SkuMaster
}

export function CreateInventoryDialog({
  inventory,
}: Props) {
  const router = useRouter()
  const { pending } = useFormStatus()
  const searchParams = useSearchParams()
  const [tags, setTags] = useState<
    string[]
  >([])

  const tagInputRef =
    useRef<HTMLInputElement>(null)

  const onAddTag = () => {
    if (!tagInputRef.current) return
    if (
      !tagInputRef.current.value.trim()
    )
      return

    setTags((prev) => [
      ...prev,
      tagInputRef.current
        ?.value as string,
    ])
    tagInputRef.current.value = ''
  }

  const onDeleteTag = (
    index: number
  ) => {
    setTags((prev) => [
      ...prev.slice(0, index),
      ...prev.slice(index + 1),
    ])
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant='outline'
          type='button'>
          สร้างสินค้า
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[600px]'>
        <form
          action={createInventory}
          id='create-inventory-form'>
          <DialogHeader>
            <DialogTitle>
              สร้างสินค้า
            </DialogTitle>
            <DialogDescription>
              {/* สร้างสินค้าใหม่ */}
              {/* Make changes to your profile
          here. Click save when
          you&apos;re done. */}
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-center'>
            <Tabs
              defaultValue='account'
              className='w-[400px]'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='account'>
                  Account
                </TabsTrigger>
                <TabsTrigger
                  asChild
                  value='price'
                  disabled={!inventory}>
                  <span
                    data-tooltip-id='tab-disabled-tooltip'
                    data-tooltip-content='จำเป็นต้องสร้างสินค้าก่อน'
                    data-tooltip-hidden={
                      !!inventory
                    }>
                    ราคา
                  </span>
                </TabsTrigger>
              </TabsList>
              <Tooltip id='tab-disabled-tooltip' />
              <Separator className='mt-2' />
              <TabsContent value='account'>
                <div className='p-4 grid grid-cols-[1fr_3fr] content-start gap-3 items-center'>
                  <Label
                    className='text-right col-start-1'
                    htmlFor=''>
                    รหัสสินค้า
                  </Label>
                  <Input
                    name='code'
                    type='text'
                    className='px-2 border border-slate-400 ml-2'
                  />
                  <Label
                    className='text-right col-start-1'
                    htmlFor=''>
                    ชื่อสินค้า
                  </Label>
                  <Input
                    name='name'
                    type='text'
                    className='px-2 border border-slate-400 ml-2'
                  />
                  <Label
                    className='text-right col-start-1'
                    htmlFor=''>
                    ยี่ห้อ
                  </Label>
                  <Input
                    name='brand'
                    type='text'
                    className='px-2 border border-slate-400 ml-2'
                  />
                  <Label
                    className='text-right col-start-1'
                    htmlFor=''>
                    รุ่นรถ
                  </Label>
                  <Input
                    name='model'
                    type='text'
                    className='px-2 border border-slate-400 ml-2'
                  />
                  <Label
                    className='text-right col-start-1'
                    htmlFor=''>
                    คำค้นหาอื่นๆ
                  </Label>
                  <div className='flex gap-2 justify-between flex-1'>
                    <Input
                      ref={tagInputRef}
                      type='text'
                      className='px-2 border border-slate-400 ml-2 w-full'
                    />
                    <Button
                      type='button'
                      className='-mr-2'
                      variant={
                        'secondary'
                      }
                      onClick={(e) =>
                        onAddTag()
                      }>
                      เพิ่ม
                    </Button>
                    {/* <span>เพิ่ม</span> */}
                  </div>
                  <div className='col-start-2 flex flex-wrap gap-1'>
                    {tags.map(
                      (tag, i) => (
                        <Fragment
                          key={i}>
                          <Badge
                            variant={
                              'secondary'
                            }
                            onClick={() =>
                              onDeleteTag(
                                i
                              )
                            }>
                            {tag}
                          </Badge>
                          <input
                            hidden
                            value={tag}
                            name='tags'
                          />
                        </Fragment>
                      )
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value='price'>
                <Table>
                  <TableCaption>
                    A list of your
                    recent invoices.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[100px]'>
                        Barcode
                      </TableHead>
                      <TableHead>
                        จำนวนชิ้น
                      </TableHead>
                      <TableHead>
                        หน่วย
                      </TableHead>
                      <TableHead className='text-right'>
                        ราคา
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* {invoices.map((invoice) => (
    <TableRow key={invoice.invoice}>
      <TableCell className="font-medium">{invoice.invoice}</TableCell>
      <TableCell>{invoice.paymentStatus}</TableCell>
      <TableCell>{invoice.paymentMethod}</TableCell>
      <TableCell className="text-right">{invoice.totalAmount}</TableCell>
    </TableRow>
            ))} */}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell
                        colSpan={3}>
                        Total
                      </TableCell>
                      <TableCell className='text-right'>
                        $2,500.00
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            {/* <p className='text-center text-red-600'>
              {console.log(
                state?.message
              )}
              {state?.message}
            </p> */}
            <Button
              type='submit'
              aria-disabled={pending}
              form='create-inventory-form'>
              บันทึก
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
