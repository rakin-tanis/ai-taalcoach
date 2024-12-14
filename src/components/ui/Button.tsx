"use client"

import React from "react"
import { cn } from "@/lib/utils"
import Spinner from "./Spinner"

const buttonVariants = {
  default: {
    enabled: "bg-blue-500 text-white hover:bg-blue-600",
    disabled: "bg-blue-300 text-white cursor-not-allowed opacity-50"
  },
  outline: {
    enabled: "border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white",
    disabled: "border border-blue-300 text-blue-300 cursor-not-allowed opacity-50"
  },
  secondary: {
    enabled: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    disabled: "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
  },
  destructive: {
    enabled: "bg-red-500 text-white hover:bg-red-600",
    disabled: "bg-red-300 text-white cursor-not-allowed opacity-50"
  },
  ghost: {
    enabled: "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900",
    disabled: "bg-transparent text-gray-400 cursor-not-allowed opacity-50"
  }
}

const buttonSizes = {
  default: "px-4 py-2 text-base",
  sm: "px-2 py-1 text-sm",
  lg: "px-6 py-3 text-lg",
  icon: "p-2 w-10 h-10 flex items-center justify-center"
}

const Button = React.forwardRef<
  React.ElementRef<"button">,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof buttonVariants,
    size?: keyof typeof buttonSizes,
    isLoading?: boolean
  }
>(({ className, variant = "default", size = "default", isLoading, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "rounded-md px-4 py-2 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        props.disabled
          ? buttonVariants[variant].disabled
          : buttonVariants[variant].enabled,
        buttonSizes[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          {props.children}
        </>
      )}
    </button>
  )
})
Button.displayName = "Button"

export { Button }