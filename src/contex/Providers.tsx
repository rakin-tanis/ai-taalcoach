"use client"

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from 'next-themes'
import React, { ReactNode } from 'react'

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </ThemeProvider>
    </div>
  )
}

export default Providers
