import { styled } from "styled-components";

const TextButton = styled.button`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSize.lg};
  cursor: pointer;
  padding: 0;
  transition: color ${({ theme }) => theme.transitions.fast};
  
  &:hover:not(:disabled) {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.primaryHover};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default TextButton;