import { css, keyframes, styled } from "styled-components";
import { LoaderContainerProps, LoaderSize, SpinnerProps } from "./types";

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const barBounce = keyframes`
  0%, 40%, 100% { transform: scaleY(0.4); }
  20% { transform: scaleY(1); }
`;

export const sizeMap = {
  sm: { size: 16, thickness: 2 },
  md: { size: 24, thickness: 3 },
  lg: { size: 40, thickness: 4 },
  xl: { size: 64, thickness: 5 },
};

export const LoaderContainer = styled.div<LoaderContainerProps>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  
  ${({ $fullscreen }) => $fullscreen && css`
    position: fixed;
    inset: 0;
    z-index: ${({ theme }) => theme.zIndex.modal + 10};
  `}
  
  ${({ $overlay, theme }) => $overlay && css`
    background-color: ${theme.colors.overlay};
  `}
`;

export const LoaderText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Spinner = styled.div<SpinnerProps>`
  width: ${({ $size }) => sizeMap[$size].size}px;
  height: ${({ $size }) => sizeMap[$size].size}px;
  border: ${({ $size }) => sizeMap[$size].thickness}px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const DotsContainer = styled.div<{ $size: LoaderSize }>`
  display: flex;
  gap: ${({ $size }) => sizeMap[$size].size / 4}px;
`;

export const Dot = styled.div<{ $size: LoaderSize; $color?: string; $delay: number }>`
  width: ${({ $size }) => sizeMap[$size].size / 3}px;
  height: ${({ $size }) => sizeMap[$size].size / 3}px;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${bounce} 1.4s ease-in-out infinite both;
  animation-delay: ${({ $delay }) => $delay}s;
`;

export const PulseCircle = styled.div<{ $size: LoaderSize; $color?: string }>`
  width: ${({ $size }) => sizeMap[$size].size}px;
  height: ${({ $size }) => sizeMap[$size].size}px;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

export const BarsContainer = styled.div<{ $size: LoaderSize }>`
  display: flex;
  align-items: center;
  gap: ${({ $size }) => sizeMap[$size].size / 8}px;
  height: ${({ $size }) => sizeMap[$size].size}px;
`;

export const Bar = styled.div<{ $size: LoaderSize; $color?: string; $delay: number }>`
  width: ${({ $size }) => sizeMap[$size].size / 6}px;
  height: 100%;
  background-color: ${({ $color, theme }) => $color || theme.colors.primary};
  animation: ${barBounce} 1.2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

export const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;


export const ContentLoaderWrapper = styled.div<{ $minHeight?: string }>`
  position: relative;
  min-height: ${({ $minHeight }) => $minHeight || '100px'};
`;

export const ContentLoaderOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.overlay};
  z-index: 1;
`;

export const SkeletonBase = styled.div<{
  $width?: string;
  $height?: string;
  $borderRadius?: string;
  $variant?: 'text' | 'rectangular' | 'circular';
  $animation?: 'pulse' | 'wave' | 'none';
}>`
  background-color: ${({ theme }) => theme.colors.surfaceHover};
  
  ${({ $variant, $width, $height, $borderRadius }) => {
    switch ($variant) {
      case 'text':
        return css`
          width: ${$width || '100%'};
          height: ${$height || '1em'};
          border-radius: ${$borderRadius || '4px'};
        `;
      case 'circular':
        return css`
          width: ${$width || '40px'};
          height: ${$height || '40px'};
          border-radius: 50%;
        `;
      default:
        return css`
          width: ${$width || '100%'};
          height: ${$height || '100px'};
          border-radius: ${$borderRadius || '4px'};
        `;
    }
  }}
  
  ${({ $animation, theme }) => {
    if ($animation === 'pulse') {
      return css`
        animation: ${pulse} 1.5s ease-in-out infinite;
      `;
    }
    if ($animation === 'wave') {
      return css`
        background: linear-gradient(
          90deg,
          ${theme.colors.surfaceHover} 25%,
          ${theme.colors.surfaceActive} 50%,
          ${theme.colors.surfaceHover} 75%
        );
        background-size: 200% 100%;
        animation: ${shimmer} 1.5s ease-in-out infinite;
      `;
    }
    return '';
  }}
`;