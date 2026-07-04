import { Fragment } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { STEPS } from "./constants"

export default function StepIndicator({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="mt-8 flex items-start">
      {STEPS.map((step, i) => {
        const isCompleted = currentStep > i + 1
        const isActive = currentStep === i + 1
        return (
          <Fragment key={i}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isCompleted && "bg-primary/10 text-primary",
                  isActive && "bg-primary text-white",
                  !isCompleted && !isActive && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : i + 1}
              </div>
              <span
                className={cn(
                  "w-14 text-center text-xs font-medium leading-tight",
                  isActive || isCompleted ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn("mt-3.5 h-px flex-1", isCompleted ? "bg-primary" : "bg-border")}
              />
            )}
          </Fragment>
        )
      })}
    </div>
  )
}
