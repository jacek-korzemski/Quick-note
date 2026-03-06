import React from 'react';
import { DotsContainer, Dot, PulseCircle, BarsContainer, Bar, Spinner, LoaderContainer, LoaderText } from './styles';
import { LoaderProps } from './types';

const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'spinner',
  color,
  text,
  fullscreen = false,
  overlay = false,
  className,
}) => {
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return (
          <DotsContainer $size={size}>
            <Dot $size={size} $color={color} $delay={-0.32} />
            <Dot $size={size} $color={color} $delay={-0.16} />
            <Dot $size={size} $color={color} $delay={0} />
          </DotsContainer>
        );
      case 'pulse':
        return <PulseCircle $size={size} $color={color} />;
      case 'bars':
        return (
          <BarsContainer $size={size}>
            <Bar $size={size} $color={color} $delay={-0.32} />
            <Bar $size={size} $color={color} $delay={-0.24} />
            <Bar $size={size} $color={color} $delay={-0.16} />
            <Bar $size={size} $color={color} $delay={-0.08} />
            <Bar $size={size} $color={color} $delay={0} />
          </BarsContainer>
        );
      default:
        return <Spinner $size={size} $color={color} />;
    }
  };

  return (
    <LoaderContainer 
      $fullscreen={fullscreen} 
      $overlay={overlay || fullscreen}
      className={className}
    >
      {renderLoader()}
      {text && <LoaderText>{text}</LoaderText>}
    </LoaderContainer>
  );
};

export default Loader;