import React from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function Card({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl shadow-sm border border-slate-200", className)}>
      {children}
    </div>
  )
}

export function Button({ children, className, variant = 'primary', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' }) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200',
    outline: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
  }
  
  return (
    <button 
      className={cn("px-6 py-2.5 rounded-xl font-semibold transition-all active:scale-95 shadow-lg", variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  )
}

export function Step({ number, title, active = false }: { number: number, title: string, active?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 transition-opacity", !active && "opacity-50")}>
      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm", 
        active ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-500")}>
        {number}
      </div>
      <span className={cn("font-bold text-slate-700", active && "text-indigo-600")}>{title}</span>
    </div>
  )
}
