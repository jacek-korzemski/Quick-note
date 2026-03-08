<?php

class Board extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'boards');
    }

    public function findByUser(int $userId, ?int $boardCategoryId = null): array {
        $cond = ['user_id = ?', $userId];
        if ($boardCategoryId !== null) {
            $cond[0] .= ' AND board_category_id = ?';
            $cond[] = $boardCategoryId;
        }
        $results = $this->find($cond, ['order' => 'name ASC']);
        return array_map(fn($board) => $board->toArray(), $results);
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function toArray(): array {
        return [
            'id'                 => (int) $this->id,
            'name'               => $this->name,
            'board_category_id'  => (int) $this->board_category_id,
            'user_id'            => (int) $this->user_id,
        ];
    }
}
