<?php

class TaskHistory extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'task_history');
    }

    public function findByTask(int $taskId): array {
        $results = $this->find(['task_id = ?', $taskId], ['order' => 'changed_at DESC']);
        return array_map(fn($row) => [
            'id'          => (int) $row->id,
            'task_id'     => (int) $row->task_id,
            'changed_at'  => $row->changed_at,
            'description' => $row->description,
        ], $results);
    }

    public function add(int $taskId, string $description): void {
        $this->reset();
        $this->task_id = $taskId;
        $this->changed_at = date('Y-m-d H:i:s');
        $this->description = $description;
        $this->save();
    }
}
