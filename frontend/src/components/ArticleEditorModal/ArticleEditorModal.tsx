import { useState, useEffect, type FormEvent } from 'react';
import styled from 'styled-components';
import Modal from '@/components/Modal/Modal';
import Input from '@/components/Form/Input';
import { Select } from '@/components/Form/Select';
import { Button } from '@/components/Button/Button';
import { StyledButton } from '@/components/Modal/styles';
import { articlesApi } from '@/api/articles';
import { useArticleCategories } from '@/context/ArticleCategoriesContext';

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 12px;
  font-size: 13px;
`;

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (articleId: number) => void;
}


const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { articleCategories, selectedArticleCategoryId, refreshArticleCategories, loading: categoriesLoading } = useArticleCategories();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      refreshArticleCategories();
      setTitle('');
      setCategoryId(selectedArticleCategoryId ?? null);
      setError('');
    }
  }, [isOpen, selectedArticleCategoryId, refreshArticleCategories]);

  const handleClose = () => {
    setError('');
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Tytuł artykułu jest wymagany.');
      return;
    }

    setLoading(true);
    try {
      const payload: { title: string; article_category_id?: number | null } = {
        title: trimmedTitle,
      };
      if (categoryId !== null) {
        payload.article_category_id = categoryId;
      }
      const { article } = await articlesApi.create(payload);
      handleClose();
      onSuccess(article.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wystąpił błąd serwera.');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = articleCategories.map(cat => ({
    value: cat.id,
    label: cat.name,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nowy artykuł"
      maxWidth="480px"
      width="480px"
      loading={loading || categoriesLoading}
      footer={
        <>
          <StyledButton type="button" $variant="secondary" onClick={handleClose} disabled={loading}>
            Anuluj
          </StyledButton>
          <Button type="submit" form="article-editor-form" variant="primary" loading={loading}>
            Utwórz
          </Button>
        </>
      }
    >
      <form id="article-editor-form" onSubmit={handleSubmit}>
        {error && <ErrorText>{error}</ErrorText>}

        <Input
          label="Tytuł artykułu"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Wpisz tytuł artykułu"
          fullWidth
          required
          autoFocus
        />

        <div style={{ marginTop: 16 }}>
          <Select
            label="Kategoria"
            placeholder="Wybierz kategorię (opcjonalnie)"
            options={[
              { value: '', label: 'Brak (Wszystkie artykuły)' },
              ...categoryOptions.map((opt) => ({ value: String(opt.value), label: opt.label })),
            ]}
            value={categoryId !== null ? String(categoryId) : ''}
            onChange={(value) => {
              setCategoryId(value ? Number(value) : null);
            }}
            fullWidth
            dropdownZIndex={500}
          />
        </div>
      </form>
    </Modal>
  );
};

export default ArticleEditorModal;

