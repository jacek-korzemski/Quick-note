<?php

class AuthController {

    private function json($f3, $data, int $status = 200): void {
        $f3->status($status);
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        echo json_encode($data);
    }

    private function getBody(): array {
        $body = file_get_contents('php://input');
        return json_decode($body, true) ?: [];
    }

    private function getToken($f3): ?string {
        $auth = $f3->get('HEADERS.Authorization') ?? $f3->get('HEADERS.authorization') ?? '';
        if (preg_match('/^Bearer\s+(.+)$/i', $auth, $matches)) {
            return $matches[1];
        }
        return null;
    }

    public function register(\Base $f3): void {
        $data = $this->getBody();

        $username = trim($data['username'] ?? '');
        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$username || !$email || !$password) {
            $this->json($f3, ['error' => 'Wszystkie pola są wymagane.'], 400);
            return;
        }

        if (strlen($username) < 3) {
            $this->json($f3, ['error' => 'Nazwa użytkownika musi mieć min. 3 znaki.'], 400);
            return;
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->json($f3, ['error' => 'Nieprawidłowy adres email.'], 400);
            return;
        }

        if (strlen($password) < 6) {
            $this->json($f3, ['error' => 'Hasło musi mieć min. 6 znaków.'], 400);
            return;
        }

        $user = new User($f3->get('DB'));

        if ($user->findByEmail($email)) {
            $this->json($f3, ['error' => 'Ten adres email jest już zajęty.'], 409);
            return;
        }

        if ($user->findByUsername($username)) {
            $this->json($f3, ['error' => 'Ta nazwa użytkownika jest już zajęta.'], 409);
            return;
        }

        $user->reset();
        $user->username = $username;
        $user->email = $email;
        $user->setPassword($password);
        $token = $user->generateToken();
        $user->save();

        $this->json($f3, [
            'user'  => $user->toArray(),
            'token' => $token,
        ], 201);
    }

    public function login(\Base $f3): void {
        $data = $this->getBody();

        $email    = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        if (!$email || !$password) {
            $this->json($f3, ['error' => 'Email i hasło są wymagane.'], 400);
            return;
        }

        $user = new User($f3->get('DB'));

        if (!$user->findByEmail($email)) {
            $this->json($f3, ['error' => 'Nieprawidłowy email lub hasło.'], 401);
            return;
        }

        if (!$user->verifyPassword($password)) {
            $this->json($f3, ['error' => 'Nieprawidłowy email lub hasło.'], 401);
            return;
        }

        $token = $user->generateToken();
        $user->save();

        $this->json($f3, [
            'user'  => $user->toArray(),
            'token' => $token,
        ]);
    }

    public function logout(\Base $f3): void {
        $token = $this->getToken($f3);

        if (!$token) {
            $this->json($f3, ['error' => 'Brak tokenu autoryzacji.'], 401);
            return;
        }

        $user = new User($f3->get('DB'));

        if ($user->findByToken($token)) {
            $user->token = null;
            $user->save();
        }

        $this->json($f3, ['message' => 'Wylogowano pomyślnie.']);
    }

    public function me(\Base $f3): void {
        $token = $this->getToken($f3);

        if (!$token) {
            $this->json($f3, ['error' => 'Brak tokenu autoryzacji.'], 401);
            return;
        }

        $user = new User($f3->get('DB'));

        if (!$user->findByToken($token)) {
            $this->json($f3, ['error' => 'Nieprawidłowy token.'], 401);
            return;
        }

        $this->json($f3, ['user' => $user->toArray()]);
    }
}
