<?php

class TimeTask extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'time_tasks');
    }

    public function findByIdAndUser(int $id, int $userId): bool {
        $this->load(['id = ? AND user_id = ?', $id, $userId]);
        return !$this->dry();
    }

    public function toArray(): array {
        return [
            'id'               => (int) $this->id,
            'user_id'          => (int) $this->user_id,
            'title'            => (string) $this->title,
            'description'      => (string) ($this->description ?? ''),
            'duration_minutes' => (int) $this->duration_minutes,
            'created_at'       => (string) $this->created_at,
            'updated_at'       => (string) ($this->updated_at ?? ''),
            'comment'          => (string) ($this->comment ?? ''),
        ];
    }
}

