<?php

class Board extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'boards');
    }

    public function findByUser(int $userId, ?int $boardCategoryId = null, bool $archived = false): array {
        $cond = ['user_id = ?', $userId];
        if ($boardCategoryId !== null) {
            $cond[0] .= ' AND board_category_id = ?';
            $cond[] = $boardCategoryId;
        }
        if ($archived) {
            $cond[0] .= ' AND archived_at IS NOT NULL';
        } else {
            $cond[0] .= ' AND archived_at IS NULL';
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
            'board_category_id'  => isset($this->board_category_id) && (string) $this->board_category_id !== '' ? (int) $this->board_category_id : null,
            'user_id'            => (int) $this->user_id,
            'archived_at'        => isset($this->archived_at) && (string) $this->archived_at !== '' ? (string) $this->archived_at : null,
        ];
    }
}
