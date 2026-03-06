import Loader from "./Loader";
import { ContentLoaderWrapper, ContentLoaderOverlay } from "./styles";
import { ContentLoaderProps } from "./types";

const ContentLoader: React.FC<ContentLoaderProps> = ({
  isLoading,
  children,
  minHeight,
  text,
}) => {
  return (
    <ContentLoaderWrapper $minHeight={minHeight}>
      {isLoading && (
        <ContentLoaderOverlay>
          <Loader text={text} />
        </ContentLoaderOverlay>
      )}
      {children}
    </ContentLoaderWrapper>
  );
};

export default ContentLoader;