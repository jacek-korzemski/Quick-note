<?php

class Note extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'notes');
    }

    public function findByUser(int $userId, ?int $categoryId = null): array {
        $cond = ['user_id = ?', $userId];
        if ($categoryId !== null) {
            $cond[0] .= ' AND category_id = ?';
            $cond[] = $categoryId;
        }
        $results = $this->find($cond, ['order' => 'updated_at DESC, created_at DESC']);
        return array_map(fn($note) => $note->toArray(), $results);
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function toArray(): array {
        return [
            'id'          => (int) $this->id,
            'title'       => $this->title,
            'content'     => $this->content,
            'label'       => $this->label ?? 'none',
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
            'user_id'     => (int) $this->user_id,
            'category_id' => isset($this->category_id) && $this->category_id !== null ? (int) $this->category_id : null,
        ];
    }
}
