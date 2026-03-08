<?php

class BoardController {

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

        $boardCategoryId = $f3->get('GET.board_category_id');
        $boardCategoryId = ($boardCategoryId !== null && $boardCategoryId !== '') ? (int) $boardCategoryId : null;

        $archived = $f3->get('GET.archived');
        $archived = ($archived === '1' || $archived === 'true');

        $board = new Board($f3->get('DB'));
        $boards = $board->findByUser((int) $user->id, $boardCategoryId, $archived);
        $this->json($f3, ['boards' => $boards]);
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

        $board = new Board($f3->get('DB'));
        if (!$board->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $this->json($f3, ['board' => $board->toArray()]);
    }

    public function archive(\Base $f3, array $params): void {
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

        $board = new Board($f3->get('DB'));
        if (!$board->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        if (isset($board->archived_at) && (string) $board->archived_at !== '') {
            $this->json($f3, ['error' => 'Tablica jest już zarchiwizowana.'], 400);
            return;
        }

        $board->archived_at = date('Y-m-d H:i:s');
        $board->board_category_id = null;
        $board->save();

        $this->json($f3, ['board' => $board->toArray()]);
    }

    public function copy(\Base $f3, array $params): void {
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

        $board = new Board($f3->get('DB'));
        if (!$board->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        if (!isset($board->archived_at) || (string) $board->archived_at === '') {
            $this->json($f3, ['error' => 'Kopiowanie dozwolone tylko z tablicy zarchiwizowanej.'], 400);
            return;
        }

        $data = $this->getBody();
        $boardCategoryId = isset($data['board_category_id']) ? (int) $data['board_category_id'] : 0;
        $taskIds = $data['task_ids'] ?? $data['taskIds'] ?? [];
        if (!is_array($taskIds)) {
            $taskIds = [];
        }

        if ($boardCategoryId <= 0) {
            $this->json($f3, ['error' => 'Kategoria docelowa jest wymagana.'], 400);
            return;
        }

        $cat = new BoardCategory($f3->get('DB'));
        if (!$cat->findByIdAndUser($boardCategoryId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria docelowa nie istnieje.'], 400);
            return;
        }

        $newBoard = new Board($f3->get('DB'));
        $newBoard->reset();
        $newBoard->name = $board->name . ' (kopia)';
        $newBoard->board_category_id = $boardCategoryId;
        $newBoard->user_id = (int) $user->id;
        $newBoard->save();

        $task = new Task($f3->get('DB'));
        $sourceTasks = $task->findByBoard($id, (int) $user->id);
        $sourceTasksById = [];
        foreach ($sourceTasks as $t) {
            $sourceTasksById[(int) $t['id']] = $t;
        }

        $positionsByStatus = [
            Task::STATUS_TODO => 0,
            Task::STATUS_IN_PROGRESS => 0,
            Task::STATUS_VERIFICATION => 0,
            Task::STATUS_DONE => 0,
        ];

        foreach ($taskIds as $taskId) {
            $tid = (int) $taskId;
            if ($tid <= 0 || !isset($sourceTasksById[$tid])) {
                continue;
            }
            $src = $sourceTasksById[$tid];
            $status = $src['status'] ?? Task::STATUS_TODO;
            if (!in_array($status, Task::STATUSES, true)) {
                $status = Task::STATUS_TODO;
            }
            $pos = $positionsByStatus[$status]++;

            $newTask = new Task($f3->get('DB'));
            $newTask->reset();
            $newTask->board_id = $newBoard->id;
            $newTask->title = $src['title'] ?? '';
            $newTask->content = $src['content'] ?? '';
            $newTask->difficulty = (int) ($src['difficulty'] ?? 0);
            $newTask->created_at = date('Y-m-d H:i:s');
            $newTask->status = $status;
            $newTask->position = $pos;
            $newTask->save();
        }

        $this->json($f3, ['board' => $newBoard->toArray()], 201);
    }

    public function create(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $name = trim($data['name'] ?? '');
        $boardCategoryId = isset($data['board_category_id']) ? (int) $data['board_category_id'] : null;

        if (!$name) {
            $this->json($f3, ['error' => 'Nazwa tablicy jest wymagana.'], 400);
            return;
        }

        if ($boardCategoryId <= 0) {
            $this->json($f3, ['error' => 'Kategoria tablicy jest wymagana.'], 400);
            return;
        }

        $cat = new BoardCategory($f3->get('DB'));
        if (!$cat->findByIdAndUser($boardCategoryId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria tablicy nie istnieje.'], 400);
            return;
        }

        $board = new Board($f3->get('DB'));
        $board->reset();
        $board->name = $name;
        $board->board_category_id = $boardCategoryId;
        $board->user_id = (int) $user->id;
        $board->save();

        $this->json($f3, ['board' => $board->toArray()], 201);
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

        $board = new Board($f3->get('DB'));
        if (!$board->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $data = $this->getBody();
        $name = isset($data['name']) ? trim($data['name']) : $board->name;
        $boardCategoryId = isset($data['board_category_id']) ? (int) $data['board_category_id'] : (int) $board->board_category_id;

        if (!$name) {
            $this->json($f3, ['error' => 'Nazwa tablicy jest wymagana.'], 400);
            return;
        }

        if ($boardCategoryId > 0) {
            $cat = new BoardCategory($f3->get('DB'));
            if (!$cat->findByIdAndUser($boardCategoryId, (int) $user->id)) {
                $this->json($f3, ['error' => 'Kategoria tablicy nie istnieje.'], 400);
                return;
            }
        }

        $board->name = $name;
        $board->board_category_id = $boardCategoryId;
        $board->save();

        $this->json($f3, ['board' => $board->toArray()]);
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

        $board = new Board($f3->get('DB'));
        if (!$board->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Tablica nie została znaleziona.'], 404);
            return;
        }

        $f3->get('DB')->exec('DELETE FROM task_history WHERE task_id IN (SELECT id FROM tasks WHERE board_id = ?)', [$id]);
        $f3->get('DB')->exec('DELETE FROM tasks WHERE board_id = ?', [$id]);
        $board->erase();

        $this->json($f3, ['message' => 'Tablica została usunięta.']);
    }
}
