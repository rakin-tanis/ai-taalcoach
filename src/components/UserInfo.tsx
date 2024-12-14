'use client'
import { useSession } from 'next-auth/react';
import React from 'react'
import UserMenu from './UserMenu';
import Image from "next/image";

const UserInfo = () => {
  const { data: session } = useSession();

  if (!session)
    return <UserMenu />

  if (session)
    return (
      <div className="flex items-center space-x-2 dark:text-white">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="User profile"
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium">{session.user?.name}</p>
          <p className="text-xs text-muted-foreground">{session.user?.email}</p>
        </div>
      </div>
    )
}

export default UserInfo
