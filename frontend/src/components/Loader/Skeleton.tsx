import { SkeletonBase } from "./styles";
import { SkeletonProps } from "./types";

const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  borderRadius,
  variant = 'rectangular',
  animation = 'wave',
}) => {
  return (
    <SkeletonBase
      $width={width}
      $height={height}
      $borderRadius={borderRadius}
      $variant={variant}
      $animation={animation}
    />
  );
};

export default Skeleton;