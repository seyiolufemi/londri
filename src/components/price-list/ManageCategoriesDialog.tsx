"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
} from "@/redux/api/catalogApi"
import { apiError } from "@/lib/apiError"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ManageCategoriesDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  businessId: string | undefined
}

export default function ManageCategoriesDialog({ open, onOpenChange, businessId }: ManageCategoriesDialogProps) {
  const { data: categoriesData, isLoading } = useGetCategoriesQuery(businessId ?? "", {
    skip: !businessId,
  })
  const categories = categoriesData?.[0]?.categories ?? []

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation()
  const [deleteCategory] = useDeleteCategoryMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const [newCategoryName, setNewCategoryName] = useState("")

  async function handleAdd() {
    const trimmed = newCategoryName.trim()
    if (!trimmed) return
    try {
      await createCategory({ name: trimmed }).unwrap()
      toast.success(`Category "${trimmed}" added`)
      setNewCategoryName("")
    } catch (error) {
      toast.error(apiError(error, "Couldn't add category"))
    }
  }

  async function handleDelete(category: Category) {
    setDeletingId(category.id)
    try {
      await deleteCategory(category.id).unwrap()
      toast.success(`Category "${category.name}" removed`)
    } catch (error) {
      toast.error(apiError(error, "Couldn't remove category"))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add or remove item categories. Categories still attached to price
            list items can&apos;t be deleted.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))
          ) : categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet. Add one below.
            </p>
          ) : (
            categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="text-sm text-foreground">{cat.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-destructive hover:text-destructive"
                  disabled={deletingId === cat.id}
                  onClick={() => handleDelete(cat)}
                >
                  {deletingId === cat.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="New category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd()
            }}
          />
          <Button
            variant="outline"
            onClick={handleAdd}
            disabled={!newCategoryName.trim() || isCreating}
          >
            {isCreating && <Loader2 className="size-4 animate-spin" />}
            Add
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
