export interface ColumnProps {
  children: React.ReactNode;
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  fullHeight?: boolean;
  fullWidth?: boolean;
  padding?: string;
  className?: string;
}

export interface RowProps {
  children: React.ReactNode;
  gap?: string;
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  fullHeight?: boolean;
  fullWidth?: boolean;
  padding?: string;
  className?: string;
  style?: any;
}

export interface FlexItemProps {
  children: React.ReactNode;
  grow?: number;
  shrink?: number;
  basis?: string;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  order?: number;
  className?: string;
}

export interface FullScreenProps {
  children: React.ReactNode;
  center?: boolean;
  padding?: string;
  className?: string;
}

export interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'full';
  padding?: string;
  center?: boolean;
  className?: string;
}

export interface GridProps {
  children: React.ReactNode;
  columns?: number | string;
  rows?: number | string;
  gap?: string;
  rowGap?: string;
  columnGap?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
  alignContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';
  justifyContent?: 'start' | 'center' | 'end' | 'stretch' | 'space-between' | 'space-around';
  minRowHeight?: string;
  autoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  className?: string;
  fullHeight?: boolean;
}

export interface GridItemProps {
  children: React.ReactNode;
  colSpan?: number | string;
  rowSpan?: number | string;
  colStart?: number | string;
  colEnd?: number | string;
  rowStart?: number | string;
  rowEnd?: number | string;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
}
