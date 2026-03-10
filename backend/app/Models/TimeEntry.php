<?php

class TimeEntry extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'time_entries');
    }

    public function toArray(): array {
        return [
            'id'             => (int) $this->id,
            'user_id'        => (int) $this->user_id,
            'task_id'        => $this->task_id !== null ? (int) $this->task_id : null,
            'start_datetime' => (string) $this->start_datetime,
            'end_datetime'   => (string) $this->end_datetime,
            'created_at'     => (string) $this->created_at,
        ];
    }
}

