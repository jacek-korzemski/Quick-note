export type LoaderSize = 'sm' | 'md' | 'lg' | 'xl';
export type LoaderVariant = 'spinner' | 'dots' | 'pulse' | 'bars';

export interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: string;
  text?: string;
  fullscreen?: boolean;
  overlay?: boolean;
  className?: string;
}

export interface LoaderContainerProps {
  $fullscreen?: boolean;
  $overlay?: boolean;
}

export interface SpinnerProps {
  $size: LoaderSize;
  $color?: string;
}

export interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  animation?: 'pulse' | 'wave' | 'none';
}

export interface PageLoaderProps {
  isLoading: boolean;
  text?: string;
}

export interface ContentLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
  minHeight?: string;
  text?: string;
}