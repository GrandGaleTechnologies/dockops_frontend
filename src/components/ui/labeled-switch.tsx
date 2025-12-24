import * as SwitchPrimitive from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"

interface LabeledSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  onLabel?: string;
  offLabel?: string;
}

function LabeledSwitch({
  checked,
  onCheckedChange,
  disabled = false,
  className,
  onLabel = "ON",
  offLabel = "OFF",
  ...props
}: LabeledSwitchProps) {
  return (
    <div
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-14 items-center rounded-full border border-border bg-card shadow-sm transition-all overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* ON Label - visible when checked (left side) */}
      <span
        className={cn(
          "absolute left-2 text-[10px] font-medium transition-opacity duration-200 z-10",
          checked ? "opacity-100 text-muted-foreground" : "opacity-0"
        )}
      >
        {onLabel}
      </span>

      {/* OFF Label - visible when unchecked (right side) */}
      <span
        className={cn(
          "absolute right-2 text-[10px] font-medium transition-opacity duration-200 z-10",
          checked ? "opacity-0" : "opacity-100 text-muted-foreground"
        )}
      >
        {offLabel}
      </span>

      {/* Switch Track */}
      <SwitchPrimitive.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className={cn(
          "absolute inset-0 h-full w-full rounded-full border-2 border-transparent transition-all",
          "data-[state=checked]:bg-transparent",
          "data-[state=unchecked]:bg-transparent",
          "focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50"
        )}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            "block h-3 w-3 rounded-full shadow-lg transition-transform duration-200 pointer-events-none",
            "data-[state=checked]:bg-primary data-[state=checked]:translate-x-8",
            "data-[state=unchecked]:bg-muted-foreground/60 data-[state=unchecked]:translate-x-1"
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  );
}

export { LabeledSwitch }

