import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { articlesApi, type Article } from '@/api/articles';
import SimpleWYSIWYG from '@/components/SimpleWYSIWYG/SimpleWYSIWYG.tsx';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Info = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.fontSize.sm};
`;

const ArticlePage: React.FC = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = articleId ? Number(articleId) : 0;

  const loadArticle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const { article: data } = await articlesApi.getOne(id);
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się załadować artykułu.');
      setArticle(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      void loadArticle();
    } else {
      setLoading(false);
      setArticle(null);
    }
  }, [id, loadArticle]);

  const handleSave = useCallback(
    async (draft: { title: string; content_html: string; locked: boolean }) => {
      if (!article) return;

      await articlesApi.update(article.id, {
        title: draft.title,
        content_html: draft.content_html,
        article_category_id: article.article_category_id,
        locked: draft.locked,
      });

      await loadArticle();
    },
    [article, loadArticle]
  );

  if (!articleId) return null;

  if (loading) {
    return (
      <Wrapper>
        <Info>Ladowanie artykulu...</Info>
      </Wrapper>
    );
  }

  if (error || !article) {
    return (
      <Wrapper>
        <Info>{error ?? 'Artykul nie zostal znaleziony.'}</Info>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <SimpleWYSIWYG article={article} onSave={handleSave} />
    </Wrapper>
  );
};

export default ArticlePage;

