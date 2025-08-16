import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  gradient?: 'purple' | 'green' | 'blue' | 'orange' | 'red' | 'cyan' | 'pink' | 'indigo';
  hover?: boolean;
  glow?: boolean;
}

export function GlassCard({ 
  children, 
  className, 
  gradient,
  hover = false,
  glow = false,
  ...props 
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card rounded-3xl shadow-xl",
        gradient && `gradient-${gradient}`,
        hover && "hover:scale-105 transition-all duration-500 cursor-pointer",
        glow && "hover:animate-glow",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
