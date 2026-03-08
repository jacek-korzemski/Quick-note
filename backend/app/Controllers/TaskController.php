<?php

class TaskController {

    private const STATUS_LABELS = [
        Task::STATUS_TODO => 'Do zrobienia',
        Task::STATUS_IN_PROGRESS => 'W trakcie',
        Task::STATUS_VERIFICATION => 'Weryfikacja',
        Task::STATUS_DONE => 'Zakończone',
    ];

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

    private function ensureBoardAccess(\Base $f3, int $boardId, int $userId): ?Board {
        $board = new Board($f3->get('DB'));
        $board->load(['id = ? AND user_id = ?', $boardId, $userId]);
        return $board->dry() ? null : $board;
    }

    public function index(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $boardId = (int) ($params['boardId'] ?? 0);
        if (!$boardId || !$this->ensureBoardAccess($f3, $boardId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $task = new Task($f3->get('DB'));
        $tasks = $task->findByBoard($boardId, (int) $user->id);
        $this->json($f3, ['tasks' => $tasks]);
    }

    public function create(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $boardId = (int) ($params['boardId'] ?? 0);
        if (!$boardId || !$this->ensureBoardAccess($f3, $boardId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $data = $this->getBody();
        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');
        $difficulty = isset($data['difficulty']) ? (int) $data['difficulty'] : 0;

        if (!$title) {
            $this->json($f3, ['error' => 'Tytuł jest wymagany.'], 400);
            return;
        }

        $task = new Task($f3->get('DB'));
        $task->reset();
        $task->board_id = $boardId;
        $task->title = $title;
        $task->content = $content;
        $task->difficulty = $difficulty;
        $task->created_at = date('Y-m-d H:i:s');
        $task->status = Task::STATUS_TODO;
        $task->position = $task->getMaxPosition($boardId, Task::STATUS_TODO);
        $task->save();

        $history = new TaskHistory($f3->get('DB'));
        $history->add((int) $task->id, 'Utworzono zadanie.');

        $arr = $task->toArray();
        $arr['history'] = $history->findByTask((int) $task->id);
        $this->json($f3, ['task' => $arr], 201);
    }

    public function update(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $boardId = (int) ($params['boardId'] ?? 0);
        $id = (int) ($params['id'] ?? 0);
        if (!$boardId || !$id) {
            $this->json($f3, ['error' => 'Nieprawidłowe ID.'], 400);
            return;
        }

        $task = new Task($f3->get('DB'));
        if (!$task->findByIdAndBoard($id, $boardId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Zadanie nie zostało znalezione.'], 404);
            return;
        }

        $data = $this->getBody();
        $title = isset($data['title']) ? trim($data['title']) : $task->title;
        $content = isset($data['content']) ? trim($data['content']) : ($task->content ?? '');
        $difficulty = isset($data['difficulty']) ? (int) $data['difficulty'] : (int) ($task->difficulty ?? 0);
        $status = isset($data['status']) ? trim($data['status']) : $task->status;
        if (!in_array($status, Task::STATUSES, true)) {
            $status = $task->status;
        }

        $history = new TaskHistory($f3->get('DB'));
        $descriptions = [];

        if ($title !== $task->title) {
            $descriptions[] = 'Zmieniono tytuł.';
        }
        if ($content !== ($task->content ?? '')) {
            $descriptions[] = 'Zmieniono treść.';
        }
        if ($difficulty !== (int) ($task->difficulty ?? 0)) {
            $descriptions[] = 'Zmieniono stopień trudności na ' . $difficulty . '.';
        }
        if ($status !== $task->status) {
            $toLabel = self::STATUS_LABELS[$status] ?? $status;
            $descriptions[] = 'Przeniesiono do: ' . $toLabel . '.';
        }

        $oldStatus = $task->status;
        $task->title = $title;
        $task->content = $content;
        $task->difficulty = $difficulty;
        $task->status = $status;
        if ($status !== $oldStatus) {
            $task->position = $task->getMaxPosition($boardId, $status);
        }
        $task->save();

        foreach ($descriptions as $desc) {
            $history->add((int) $task->id, $desc);
        }

        $arr = $task->toArray();
        $arr['history'] = $history->findByTask((int) $task->id);
        $this->json($f3, ['task' => $arr]);
    }

    public function reorder(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $boardId = (int) ($params['boardId'] ?? 0);
        if (!$boardId || !$this->ensureBoardAccess($f3, $boardId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $data = $this->getBody();
        $status = isset($data['status']) ? trim($data['status']) : '';
        $taskIds = $data['task_ids'] ?? $data['taskIds'] ?? [];

        if (!in_array($status, Task::STATUSES, true) || !is_array($taskIds)) {
            $this->json($f3, ['error' => 'Nieprawidłowe dane (status, task_ids).'], 400);
            return;
        }

        $task = new Task($f3->get('DB'));
        $history = new TaskHistory($f3->get('DB'));

        foreach ($taskIds as $index => $taskId) {
            $id = (int) $taskId;
            if (!$id) continue;
            if (!$task->findByIdAndBoard($id, $boardId, (int) $user->id)) {
                continue;
            }
            $task->status = $status;
            $task->position = $index;
            $task->save();
            $history->add($id, 'Zmieniono kolejność.');
        }

        $task = new Task($f3->get('DB'));
        $tasks = $task->findByBoard($boardId, (int) $user->id);
        $this->json($f3, ['tasks' => $tasks]);
    }

    public function delete(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $boardId = (int) ($params['boardId'] ?? 0);
        $id = (int) ($params['id'] ?? 0);
        if (!$boardId || !$id) {
            $this->json($f3, ['error' => 'Nieprawidłowe ID.'], 400);
            return;
        }

        $task = new Task($f3->get('DB'));
        if (!$task->findByIdAndBoard($id, $boardId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Zadanie nie zostało znalezione.'], 404);
            return;
        }

        $f3->get('DB')->exec('DELETE FROM task_history WHERE task_id = ?', [$id]);
        $task->erase();
        $this->json($f3, ['message' => 'Zadanie zostało usunięte.']);
    }
}
