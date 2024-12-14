import { Suspense } from 'react';
import NewUserPageContent from '@/components/NewUserPageContent';

export default function NewUserPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewUserPageContent></NewUserPageContent>
    </Suspense>
  );
}