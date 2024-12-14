"use client"

import { signIn, useSession } from "next-auth/react";
import { useRouter as useNavigation } from "next/navigation";
import { useSearchParams } from 'next/navigation';

export default function ErrorPageContent() {
  const { status } = useSession();
  const navigation = useNavigation();
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  console.log(error)

  if (status === "authenticated") {
    navigation.push(`/`);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold text-red-500">Authentication Error</h1>
      <p>There was an issue with sign in. Please try again.</p>
      {/* {error && <p>Error: {error}</p>} */}
      <button
        onClick={() => signIn()}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Try Again
      </button>
    </div>
  )
}