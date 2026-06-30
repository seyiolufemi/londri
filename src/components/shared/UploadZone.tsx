"use client"

import { useRef, useState } from "react"
import { Upload, File, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface UploadZoneProps {
  label: string
  hint?: string
  accept?: string
  required?: boolean
  onFileChange?: (file: File | null) => void
}

export default function UploadZone({ label, hint, accept, required, onFileChange }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    onFileChange?.(f)
  }

  const removeFile = () => {
    setFile(null)
    onFileChange?.(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 transition-colors",
        isDragging && "border-primary bg-primary/5"
      )}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click()
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) handleFile(f)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) handleFile(f)
        }}
      />
      {file ? (
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <File className="size-5 shrink-0 text-primary" />
          <span className="max-w-[220px] truncate text-sm text-foreground">{file.name}</span>
          <button
            type="button"
            className="ml-1 rounded text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation()
              removeFile()
            }}
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <>
          <Upload className="mb-3 size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </p>
          {hint && (
            <p className="mt-1 text-center text-xs text-muted-foreground">{hint}</p>
          )}
        </>
      )}
    </div>
  )
}
