import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Enhanced Button Component with Design System Integration
 * 
 * Features:
 * - Comprehensive variant system
 * - Loading states with spinner
 * - Icon support (left/right positioning)
 * - Enhanced accessibility
 * - Design token integration
 * - Touch target compliance
 * - Animation support
 */

const buttonVariants = cva(
  // Base styles with design tokens
  [
    "inline-flex items-center justify-center gap-2",
    "whitespace-nowrap rounded-md text-sm font-medium",
    "ring-offset-background transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "relative overflow-hidden",
    "touch-target", // Ensures minimum 44px touch target
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    // Improved hover and active states
    "hover:scale-[1.02] active:scale-[0.98]",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-primary text-primary-foreground",
          "hover:bg-primary/90 hover:shadow-md",
          "active:bg-primary/95",
          "focus:ring-primary/50",
        ],
        destructive: [
          "bg-destructive text-destructive-foreground",
          "hover:bg-destructive/90 hover:shadow-md",
          "active:bg-destructive/95",
          "focus:ring-destructive/50",
        ],
        outline: [
          "border border-input bg-background",
          "hover:bg-accent hover:text-accent-foreground hover:border-accent",
          "active:bg-accent/80",
          "focus:ring-primary/50",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground",
          "hover:bg-secondary/80 hover:shadow-sm",
          "active:bg-secondary/90",
          "focus:ring-secondary/50",
        ],
        ghost: [
          "hover:bg-accent hover:text-accent-foreground",
          "active:bg-accent/80",
          "focus:ring-accent/50",
        ],
        link: [
          "text-primary underline-offset-4",
          "hover:underline hover:text-primary/80",
          "active:text-primary/90",
          "focus:ring-primary/50",
        ],
        // New enhanced variants
        success: [
          "bg-green-600 text-white",
          "hover:bg-green-700 hover:shadow-md",
          "active:bg-green-800",
          "focus:ring-green-500/50",
        ],
        warning: [
          "bg-yellow-600 text-white",
          "hover:bg-yellow-700 hover:shadow-md",
          "active:bg-yellow-800",
          "focus:ring-yellow-500/50",
        ],
        info: [
          "bg-blue-600 text-white",
          "hover:bg-blue-700 hover:shadow-md",
          "active:bg-blue-800",
          "focus:ring-blue-500/50",
        ],
        gradient: [
          "bg-gradient-to-r from-primary to-primary-600 text-white",
          "hover:from-primary/90 hover:to-primary-600/90 hover:shadow-lg",
          "active:from-primary/95 active:to-primary-600/95",
          "focus:ring-primary/50",
        ],
        glass: [
          "bg-white/10 backdrop-blur-sm border border-white/20 text-foreground",
          "hover:bg-white/20 hover:border-white/30",
          "active:bg-white/30",
          "focus:ring-white/50",
        ],
      },
      size: {
        xs: "h-8 px-2 text-xs rounded-sm",
        sm: "h-9 px-3 text-sm rounded-md",
        default: "h-10 px-4 py-2 text-sm rounded-md",
        lg: "h-11 px-6 text-base rounded-lg",
        xl: "h-12 px-8 text-lg rounded-lg",
        icon: "h-10 w-10 rounded-md",
        "icon-sm": "h-8 w-8 rounded-sm",
        "icon-lg": "h-12 w-12 rounded-lg",
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      elevation: {
        none: "shadow-none",
        sm: "shadow-sm hover:shadow-md",
        md: "shadow-md hover:shadow-lg",
        lg: "shadow-lg hover:shadow-xl",
      },
      animation: {
        none: "",
        bounce: "hover:animate-bounce",
        pulse: "hover:animate-pulse",
        wiggle: "hover:animate-wiggle",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
      elevation: "none",
      animation: "none",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  tooltip?: string
  badge?: string | number
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth,
    elevation,
    animation,
    asChild = false, 
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    tooltip,
    badge,
    children,
    disabled,
    ...props 
  }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    const isDisabled = disabled || loading

    return (
      <Comp
        className={cn(
          buttonVariants({ 
            variant, 
            size, 
            fullWidth, 
            elevation, 
            animation, 
            className 
          }),
          // Reduced motion support
          "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
        )}
        ref={ref}
        disabled={isDisabled}
        aria-label={tooltip}
        title={tooltip}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <Loader2 
            className="mr-2 h-4 w-4 animate-spin" 
            aria-hidden="true"
          />
        )}
        
        {/* Left icon */}
        {leftIcon && !loading && (
          <span className="mr-1" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        
        {/* Button content */}
        <span className="flex items-center gap-1">
          {loading && loadingText ? loadingText : children}
        </span>
        
        {/* Right icon */}
        {rightIcon && !loading && (
          <span className="ml-1" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        
        {/* Badge */}
        {badge && (
          <span 
            className={cn(
              "absolute -top-1 -right-1",
              "min-w-5 h-5 px-1",
              "bg-red-500 text-white text-xs font-bold",
              "rounded-full flex items-center justify-center",
              "border-2 border-background"
            )}
            aria-label={`${badge} notifications`}
          >
            {badge}
          </span>
        )}
        
        {/* Ripple effect container */}
        <span 
          className="absolute inset-0 overflow-hidden rounded-[inherit]"
          aria-hidden="true"
        >
          <span className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-200 hover:opacity-100" />
        </span>
      </Comp>
    )
  }
)
Button.displayName = "EnhancedButton"

// Button group component for related actions
export interface ButtonGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical"
  size?: VariantProps<typeof buttonVariants>["size"]
  variant?: VariantProps<typeof buttonVariants>["variant"]
  attached?: boolean
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ 
    className, 
    orientation = "horizontal", 
    size = "default",
    variant = "default",
    attached = false,
    children, 
    ...props 
  }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          attached && orientation === "horizontal" && "[&>*:not(:first-child)]:ml-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:last-child)]:rounded-r-none [&>*:not(:first-child)]:border-l-0",
          attached && orientation === "vertical" && "[&>*:not(:first-child)]:mt-0 [&>*:not(:first-child)]:rounded-t-none [&>*:not(:last-child)]:rounded-b-none [&>*:not(:first-child)]:border-t-0",
          !attached && orientation === "horizontal" && "space-x-2",
          !attached && orientation === "vertical" && "space-y-2",
          className
        )}
        role="group"
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === Button) {
            return React.cloneElement(child, {
              size: child.props.size || size,
              variant: child.props.variant || variant,
            } as any)
          }
          return child
        })}
      </div>
    )
  }
)
ButtonGroup.displayName = "ButtonGroup"

// Icon button component for actions with only icons
export interface IconButtonProps extends Omit<ButtonProps, "leftIcon" | "rightIcon" | "children"> {
  icon: React.ReactNode
  label: string // Required for accessibility
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, size = "icon", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size={size}
        aria-label={label}
        title={label}
        {...props}
      >
        {icon}
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

// Floating action button component
export interface FabProps extends ButtonProps {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  extended?: boolean
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ 
    className, 
    position = "bottom-right", 
    extended = false,
    size = extended ? "lg" : "icon-lg",
    variant = "default",
    elevation = "lg",
    ...props 
  }, ref) => {
    const positionClasses = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
    }

    return (
      <Button
        ref={ref}
        className={cn(
          "fixed z-50",
          extended ? "rounded-full" : "rounded-full",
          positionClasses[position],
          className
        )}
        size={size}
        variant={variant}
        elevation={elevation}
        {...props}
      />
    )
  }
)
Fab.displayName = "Fab"

export { Button, ButtonGroup, IconButton, Fab, buttonVariants }

// Export types for external use
export type { ButtonProps, ButtonGroupProps, IconButtonProps, FabProps } 