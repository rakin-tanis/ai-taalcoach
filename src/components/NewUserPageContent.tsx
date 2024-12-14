'use client'

import { useSession } from 'next-auth/react'
import React from 'react'
import Link from 'next/link'
import { ArrowRightIcon } from 'lucide-react'

const NewUserPageContent = () => {
  const { data: session } = useSession()

  return (
    <div className='dark:bg-gray-800 dark:text-white w-full flex flex-col justify-center items-center p-6 space-y-8'>
      <h2 className='text-3xl font-bold'>Welkom, <b>{session?.user.name}</b>!</h2>

      <div className='space-y-4 w-full max-w-2xl'>
        <div className='p-4 flex items-center justify-between border-b dark:border-gray-700'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Start snel een nieuwe game en test je vaardigheden
            </p>
          </div>
          <Link href="/" className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center'>
            Home <ArrowRightIcon className='ml-2 w-4 h-4' />
          </Link>
        </div>

        <div className='p-4 flex items-center justify-between border-b dark:border-gray-700'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Vergelijk je prestaties met andere gebruikers
            </p>
          </div>
          <Link href="/leaderboard" className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center'>
            Ranglijst <ArrowRightIcon className='ml-2 w-4 h-4' />
          </Link>
        </div>

        <div className='p-4 flex items-center justify-between border-b dark:border-gray-700'>
          <div>
            <p className='text-sm text-gray-600 dark:text-gray-300'>
              Wijzig je gebruikersnaam
            </p>
          </div>
          <Link href="/settings" className='text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition flex items-center'>
            Instellingen <ArrowRightIcon className='ml-2 w-4 h-4' />
          </Link>
        </div>
      </div>



    </div>
  )
}

export default NewUserPageContent