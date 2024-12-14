import { Suspense } from 'react';
import ErrorPageContent from '@/components/ErrorPageContent';

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorPageContent></ErrorPageContent>
    </Suspense>
  );
}


