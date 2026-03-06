export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: TooltipPosition;
  delay?: number;
  disabled?: boolean;
}

export interface TooltipContentProps {
  $position: TooltipPosition;
  $coords: { x: number; y: number };
}