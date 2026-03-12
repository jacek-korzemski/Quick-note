<?php

class NoteController {

    private const LABELS = ['none', 'info', 'warning', 'error', 'success'];

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

    private function getCurrentUser($f3): ?User {
        $token = $this->getToken($f3);
        if (!$token) return null;

        $user = new User($f3->get('DB'));
        return $user->findByToken($token) ? $user : null;
    }

    public function index(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $categoryId = $f3->get('GET.category_id');
        $categoryId = $categoryId !== null && $categoryId !== '' ? (int) $categoryId : null;

        $note = new Note($f3->get('DB'));
        $notes = $note->findByUser((int) $user->id, $categoryId);
        $this->json($f3, ['notes' => $notes]);
    }

    public function create(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $label = $data['label'] ?? 'none';
        $categoryId = isset($data['category_id']) ? (int) $data['category_id'] : null;

        if (!in_array($label, self::LABELS, true)) {
            $label = 'none';
        }

        if (!$title) {
            $this->json($f3, ['error' => 'Tytuł jest wymagany.'], 400);
            return;
        }

        if ($categoryId !== null && $categoryId > 0) {
            $cat = new Category($f3->get('DB'));
            if (!$cat->findByIdAndUser($categoryId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria nie istnieje.'], 400);
                return;
            }
        } else {
            $categoryId = null;
        }

        $note = new Note($f3->get('DB'));
        $note->reset();
        $note->title = $title;
        $note->content = $content;
        $note->label = $label;
        $note->category_id = $categoryId;
        $note->user_id = (int) $user->id;
        $note->created_at = date('Y-m-d H:i:s');
        $note->updated_at = null;
        $note->position = $note->getMaxPosition((int) $user->id, $categoryId);
        $note->save();

        $this->json($f3, ['note' => $note->toArray()], 201);
    }

    public function update(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $id = (int) ($params['id'] ?? 0);
        if (!$id) {
            $this->json($f3, ['error' => 'Nieprawidłowe ID.'], 400);
            return;
        }

        $note = new Note($f3->get('DB'));
        if (!$note->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Notatka nie została znaleziona.'], 404);
            return;
        }

        $data = $this->getBody();
        $title = isset($data['title']) ? trim($data['title']) : $note->title;
        $content = isset($data['content']) ? trim($data['content']) : $note->content;
        $label = $data['label'] ?? $note->label;
        $categoryId = isset($data['category_id']) ? (int) $data['category_id'] : ($note->category_id ?? null);

        if (!in_array($label, self::LABELS, true)) {
            $label = 'none';
        }

        if (!$title) {
            $this->json($f3, ['error' => 'Tytuł jest wymagany.'], 400);
            return;
        }

        if ($categoryId !== null && $categoryId > 0) {
            $cat = new Category($f3->get('DB'));
            if (!$cat->findByIdAndUser($categoryId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria nie istnieje.'], 400);
                return;
            }
        } else {
            $categoryId = null;
        }

        $note->title = $title;
        $note->content = $content;
        $note->label = $label;
        $note->category_id = $categoryId;
        $note->updated_at = date('Y-m-d H:i:s');
        $note->save();

        $this->json($f3, ['note' => $note->toArray()]);
    }

    public function delete(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $id = (int) ($params['id'] ?? 0);
        if (!$id) {
            $this->json($f3, ['error' => 'Nieprawidłowe ID.'], 400);
            return;
        }

        $note = new Note($f3->get('DB'));
        if (!$note->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Notatka nie została znaleziona.'], 404);
            return;
        }

        $note->erase();
        $this->json($f3, ['message' => 'Notatka została usunięta.']);
    }

    public function reorder(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $noteIds = $data['note_ids'] ?? $data['noteIds'] ?? [];
        if (!is_array($noteIds)) {
            $this->json($f3, ['error' => 'Nieprawidłowe dane (note_ids).'], 400);
            return;
        }

        $note = new Note($f3->get('DB'));
        $userId = (int) $user->id;

        foreach ($noteIds as $index => $noteId) {
            $id = (int) $noteId;
            if (!$id) continue;
            if (!$note->findByIdAndUser($id, $userId)) {
                continue;
            }
            $note->position = $index;
            $note->save();
        }

        $note = new Note($f3->get('DB'));
        $categoryId = $f3->get('GET.category_id');
        $categoryId = $categoryId !== null && $categoryId !== '' ? (int) $categoryId : null;
        $notes = $note->findByUser($userId, $categoryId);
        $this->json($f3, ['notes' => $notes]);
    }
}
