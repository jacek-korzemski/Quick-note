<?php

class ArticleHistory extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'article_history');
    }

    public function toArray(): array {
        return [
            'id'         => (int) $this->id,
            'article_id' => (int) $this->article_id,
            'saved_at'   => (string) $this->saved_at,
        ];
    }
}

