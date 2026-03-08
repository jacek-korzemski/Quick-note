<?php

class Task extends \DB\SQL\Mapper {

    public const STATUS_TODO = 'todo';
    public const STATUS_IN_PROGRESS = 'in_progress';
    public const STATUS_VERIFICATION = 'verification';
    public const STATUS_DONE = 'done';

    public const STATUSES = [
        self::STATUS_TODO,
        self::STATUS_IN_PROGRESS,
        self::STATUS_VERIFICATION,
        self::STATUS_DONE,
    ];

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'tasks');
    }

    public function findByBoard(int $boardId, int $userId): array {
        $board = new Board($this->db);
        if (!$board->findByIdAndUser($boardId, $userId)) {
            return [];
        }
        $results = $this->find(
            ['board_id = ?', $boardId],
            ['order' => 'status ASC, position ASC, id ASC']
        );
        $out = [];
        foreach ($results as $task) {
            $arr = $task->toArray();
            $history = new TaskHistory($this->db);
            $arr['history'] = $history->findByTask((int) $task->id);
            $out[] = $arr;
        }
        return $out;
    }

    public function findByIdAndBoard(int $id, int $boardId, int $userId): bool {
        $board = new Board($this->db);
        if (!$board->findByIdAndUser($boardId, $userId)) {
            return false;
        }
        $this->load(['id = ? AND board_id = ?', $id, $boardId]);
        return !$this->dry();
    }

    public function getMaxPosition(int $boardId, string $status): int {
        $result = $this->db->exec(
            'SELECT COALESCE(MAX(position), -1) + 1 AS next_pos FROM tasks WHERE board_id = ? AND status = ?',
            [$boardId, $status]
        );
        return isset($result[0]['next_pos']) ? (int) $result[0]['next_pos'] : 0;
    }

    public function toArray(): array {
        return [
            'id'         => (int) $this->id,
            'board_id'   => (int) $this->board_id,
            'title'      => $this->title,
            'content'    => $this->content ?? '',
            'difficulty' => (int) ($this->difficulty ?? 0),
            'created_at' => $this->created_at,
            'status'     => $this->status ?? self::STATUS_TODO,
            'position'   => (int) ($this->position ?? 0),
        ];
    }
}
