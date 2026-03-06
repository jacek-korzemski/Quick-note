import { css, styled } from "styled-components";
import { ColumnProps, RowProps, FlexItemProps, FullScreenProps, ContainerProps, GridItemProps, GridProps } from "./types";

export const StyledColumn = styled.div<ColumnProps>`
  display: flex;
  flex-direction: column;
  
  ${({ gap }) => gap && css`
    gap: ${gap};
  `}
  
  ${({ align }) => align && css`
    align-items: ${align};
  `}
  
  ${({ justify }) => justify && css`
    justify-content: ${justify};
  `}
  
  ${({ wrap }) => wrap && css`
    flex-wrap: wrap;
  `}
  
  ${({ fullHeight }) => fullHeight && css`
    height: 100%;
  `}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  ${({ padding }) => padding && css`
    padding: ${padding};
  `}
`;

export const StyledRow = styled.div<RowProps>`
  display: flex;
  flex-direction: row;
  
  ${({ gap }) => gap && css`
    gap: ${gap};
  `}
  
  ${({ align }) => align && css`
    align-items: ${align};
  `}
  
  ${({ justify }) => justify && css`
    justify-content: ${justify};
  `}
  
  ${({ wrap }) => wrap && css`
    flex-wrap: wrap;
  `}
  
  ${({ fullHeight }) => fullHeight && css`
    height: 100%;
  `}
  
  ${({ fullWidth }) => fullWidth !== false && css`
    width: 100%;
  `}
  
  ${({ padding }) => padding && css`
    padding: ${padding};
  `}
`;

export const StyledFlexItem = styled.div<FlexItemProps>`
  ${({ grow }) => grow !== undefined && css`
    flex-grow: ${grow};
  `}
  
  ${({ shrink }) => shrink !== undefined && css`
    flex-shrink: ${shrink};
  `}
  
  ${({ basis }) => basis && css`
    flex-basis: ${basis};
  `}
  
  ${({ alignSelf }) => alignSelf && css`
    align-self: ${alignSelf};
  `}
  
  ${({ order }) => order !== undefined && css`
    order: ${order};
  `}
`;

export const StyledFullScreen = styled.div<FullScreenProps>`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  
  ${({ center }) => center && css`
    display: flex;
    align-items: center;
    justify-content: center;
  `}
  
  ${({ padding }) => padding && css`
    padding: ${padding};
  `}
`;

const maxWidthMap = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px',
  full: '100%',
};

export const StyledContainer = styled.div<ContainerProps>`
  width: 100%;
  max-width: ${({ maxWidth = 'xl' }) => maxWidthMap[maxWidth]};
  
  ${({ center }) => center && css`
    margin-left: auto;
    margin-right: auto;
  `}
  
  ${({ padding }) => padding && css`
    padding: ${padding};
  `}
`;

export const StyledGrid = styled.div<GridProps>`
  display: grid;
  width: 100%;
  
  ${({ fullHeight }) => fullHeight && css`
    height: 100%;
  `}
  
  ${({ columns }) => columns && css`
    grid-template-columns: ${typeof columns === 'number' ? `repeat(${columns}, 1fr)` : columns};
  `}
  
  ${({ rows }) => rows && css`
    grid-template-rows: ${typeof rows === 'number' ? `repeat(${rows}, 1fr)` : rows};
  `}
  
  ${({ gap }) => gap && css`
    gap: ${gap};
  `}
  
  ${({ rowGap }) => rowGap && css`
    row-gap: ${rowGap};
  `}
  
  ${({ columnGap }) => columnGap && css`
    column-gap: ${columnGap};
  `}
  
  ${({ alignItems }) => alignItems && css`
    align-items: ${alignItems};
  `}
  
  ${({ justifyItems }) => justifyItems && css`
    justify-items: ${justifyItems};
  `}
  
  ${({ alignContent }) => alignContent && css`
    align-content: ${alignContent};
  `}
  
  ${({ justifyContent }) => justifyContent && css`
    justify-content: ${justifyContent};
  `}
  
  ${({ minRowHeight }) => minRowHeight && css`
    grid-auto-rows: minmax(${minRowHeight}, auto);
  `}
  
  ${({ autoFlow }) => autoFlow && css`
    grid-auto-flow: ${autoFlow};
  `}
`;

export const StyledGridItem = styled.div<GridItemProps>`
  ${({ colSpan }) => colSpan && css`
    grid-column: span ${colSpan};
  `}
  
  ${({ rowSpan }) => rowSpan && css`
    grid-row: span ${rowSpan};
  `}
  
  ${({ colStart }) => colStart && css`
    grid-column-start: ${colStart};
  `}
  
  ${({ colEnd }) => colEnd && css`
    grid-column-end: ${colEnd};
  `}
  
  ${({ rowStart }) => rowStart && css`
    grid-row-start: ${rowStart};
  `}
  
  ${({ rowEnd }) => rowEnd && css`
    grid-row-end: ${rowEnd};
  `}
  
  ${({ alignSelf }) => alignSelf && css`
    align-self: ${alignSelf};
  `}
  
  ${({ justifySelf }) => justifySelf && css`
    justify-self: ${justifySelf};
  `}
`;
