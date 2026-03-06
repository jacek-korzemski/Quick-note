<?php

class User extends \DB\SQL\Mapper {

    public function __construct(\DB\SQL $db) {
        parent::__construct($db, 'users');
    }

    public function findByEmail(string $email): bool {
        $this->load(['email = ?', $email]);
        return !$this->dry();
    }

    public function findByUsername(string $username): bool {
        $this->load(['username = ?', $username]);
        return !$this->dry();
    }

    public function findByToken(string $token): bool {
        $this->load(['token = ?', $token]);
        return !$this->dry();
    }

    public function setPassword(string $password): void {
        $this->password = password_hash($password, PASSWORD_BCRYPT);
    }

    public function verifyPassword(string $password): bool {
        return password_verify($password, $this->password);
    }

    public function generateToken(): string {
        $token = bin2hex(random_bytes(32));
        $this->token = $token;
        return $token;
    }

    public function toArray(): array {
        return [
            'id'         => $this->id,
            'username'   => $this->username,
            'email'      => $this->email,
            'created_at' => $this->created_at,
        ];
    }
}
