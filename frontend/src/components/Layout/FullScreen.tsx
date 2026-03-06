import React from 'react';
import { FullScreenProps } from './types';
import { StyledFullScreen } from './styles';

export const FullScreen: React.FC<FullScreenProps> = ({ children, ...props }) => {
  return <StyledFullScreen {...props}>{children}</StyledFullScreen>;
};