<?php

class ExpenseCategory extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'expense_categories');
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function findVisibleForMonth(int $userId, string $month): array {
        $rows = $this->db->exec(
            'SELECT * FROM expense_categories
             WHERE user_id = ?
               AND created_month <= ?
               AND (deleted_month IS NULL OR deleted_month > ?)
             ORDER BY position ASC, created_at ASC',
            [$userId, $month, $month]
        );
        return $rows;
    }

    public function getMaxPosition(int $userId): int {
        $row = $this->db->exec(
            'SELECT MAX(position) AS max_pos FROM expense_categories WHERE user_id = ?',
            [$userId]
        );
        return (int) ($row[0]['max_pos'] ?? 0);
    }

    public function toArray(): array {
        return [
            'id'            => (int) $this->id,
            'user_id'       => (int) $this->user_id,
            'name'          => (string) $this->name,
            'color'         => (string) $this->color,
            'created_month' => (string) $this->created_month,
            'deleted_month' => $this->deleted_month !== null ? (string) $this->deleted_month : null,
            'position'      => (int) $this->position,
            'created_at'    => (string) $this->created_at,
        ];
    }
}
