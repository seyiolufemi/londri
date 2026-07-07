import { X, File as FileIcon } from "lucide-react"
import UploadZone from "@/components/shared/UploadZone"

interface PremisesPhotosUploadProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
}

export default function PremisesPhotosUpload({ photos, onPhotosChange }: PremisesPhotosUploadProps) {
  function addPhoto(file: File) {
    onPhotosChange([...photos, file])
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  return (
    <div className="flex flex-col gap-2">
      {photos.map((file, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
        >
          <div className="flex items-center gap-2">
            <FileIcon className="size-4 shrink-0 text-primary" />
            <span className="max-w-[240px] truncate text-sm text-foreground">{file.name}</span>
          </div>
          <button
            type="button"
            className="text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => removePhoto(i)}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}

      {/* Remounts with a fresh empty state after each add, since UploadZone only holds one file at a time */}
      <UploadZone
        key={photos.length}
        label="Business premises photo"
        hint="Optional — helps customers recognize your location"
        accept=".jpg,.jpeg,.png"
        onFileChange={(file) => file && addPhoto(file)}
      />
    </div>
  )
}
