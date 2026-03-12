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
        $results = $this->find($cond, ['order' => 'position ASC, updated_at DESC, created_at DESC']);
        return array_map(fn($note) => $note->toArray(), $results);
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function getMaxPosition(int $userId, ?int $categoryId): int {
        $cond = 'user_id = ?';
        $params = [$userId];
        if ($categoryId !== null) {
            $cond .= ' AND category_id = ?';
            $params[] = $categoryId;
        } else {
            $cond .= ' AND category_id IS NULL';
        }
        $result = $this->db->exec(
            'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM notes WHERE ' . $cond,
            $params
        );
        return isset($result[0]['next_pos']) ? (int) $result[0]['next_pos'] : 0;
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
            'position'    => (int) ($this->position ?? 0),
        ];
    }
}
