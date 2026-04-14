'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, CheckCircle, FileText, X } from 'lucide-react'

interface FileUploadProps {
  label: string
  description: string
  accept: Record<string, string[]>
  file: File | null
  onFileSelect: (file: File | null) => void
  color: 'indigo' | 'amber'
}

export function FileUpload({ label, description, accept, file, onFileSelect, color }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple: false
  })

  const colorClasses = {
    indigo: {
      bg: 'bg-indigo-50/30',
      border: 'border-indigo-100',
      borderActive: 'border-indigo-400',
      icon: 'text-indigo-600',
      iconBg: 'bg-indigo-50'
    },
    amber: {
      bg: 'bg-amber-50/30',
      border: 'border-amber-100',
      borderActive: 'border-amber-400',
      icon: 'text-amber-500',
      iconBg: 'bg-amber-50'
    }
  }

  const theme = colorClasses[color]

  if (file) {
    return (
      <div className="school-card flex items-center justify-between p-4 border-2 border-emerald-500 bg-emerald-50/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-black text-slate-800 text-sm truncate max-w-[150px]">{file.name}</h3>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Arquivo Pronto</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
          className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-red-500 transition-all"
        >
          <X size={20} />
        </button>
      </div>
    )
  }

  return (
    <div 
      {...getRootProps()} 
      className={`school-card group cursor-pointer border-dashed border-2 py-12 flex flex-col items-center justify-center text-center transition-all
        ${theme.bg} ${isDragActive ? theme.borderActive : theme.border} hover:${theme.borderActive}`}
    >
      <input {...getInputProps()} />
      <div className={`w-20 h-20 ${theme.iconBg} rounded-3xl flex items-center justify-center ${theme.icon} mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
        {color === 'indigo' ? <Upload size={32} /> : <FileText size={32} />}
      </div>
      <h3 className="text-xl font-black text-slate-800 mb-2">{label}</h3>
      <p className="text-sm text-slate-400 max-w-[200px]">{description}</p>
      {isDragActive && (
        <p className={`mt-4 text-xs font-bold uppercase tracking-widest ${theme.icon}`}>Solte para carregar</p>
      )}
    </div>
  )
}
