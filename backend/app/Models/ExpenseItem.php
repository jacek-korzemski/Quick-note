<?php

class ExpenseItem extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'expense_items');
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function findByCategoryAndMonth(int $categoryId, string $month): array {
        $rows = $this->db->exec(
            'SELECT * FROM expense_items
             WHERE category_id = ? AND month = ?
             ORDER BY day ASC, created_at ASC',
            [$categoryId, $month]
        );
        return $rows;
    }

    public function countByCategoryAndMonth(int $categoryId, string $month): int {
        $row = $this->db->exec(
            'SELECT COUNT(*) AS cnt FROM expense_items WHERE category_id = ? AND month = ?',
            [$categoryId, $month]
        );
        return (int) $row[0]['cnt'];
    }

    public function getLastNonEmptyMonth(int $categoryId): ?string {
        $row = $this->db->exec(
            'SELECT MAX(month) AS last_month FROM expense_items WHERE category_id = ?',
            [$categoryId]
        );
        return $row[0]['last_month'] ?? null;
    }

    public function toArray(): array {
        return [
            'id'          => (int) $this->id,
            'category_id' => (int) $this->category_id,
            'user_id'     => (int) $this->user_id,
            'name'        => (string) $this->name,
            'description' => (string) ($this->description ?? ''),
            'day'         => (int) $this->day,
            'month'       => (string) $this->month,
            'amount'      => (float) $this->amount,
            'created_at'  => (string) $this->created_at,
            'updated_at'  => (string) ($this->updated_at ?? ''),
        ];
    }
}
