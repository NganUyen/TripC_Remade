import React from 'react'
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  children: React.ReactNode
  className?: string
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ title, children, className, ...props }, ref) => {
  // If title is provided, it behaves like the original legacy card.
  // If not, it behaves like a shadcn Card container.
  if (title) {
    return (
      <div ref={ref} className={`group hover:-translate-y-1 transition-transform duration-300 transform-gpu ${className}`} {...props}>
        <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow p-6">
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">{title}</h3>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-card text-card-foreground shadow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
