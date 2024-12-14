import React from 'react'
import SSProtectedComponent from '@/components/SSProtectedComponent';
import UserPanel from '@/components/admin/UsersPanel';

const page = async () => {

  return (
    <SSProtectedComponent allowedPermissions={[{ resource: 'adminPage', action: 'view' }]} redirectToLogin={true}>
      <div className='flex flex-col gap-20 justify-center h-full py-48 bg-white dark:bg-gray-800 max-w-[1400px] m-auto'>
        <SSProtectedComponent allowedPermissions={[{ resource: 'user', action: 'view' }]}>
          <UserPanel></UserPanel>
        </SSProtectedComponent>
      </div>
    </SSProtectedComponent>
  )
}

export default page
