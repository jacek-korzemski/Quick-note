import React from 'react';
import { StyledButton, IconWrapper } from './styles';
import { Spinner } from '@/components/Spinner/Spinner';
import { ButtonProps } from './types';

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  asLink = false,
  disabled,
  ...props
}) => {
  const effectiveVariant = loading ? 'ghost' : variant;
  const effectiveRightIcon = loading ? <Spinner /> : rightIcon;

  return (
    <StyledButton
      $variant={effectiveVariant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={false}
      $asLink={asLink}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && !loading && <IconWrapper>{leftIcon}</IconWrapper>}
      {children}
      {effectiveRightIcon && <IconWrapper>{effectiveRightIcon}</IconWrapper>}
    </StyledButton>
  );
};