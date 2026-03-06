import React from 'react';
import { StyledGrid, StyledGridItem } from './styles';
import { GridItemProps, GridProps } from './types';

export const Grid: React.FC<GridProps> & { Item: React.FC<GridItemProps> } = ({
  children,
  ...props
}) => {
  return <StyledGrid {...props}>{children}</StyledGrid>;
};

export const GridItem: React.FC<GridItemProps> = ({ children, ...props }) => {
  return <StyledGridItem {...props}>{children}</StyledGridItem>;
};

Grid.Item = GridItem;

export default Grid;