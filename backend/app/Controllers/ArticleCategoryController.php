<?php

class ArticleCategoryController {

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

        $category = new ArticleCategory($f3->get('DB'));
        $categories = $category->findByUser((int) $user->id);
        $this->json($f3, ['article_categories' => $categories]);
    }

    public function create(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $name = trim($data['name'] ?? '');
        $parentId = isset($data['parent_id']) ? (int) $data['parent_id'] : null;

        if (!$name) {
            $this->json($f3, ['error' => 'Nazwa kategorii jest wymagana.'], 400);
            return;
        }

        if ($parentId > 0) {
            $parent = new ArticleCategory($f3->get('DB'));
            if (!$parent->findByIdAndUser($parentId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria nadrzędna nie istnieje.'], 400);
                return;
            }
        } else {
            $parentId = null;
        }

        $category = new ArticleCategory($f3->get('DB'));
        $category->reset();
        $category->name = $name;
        $category->parent_id = $parentId;
        $category->user_id = (int) $user->id;
        $category->save();

        $this->json($f3, ['article_category' => $category->toArray()], 201);
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

        $category = new ArticleCategory($f3->get('DB'));
        if (!$category->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria nie została znaleziona.'], 404);
            return;
        }

        $data = $this->getBody();
        $name = isset($data['name']) ? trim($data['name']) : $category->name;
        $parentId = isset($data['parent_id']) ? (int) $data['parent_id'] : $category->parent_id;

        if (!$name) {
            $this->json($f3, ['error' => 'Nazwa kategorii jest wymagana.'], 400);
            return;
        }

        if ($parentId > 0) {
            if ($parentId === $id) {
                $this->json($f3, ['error' => 'Kategoria nie może być swoją nadrzędną.'], 400);
                return;
            }
            $parent = new ArticleCategory($f3->get('DB'));
            if (!$parent->findByIdAndUser($parentId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria nadrzędna nie istnieje.'], 400);
                return;
            }
        } else {
            $parentId = null;
        }

        $category->name = $name;
        $category->parent_id = $parentId;
        $category->save();

        $this->json($f3, ['article_category' => $category->toArray()]);
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

        $category = new ArticleCategory($f3->get('DB'));
        if (!$category->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria nie została znaleziona.'], 404);
            return;
        }

        $parentId = $category->parent_id !== null ? (int) $category->parent_id : null;

        $db = $f3->get('DB');
        $db->exec('UPDATE article_categories SET parent_id = ? WHERE parent_id = ?', [$parentId, $id]);
        if ($parentId !== null) {
            $db->exec('UPDATE articles SET article_category_id = ? WHERE article_category_id = ?', [$parentId, $id]);
        } else {
            $db->exec('UPDATE articles SET article_category_id = NULL WHERE article_category_id = ?', [$id]);
        }

        $category->erase();

        $this->json($f3, ['message' => 'Kategoria artykułów została usunięta.']);
    }
}

