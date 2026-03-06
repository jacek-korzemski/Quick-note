import { forwardRef } from 'react';
import { InputProps } from './types';
import { HelperText, IconWrapper, InputContainer, InputWrapper, Label, StyledInput } from './styles';

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  id,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <InputWrapper $fullWidth={fullWidth}>
      {label && <Label htmlFor={inputId}>{label}</Label>}
      <InputContainer $error={!!error} $disabled={disabled}>
        {leftIcon && <IconWrapper $position="left">{leftIcon}</IconWrapper>}
        <StyledInput
          ref={ref}
          id={inputId}
          disabled={disabled}
          {...props}
        />
        {rightIcon && <IconWrapper $position="right">{rightIcon}</IconWrapper>}
      </InputContainer>
      {(error || helperText) && (
        <HelperText $error={!!error}>{error || helperText}</HelperText>
      )}
    </InputWrapper>
  );
});

Input.displayName = 'Input';

export default Input;