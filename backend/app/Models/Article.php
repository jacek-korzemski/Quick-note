<?php

class Article extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'articles');
    }

    public function findByUser(int $userId, ?int $categoryId = null): array {
        $cond = ['user_id = ?', $userId];
        if ($categoryId !== null) {
            $cond[0] .= ' AND article_category_id = ?';
            $cond[] = $categoryId;
        }
        $results = $this->find($cond, ['order' => 'created_at DESC, id DESC']);
        return array_map(fn($article) => $article->toArray(), $results);
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function toArray(): array {
        return [
            'id'                 => (int) $this->id,
            'title'              => $this->title,
            'content_html'       => $this->content_html ?? '',
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
            'locked_at'          => isset($this->locked_at) && (string) $this->locked_at !== '' ? (string) $this->locked_at : null,
            'user_id'            => (int) $this->user_id,
            'article_category_id'=> isset($this->article_category_id) && $this->article_category_id !== null ? (int) $this->article_category_id : null,
        ];
    }
}

