<?php

class Category extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'categories');
    }

    public function findByUser(int $userId): array {
        $results = $this->find(['user_id = ?', $userId], ['order' => 'name ASC']);
        return array_map(fn($cat) => $cat->toArray(), $results);
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function toArray(): array {
        return [
            'id'        => (int) $this->id,
            'name'      => $this->name,
            'parent_id' => $this->parent_id !== null ? (int) $this->parent_id : null,
            'user_id'   => (int) $this->user_id,
        ];
    }
}
