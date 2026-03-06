import { css, styled } from "styled-components";

export const CheckboxWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  
  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const CheckboxLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  user-select: none;
`;

export const CheckboxBox = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.xs};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CheckIcon = styled.svg`
  width: 12px;
  height: 12px;
  opacity: 0;
  transform: scale(0.5);
  transition: all ${({ theme }) => theme.transitions.fast};
  color: white;
`;

export const IndeterminateIcon = styled.div`
  width: 10px;
  height: 2px;
  background-color: white;
  opacity: 0;
  transform: scale(0.5);
  transition: all ${({ theme }) => theme.transitions.fast};
`;

export const CheckboxContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

export const InputWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

export const Label = styled.label`
  margin-top: 6px;
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

export const InputContainer = styled.div<{ $error?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme, $error }) => 
    $error ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  transition: all ${({ theme }) => theme.transitions.fast};
  overflow: hidden;
  
  &:focus-within {
    border-color: ${({ theme, $error }) => 
      $error ? theme.colors.error : theme.colors.borderFocus};
    box-shadow: 0 0 0 1px ${({ theme, $error }) => 
      $error ? theme.colors.error : theme.colors.borderFocus};
  }
  
  ${({ $disabled }) => $disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
  `}
`;

export const IconWrapper = styled.span<{ $position?: 'left' | 'right', $isOpen?: boolean; }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: transform ${({ theme }) => theme.transitions.fast};
  
  svg {
    width: 16px;
    height: 16px;
  }

  ${({ $isOpen }) => $isOpen && css`
    transform: rotate(180deg);
  `}
`;

export const StyledInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: transparent;
  border: none;
  outline: none;
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

export const HelperText = styled.span<{ $error?: boolean }>`
  font-size: ${({ theme }) => theme.fontSize.xs};
  color: ${({ theme, $error }) => 
    $error ? theme.colors.error : theme.colors.textSecondary};
`;

export const StyledTextarea = styled.textarea<{ $resize?: string }>`
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.md};
  font-family: inherit;
  color: ${({ theme }) => theme.colors.text};
  resize: ${({ $resize }) => $resize || 'vertical'};
  min-height: 100px;
  transition: border-color ${({ theme }) => theme.transitions.fast};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.borderFocus};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.borderFocus};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RadioWrapper = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  
  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const RadioLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  user-select: none;
`;

export const RadioCircle = styled.div`
  position: relative;
  width: 18px;
  height: 18px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  transition: all ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const RadioDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
  opacity: 0;
  transform: scale(0);
  transition: all ${({ theme }) => theme.transitions.fast};
`;

export const RadioContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

export const RadioGroupWrapper = styled.div<{ $direction: 'horizontal' | 'vertical' }>`
  display: flex;
  flex-direction: ${({ $direction }) => $direction === 'horizontal' ? 'row' : 'column'};
  gap: ${({ theme }) => theme.spacing.md};
`;

export const SelectWrapper = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  width: ${({ $fullWidth }) => $fullWidth ? '100%' : 'auto'};
`;

export const SelectLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSize.sm};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

export const SelectTrigger = styled.button<{ $error?: boolean; $disabled?: boolean; $isOpen?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme, $error, $isOpen }) => 
    $error ? theme.colors.error : $isOpen ? theme.colors.borderFocus : theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  text-align: left;
  
  ${({ $isOpen, theme }) => $isOpen && css`
    box-shadow: 0 0 0 1px ${theme.colors.borderFocus};
  `}
  
  ${({ $disabled }) => $disabled && css`
    opacity: 0.5;
    cursor: not-allowed;
  `}
  
  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.borderLight};
  }
`;

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const Dropdown = styled.div<{ $x: number; $y: number; $width: number; $zIndex?: number }>`
  position: fixed;
  left: ${({ $x }) => $x}px;
  top: ${({ $y }) => $y}px;
  width: ${({ $width }) => $width}px;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: ${({ theme, $zIndex }) => $zIndex ?? theme.zIndex.dropdown};
  padding: ${({ theme }) => theme.spacing.xs} 0;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  background: transparent;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  outline: none;
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

export const Option = styled.div<{ $selected?: boolean; $disabled?: boolean }>`
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  ${({ $selected, theme }) => $selected && css`
    background-color: ${theme.colors.surfaceActive};
  `}
  
  ${({ $disabled, theme }) => $disabled && css`
    opacity: 0.5;
    color: ${theme.colors.textMuted};
  `}
  
  ${({ $disabled }) => !$disabled && css`
    &:hover {
      background-color: ${({ theme }) => theme.colors.surfaceHover};
    }
  `}
`;

export const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.xs};
  flex: 1;
`;

export const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xxs};
  padding: ${({ theme }) => `${theme.spacing.xxs} ${theme.spacing.sm}`};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

export const TagRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: ${({ theme }) => theme.spacing.xxs};
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
  
  svg {
    width: 12px;
    height: 12px;
  }
`;

export const MultiSelectTrigger = styled(SelectTrigger)`
  min-height: 38px;
  height: auto;
  padding: ${({ theme }) => theme.spacing.xs};
`;

export const SwitchWrapper = styled.label<{ $labelPosition: 'left' | 'right' }>`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  cursor: pointer;
  flex-direction: ${({ $labelPosition }) => 
    $labelPosition === 'left' ? 'row' : 'row-reverse'};
  
  &:has(input:disabled) {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const SwitchLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSize.md};
  color: ${({ theme }) => theme.colors.text};
  user-select: none;
`;

export const SwitchTrack = styled.div`
  position: relative;
  width: 40px;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: background-color ${({ theme }) => theme.transitions.normal};
`;

export const SwitchThumb = styled.div`
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background-color: ${({ theme }) => theme.colors.text};
  border-radius: 50%;
  transition: transform ${({ theme }) => theme.transitions.normal};
`;

export const SwitchContainer = styled.div`
  position: relative;
  display: inline-flex;
`;


export const HiddenInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + ${CheckboxBox} {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + ${CheckboxBox} ${CheckIcon} {
    opacity: 1;
    transform: scale(1);
  }
  
  &:focus-visible + ${CheckboxBox} {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  &:checked + ${RadioCircle} {
    background-color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + ${RadioCircle} ${RadioDot} {
    opacity: 1;
    transform: scale(1);
  }
  
  &:focus-visible + ${RadioCircle} {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

    &:checked + ${SwitchTrack} {
    background-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:checked + ${SwitchTrack} ${SwitchThumb} {
    transform: translateX(20px);
  }
  
  &:focus-visible + ${SwitchTrack} {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;
