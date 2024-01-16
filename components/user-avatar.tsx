'use client'
import React from 'react'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from './ui/avatar'
import { User } from '@prisma/client'

import {
  LogOut,
  User as UserIcon,
} from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logout } from '@/app/auth/login/action'
import { z } from 'zod'
import { AuthPayloadSchema } from '@/app/model/payload'

type Props = {
  user?: z.infer<
    typeof AuthPayloadSchema
  >
}

export default function UserAvatar({
  user,
}: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className='rounded-full'>
          <Avatar>
            <AvatarImage
              src={
                user?.avatarUrl ?? ''
              }
              alt='avatar'
            />
            <AvatarFallback>
              {user?.first_name
                ?.slice(0, 1)
                .toUpperCase() ??
                user?.username
                  .slice(0, 1)
                  .toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className='w-56'
        align='end'>
        <DropdownMenuLabel>
          {`${user?.username
            .slice(0, 1)
            .toUpperCase()}${user?.username.slice(
            1
          )}`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserIcon className='mr-2 h-4 w-4' />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () =>
            await logout()
          }>
          <LogOut className='mr-2 h-4 w-4' />
          <span>Log out</span>
          <DropdownMenuShortcut>
            ⇧⌘Q
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
