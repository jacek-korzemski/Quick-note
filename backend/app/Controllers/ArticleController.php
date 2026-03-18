<?php

class ArticleController {

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

        $categoryId = $f3->get('GET.article_category_id');
        $categoryId = $categoryId !== null && $categoryId !== '' ? (int) $categoryId : null;

        $article = new Article($f3->get('DB'));
        $articles = $article->findByUser((int) $user->id, $categoryId);
        $this->json($f3, ['articles' => $articles]);
    }

    public function getOne(\Base $f3, array $params): void {
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

        $article = new Article($f3->get('DB'));
        if (!$article->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Artykuł nie został znaleziony.'], 404);
            return;
        }

        $this->json($f3, ['article' => $article->toArray()]);
    }

    public function create(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $title = trim($data['title'] ?? '');
        $categoryId = isset($data['article_category_id']) ? (int) $data['article_category_id'] : null;

        if (!$title) {
            $this->json($f3, ['error' => 'Tytuł jest wymagany.'], 400);
            return;
        }

        if ($categoryId !== null && $categoryId > 0) {
            $cat = new ArticleCategory($f3->get('DB'));
            if (!$cat->findByIdAndUser($categoryId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria artykułów nie istnieje.'], 400);
                return;
            }
        } else {
            $categoryId = null;
        }

        $article = new Article($f3->get('DB'));
        $article->reset();
        $article->title = $title;
        $article->content_html = '';
        $article->created_at = date('Y-m-d H:i:s');
        $article->updated_at = null;
        $article->locked_at = null;
        $article->user_id = (int) $user->id;
        $article->article_category_id = $categoryId;
        $article->save();

        $history = new ArticleHistory($f3->get('DB'));
        $history->reset();
        $history->article_id = (int) $article->id;
        $history->saved_at = date('Y-m-d H:i:s');
        $history->save();

        $this->json($f3, ['article' => $article->toArray()], 201);
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

        $article = new Article($f3->get('DB'));
        if (!$article->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Artykuł nie został znaleziony.'], 404);
            return;
        }

        $data = $this->getBody();

        $lockedRequested = array_key_exists('locked', $data) ? (bool) $data['locked'] : null;
        $currentlyLocked = isset($article->locked_at) && (string) $article->locked_at !== '';

        $isUnlocking = $lockedRequested === false && $currentlyLocked;
        $isLocking = $lockedRequested === true && !$currentlyLocked;

        $isChangingLockState = $isUnlocking || $isLocking;

        if ($currentlyLocked && !$isUnlocking) {
            $this->json($f3, ['error' => 'Artykuł jest zablokowany do edycji. Odblokuj go, aby wprowadzić zmiany.'], 400);
            return;
        }

        $title = array_key_exists('title', $data) ? trim((string) $data['title']) : $article->title;
        $contentHtml = array_key_exists('content_html', $data) ? (string) $data['content_html'] : $article->content_html;
        $categoryId = array_key_exists('article_category_id', $data)
            ? (int) $data['article_category_id']
            : ($article->article_category_id ?? null);

        if (!$title) {
            $this->json($f3, ['error' => 'Tytuł jest wymagany.'], 400);
            return;
        }

        if ($categoryId !== null && $categoryId > 0) {
            $cat = new ArticleCategory($f3->get('DB'));
            if (!$cat->findByIdAndUser($categoryId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria artykułów nie istnieje.'], 400);
                return;
            }
        } else {
            $categoryId = null;
        }

        $article->title = $title;
        $article->content_html = $contentHtml;
        $article->article_category_id = $categoryId;

        if ($isUnlocking) {
            $article->locked_at = null;
        } elseif ($isLocking) {
            $article->locked_at = date('Y-m-d H:i:s');
        }

        $article->updated_at = date('Y-m-d H:i:s');
        $article->save();

        $history = new ArticleHistory($f3->get('DB'));
        $history->reset();
        $history->article_id = (int) $article->id;
        $history->saved_at = date('Y-m-d H:i:s');
        $history->save();

        $this->json($f3, ['article' => $article->toArray()]);
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

        $article = new Article($f3->get('DB'));
        if (!$article->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Artykuł nie został znaleziony.'], 404);
            return;
        }

        $db = $f3->get('DB');
        $db->exec('DELETE FROM article_history WHERE article_id = ?', [$id]);
        $article->erase();

        $this->json($f3, ['message' => 'Artykuł został usunięty.']);
    }
}

