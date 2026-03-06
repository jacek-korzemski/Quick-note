import { styled } from "styled-components";

const SpinnerWrapper = styled.div`
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  width: 24px;
  height: 24px;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-top-color: ${({ theme }) => theme.colors.primary};
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
`;

export const Spinner = () => <SpinnerWrapper />;