import React from 'react';
import { StyledColumn } from './styles';
import { ColumnProps } from './types';

export const Column: React.FC<ColumnProps> = ({ children, ...props }) => {
  return <StyledColumn {...props}>{children}</StyledColumn>;
};