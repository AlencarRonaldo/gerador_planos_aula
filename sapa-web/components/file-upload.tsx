'use client'

import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, CheckCircle, FileText, X, FileSearch } from 'lucide-react'

interface FileUploadProps {
  label: string
  description: string
  accept: Record<string, string[]>
  file: File | null
  onFileSelect: (file: File | null) => void
  color: 'terra' | 'gold' | 'sage' | 'indigo' | 'amber'
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

  // Cores fixas para garantir visibilidade
  const config = {
    terra: { bg: '#FFF7F2', border: '#FFDDC7', text: '#C4622D', iconBg: '#FFEBD9' },
    gold: { bg: '#FFFBF0', border: '#FFECB3', text: '#C89B3C', iconBg: '#FFF4CC' },
    sage: { bg: '#F2F9F2', border: '#D9EBD9', text: '#5A7A5A', iconBg: '#E6F2E6' },
    indigo: { bg: '#F5F7FF', border: '#E0E7FF', text: '#4F46E5', iconBg: '#EEF2FF' },
    amber: { bg: '#FFFBEB', border: '#FEF3C7', text: '#D97706', iconBg: '#FEF3C7' }
  }

  const theme = config[color] || config.terra

  if (file) {
    return (
      <div 
        className="rounded-[24px] flex items-center justify-between p-5 border-2 animate-in zoom-in duration-300"
        style={{ backgroundColor: theme.bg, borderColor: theme.text }}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
            style={{ backgroundColor: theme.text }}
          >
            <CheckCircle size={24} strokeWidth={3} />
          </div>
          <div className="text-left min-w-0 flex-1">
            <h3 className="font-black text-[#1C1917] text-xs break-words leading-tight pr-2">
              {file.name}
            </h3>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: theme.text }}>Pronto</p>
          </div>
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); onFileSelect(null); }}
          className="p-2 hover:bg-white rounded-full text-[#8C7B70] hover:text-red-500 transition-all flex-shrink-0"
        >
          <X size={20} />
        </button>
      </div>
    )
  }

  return (
    <div 
      {...getRootProps()} 
      className="group cursor-pointer border-dashed border-2 py-12 flex flex-col items-center justify-center text-center transition-all h-full rounded-[32px]"
      style={{ 
        backgroundColor: isDragActive ? theme.iconBg : theme.bg, 
        borderColor: isDragActive ? theme.text : theme.border 
      }}
    >
      <input {...getInputProps()} />
      <div 
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm"
        style={{ backgroundColor: theme.iconBg, color: theme.text }}
      >
        {color === 'terra' ? <Upload size={32} strokeWidth={2.5} /> : color === 'gold' ? <FileText size={32} strokeWidth={2.5} /> : <FileSearch size={32} strokeWidth={2.5} />}
      </div>
      <h3 className="text-sm font-black text-[#1C1917] mb-1 uppercase tracking-tight whitespace-pre-line px-4">{label}</h3>
      <p className="text-[11px] text-[#8C7B70] font-medium max-w-[180px] leading-tight px-4">{description}</p>
      {isDragActive && (
        <p className="mt-4 text-[10px] font-black uppercase tracking-widest animate-bounce" style={{ color: theme.text }}>Solte para carregar</p>
      )}
    </div>
  )
}
