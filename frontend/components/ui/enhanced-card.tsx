import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Enhanced Card Component with Design System Integration
 * 
 * Features:
 * - Multiple visual variants (elevated, outlined, filled, glass)
 * - Interactive states (hoverable, clickable)
 * - Flexible layouts (compact, comfortable, spacious)
 * - Loading and skeleton states
 * - Enhanced accessibility
 * - Animation support
 * - Design token integration
 */

const cardVariants = cva(
  [
    "rounded-lg border transition-all duration-200",
    "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-card text-card-foreground border-border",
          "shadow-sm",
        ],
        elevated: [
          "bg-card text-card-foreground border-border",
          "shadow-md hover:shadow-lg",
        ],
        outlined: [
          "bg-transparent border-2 border-border",
          "hover:border-primary/50",
        ],
        filled: [
          "bg-muted text-muted-foreground border-transparent",
          "hover:bg-muted/80",
        ],
        glass: [
          "bg-background/50 backdrop-blur-sm border-border/50",
          "hover:bg-background/60",
        ],
        gradient: [
          "bg-gradient-to-br from-primary/5 to-secondary/5",
          "border-primary/20 hover:border-primary/30",
        ],
        success: [
          "bg-green-50 text-green-900 border-green-200",
          "dark:bg-green-950 dark:text-green-100 dark:border-green-800",
        ],
        warning: [
          "bg-yellow-50 text-yellow-900 border-yellow-200",
          "dark:bg-yellow-950 dark:text-yellow-100 dark:border-yellow-800",
        ],
        error: [
          "bg-red-50 text-red-900 border-red-200",
          "dark:bg-red-950 dark:text-red-100 dark:border-red-800",
        ],
        info: [
          "bg-blue-50 text-blue-900 border-blue-200",
          "dark:bg-blue-950 dark:text-blue-100 dark:border-blue-800",
        ],
      },
      size: {
        sm: "p-3",
        default: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      interactive: {
        none: "",
        hover: "hover:scale-[1.02] cursor-pointer",
        press: "hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
      },
      loading: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: "none",
      loading: false,
    },
  }
)

const cardHeaderVariants = cva(
  "flex flex-col space-y-1.5",
  {
    variants: {
      size: {
        sm: "p-3 pb-2",
        default: "p-4 pb-3",
        lg: "p-6 pb-4",
        xl: "p-8 pb-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const cardContentVariants = cva(
  "",
  {
    variants: {
      size: {
        sm: "p-3 pt-0",
        default: "p-4 pt-0",
        lg: "p-6 pt-0",
        xl: "p-8 pt-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

const cardFooterVariants = cva(
  "flex items-center",
  {
    variants: {
      size: {
        sm: "p-3 pt-2",
        default: "p-4 pt-3",
        lg: "p-6 pt-4",
        xl: "p-8 pt-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className, 
    variant, 
    size, 
    interactive, 
    loading,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isClickable = interactive !== "none" || onClick

    return (
      <div
        ref={ref}
        className={cn(
          cardVariants({ variant, size, interactive, loading }),
          // Accessibility improvements
          isClickable && "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          // Reduced motion support
          "motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
          className
        )}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={isClickable ? (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            onClick?.(e as any)
          }
        } : undefined}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = "Card"

export interface CardHeaderProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardHeaderVariants>, "size"> {}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardHeaderVariants({ size }), className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, level = 3, children, ...props }, ref) => {
    const Heading = `h${level}` as keyof JSX.IntrinsicElements

    return (
      <Heading
        ref={ref as any}
        className={cn(
          "text-lg font-semibold leading-none tracking-tight",
          // Responsive text sizing
          level === 1 && "text-2xl lg:text-3xl",
          level === 2 && "text-xl lg:text-2xl",
          level === 3 && "text-lg lg:text-xl",
          level === 4 && "text-base lg:text-lg",
          level === 5 && "text-sm lg:text-base",
          level === 6 && "text-xs lg:text-sm",
          className
        )}
        {...props}
      >
        {children}
      </Heading>
    )
  }
)
CardTitle.displayName = "CardTitle"

export interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground leading-relaxed",
        className
      )}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardContentVariants>, "size"> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardContentVariants({ size }), className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

export interface CardFooterProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Pick<VariantProps<typeof cardFooterVariants>, "size"> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardFooterVariants({ size }), className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

// Skeleton Card for loading states
export interface SkeletonCardProps extends Omit<CardProps, "loading" | "children"> {
  showHeader?: boolean
  showFooter?: boolean
  lines?: number
}

const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ 
    className, 
    showHeader = true, 
    showFooter = false, 
    lines = 3,
    size = "default",
    ...props 
  }, ref) => (
    <Card
      ref={ref}
      className={cn("animate-pulse", className)}
      size={size}
      loading={true}
      {...props}
    >
      {showHeader && (
        <CardHeader size={size}>
          <div className="h-5 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </CardHeader>
      )}
      <CardContent size={size}>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-4 bg-muted rounded",
                i === lines - 1 ? "w-2/3" : "w-full"
              )}
            />
          ))}
        </div>
      </CardContent>
      {showFooter && (
        <CardFooter size={size}>
          <div className="h-8 bg-muted rounded w-20" />
        </CardFooter>
      )}
    </Card>
  )
)
SkeletonCard.displayName = "SkeletonCard"

// Card Grid for layout
export interface CardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: "sm" | "md" | "lg" | "xl"
  responsive?: boolean
}

const CardGrid = React.forwardRef<HTMLDivElement, CardGridProps>(
  ({ 
    className, 
    columns = 3, 
    gap = "md",
    responsive = true,
    ...props 
  }, ref) => {
    const gapClasses = {
      sm: "gap-2",
      md: "gap-4",
      lg: "gap-6",
      xl: "gap-8",
    }

    const columnClasses = responsive ? {
      1: "grid-cols-1",
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
      5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5",
      6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6",
    } : {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          columnClasses[columns],
          gapClasses[gap],
          className
        )}
        {...props}
      />
    )
  }
)
CardGrid.displayName = "CardGrid"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  SkeletonCard,
  CardGrid,
  cardVariants,
}

// Export types for external use
export type {
  CardProps,
  CardHeaderProps,
  CardTitleProps,
  CardDescriptionProps,
  CardContentProps,
  CardFooterProps,
  SkeletonCardProps,
  CardGridProps,
} 