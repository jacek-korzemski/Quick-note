<?php

class ExpenseController {

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

    private function nextMonth(string $month): string {
        $dt = new DateTime($month . '-01');
        $dt->modify('+1 month');
        return $dt->format('Y-m');
    }

    /**
     * GET /api/expenses/strip?from=YYYY-MM&to=YYYY-MM
     */
    public function strip(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $from = $f3->get('GET.from');
        $to   = $f3->get('GET.to');
        if (!$from || !preg_match('/^\d{4}-\d{2}$/', $from)) {
            $from = date('Y-m', strtotime('-6 months'));
        }
        if (!$to || !preg_match('/^\d{4}-\d{2}$/', $to)) {
            $to = date('Y-m', strtotime('+5 months'));
        }

        /** @var \DB\SQL $db */
        $db = $f3->get('DB');
        $rows = $db->exec(
            'SELECT month, COUNT(*) AS items_count, COALESCE(SUM(amount), 0) AS total_amount
             FROM expense_items
             WHERE user_id = ? AND month >= ? AND month <= ?
             GROUP BY month',
            [(int) $user->id, $from, $to]
        );

        $dataByMonth = [];
        foreach ($rows as $row) {
            $dataByMonth[$row['month']] = [
                'month'       => $row['month'],
                'items_count' => (int) $row['items_count'],
                'total_amount' => (float) $row['total_amount'],
            ];
        }

        $months = [];
        $current = new DateTime($from . '-01');
        $end     = new DateTime($to . '-01');
        while ($current <= $end) {
            $m = $current->format('Y-m');
            $months[] = $dataByMonth[$m] ?? [
                'month'        => $m,
                'items_count'  => 0,
                'total_amount' => 0,
            ];
            $current->modify('+1 month');
        }

        $this->json($f3, ['months' => $months]);
    }

    /**
     * GET /api/expenses/month?month=YYYY-MM
     */
    public function month(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $month = $f3->get('GET.month');
        if (!$month || !preg_match('/^\d{4}-\d{2}$/', $month)) {
            $month = date('Y-m');
        }

        $catModel = new ExpenseCategory($f3->get('DB'));
        $itemModel = new ExpenseItem($f3->get('DB'));

        $catRows = $catModel->findVisibleForMonth((int) $user->id, $month);

        $categories = [];
        $totalItems = 0;
        $totalAmount = 0.0;
        $byColor = [
            'info'    => ['count' => 0, 'amount' => 0.0],
            'warning' => ['count' => 0, 'amount' => 0.0],
            'error'   => ['count' => 0, 'amount' => 0.0],
            'success' => ['count' => 0, 'amount' => 0.0],
            'none'    => ['count' => 0, 'amount' => 0.0],
        ];

        foreach ($catRows as $cat) {
            $items = $itemModel->findByCategoryAndMonth((int) $cat['id'], $month);

            $itemsArr = [];
            $catTotal = 0.0;
            foreach ($items as $item) {
                $itemsArr[] = [
                    'id'          => (int) $item['id'],
                    'category_id' => (int) $item['category_id'],
                    'user_id'     => (int) $item['user_id'],
                    'name'        => (string) $item['name'],
                    'description' => (string) ($item['description'] ?? ''),
                    'day'         => (int) $item['day'],
                    'month'       => (string) $item['month'],
                    'amount'      => (float) $item['amount'],
                    'created_at'  => (string) $item['created_at'],
                    'updated_at'  => (string) ($item['updated_at'] ?? ''),
                ];
                $catTotal += (float) $item['amount'];
            }

            $color = $cat['color'] ?? 'none';
            $count = count($items);

            $categories[] = [
                'id'            => (int) $cat['id'],
                'name'          => (string) $cat['name'],
                'color'         => (string) $color,
                'created_month' => (string) $cat['created_month'],
                'items'         => $itemsArr,
                'items_count'   => $count,
                'items_total'   => $catTotal,
            ];

            $totalItems += $count;
            $totalAmount += $catTotal;
            if (isset($byColor[$color])) {
                $byColor[$color]['count'] += $count;
                $byColor[$color]['amount'] += $catTotal;
            }
        }

        $this->json($f3, [
            'categories' => $categories,
            'summary'    => [
                'total_items'  => $totalItems,
                'total_amount' => $totalAmount,
                'by_color'     => $byColor,
            ],
        ]);
    }

    /**
     * POST /api/expenses/categories
     */
    public function createCategory(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $body = $this->getBody();
        $name = trim($body['name'] ?? '');
        $color = $body['color'] ?? 'none';
        $createdMonth = $body['created_month'] ?? '';

        if ($name === '') {
            $this->json($f3, ['error' => 'Nazwa jest wymagana.'], 400);
            return;
        }

        $validColors = ['info', 'warning', 'error', 'success', 'none'];
        if (!in_array($color, $validColors, true)) {
            $this->json($f3, ['error' => 'Nieprawidłowy kolor.'], 400);
            return;
        }

        if (!preg_match('/^\d{4}-\d{2}$/', $createdMonth)) {
            $this->json($f3, ['error' => 'Nieprawidłowy miesiąc utworzenia.'], 400);
            return;
        }

        $cat = new ExpenseCategory($f3->get('DB'));
        $cat->user_id = (int) $user->id;
        $cat->name = $name;
        $cat->color = $color;
        $cat->created_month = $createdMonth;
        $cat->position = $cat->getMaxPosition((int) $user->id) + 1;
        $cat->created_at = date('Y-m-d H:i:s');
        $cat->save();

        $this->json($f3, ['category' => $cat->toArray()], 201);
    }

    /**
     * PUT /api/expenses/categories/@id
     */
    public function updateCategory(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $cat = new ExpenseCategory($f3->get('DB'));
        if (!$cat->findByIdAndUser((int) $params['id'], (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria nie została znaleziona.'], 404);
            return;
        }

        $body = $this->getBody();

        if (isset($body['name'])) {
            $name = trim($body['name']);
            if ($name === '') {
                $this->json($f3, ['error' => 'Nazwa jest wymagana.'], 400);
                return;
            }
            $cat->name = $name;
        }

        if (isset($body['color'])) {
            $validColors = ['info', 'warning', 'error', 'success', 'none'];
            if (!in_array($body['color'], $validColors, true)) {
                $this->json($f3, ['error' => 'Nieprawidłowy kolor.'], 400);
                return;
            }
            $cat->color = $body['color'];
        }

        $cat->save();
        $this->json($f3, ['category' => $cat->toArray()]);
    }

    /**
     * PUT /api/expenses/categories/reorder
     */
    public function reorderCategories(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $body = $this->getBody();
        $categoryIds = $body['category_ids'] ?? [];

        if (!is_array($categoryIds) || empty($categoryIds)) {
            $this->json($f3, ['error' => 'Nieprawidłowe dane (category_ids).'], 400);
            return;
        }

        $cat = new ExpenseCategory($f3->get('DB'));
        foreach ($categoryIds as $index => $catId) {
            $id = (int) $catId;
            if (!$id) continue;
            if (!$cat->findByIdAndUser($id, (int) $user->id)) continue;
            $cat->position = $index;
            $cat->save();
        }

        $this->json($f3, ['message' => 'Kolejność została zaktualizowana.']);
    }

    /**
     * DELETE /api/expenses/categories/@id?month=YYYY-MM
     */
    public function deleteCategory(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $cat = new ExpenseCategory($f3->get('DB'));
        if (!$cat->findByIdAndUser((int) $params['id'], (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria nie została znaleziona.'], 404);
            return;
        }

        $month = $f3->get('GET.month');
        if (!$month || !preg_match('/^\d{4}-\d{2}$/', $month)) {
            $this->json($f3, ['error' => 'Parametr month jest wymagany.'], 400);
            return;
        }

        $itemModel = new ExpenseItem($f3->get('DB'));
        $countInMonth = $itemModel->countByCategoryAndMonth((int) $cat->id, $month);
        if ($countInMonth > 0) {
            $this->json($f3, ['error' => 'Nie można usunąć kategorii z pozycjami w tym miesiącu.'], 409);
            return;
        }

        $lastMonth = $itemModel->getLastNonEmptyMonth((int) $cat->id);

        if ($lastMonth === null) {
            $cat->erase();
            $this->json($f3, ['message' => 'Kategoria została usunięta.']);
        } else {
            $cat->deleted_month = $this->nextMonth($lastMonth);
            $cat->save();
            $this->json($f3, ['message' => 'Kategoria została ukryta od przyszłych miesięcy.']);
        }
    }

    /**
     * POST /api/expenses/items
     */
    public function createItem(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $body = $this->getBody();
        $categoryId = (int) ($body['category_id'] ?? 0);
        $name = trim($body['name'] ?? '');
        $description = $body['description'] ?? '';
        $day = (int) ($body['day'] ?? 0);
        $month = $body['month'] ?? '';
        $amount = (float) ($body['amount'] ?? 0);

        if ($categoryId <= 0) {
            $this->json($f3, ['error' => 'Kategoria jest wymagana.'], 400);
            return;
        }

        $cat = new ExpenseCategory($f3->get('DB'));
        if (!$cat->findByIdAndUser($categoryId, (int) $user->id)) {
            $this->json($f3, ['error' => 'Kategoria nie została znaleziona.'], 404);
            return;
        }

        if ($name === '') {
            $this->json($f3, ['error' => 'Nazwa jest wymagana.'], 400);
            return;
        }
        if ($day < 1 || $day > 31) {
            $this->json($f3, ['error' => 'Dzień musi być z zakresu 1-31.'], 400);
            return;
        }
        if (!preg_match('/^\d{4}-\d{2}$/', $month)) {
            $this->json($f3, ['error' => 'Nieprawidłowy miesiąc.'], 400);
            return;
        }
        if ($amount <= 0) {
            $this->json($f3, ['error' => 'Kwota musi być większa od 0.'], 400);
            return;
        }

        $item = new ExpenseItem($f3->get('DB'));
        $item->category_id = $categoryId;
        $item->user_id = (int) $user->id;
        $item->name = $name;
        $item->description = $description;
        $item->day = $day;
        $item->month = $month;
        $item->amount = $amount;
        $item->created_at = date('Y-m-d H:i:s');
        $item->save();

        if ($cat->deleted_month !== null && $cat->deleted_month <= $month) {
            $cat->deleted_month = null;
            $cat->save();
        }

        $this->json($f3, ['item' => $item->toArray()], 201);
    }

    /**
     * PUT /api/expenses/items/@id
     */
    public function updateItem(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $item = new ExpenseItem($f3->get('DB'));
        if (!$item->findByIdAndUser((int) $params['id'], (int) $user->id)) {
            $this->json($f3, ['error' => 'Pozycja nie została znaleziona.'], 404);
            return;
        }

        $body = $this->getBody();

        if (isset($body['name'])) {
            $name = trim($body['name']);
            if ($name === '') {
                $this->json($f3, ['error' => 'Nazwa jest wymagana.'], 400);
                return;
            }
            $item->name = $name;
        }
        if (array_key_exists('description', $body)) {
            $item->description = $body['description'] ?? '';
        }
        if (isset($body['day'])) {
            $day = (int) $body['day'];
            if ($day < 1 || $day > 31) {
                $this->json($f3, ['error' => 'Dzień musi być z zakresu 1-31.'], 400);
                return;
            }
            $item->day = $day;
        }
        if (isset($body['amount'])) {
            $amount = (float) $body['amount'];
            if ($amount <= 0) {
                $this->json($f3, ['error' => 'Kwota musi być większa od 0.'], 400);
                return;
            }
            $item->amount = $amount;
        }

        $item->updated_at = date('Y-m-d H:i:s');
        $item->save();

        $this->json($f3, ['item' => $item->toArray()]);
    }

    /**
     * DELETE /api/expenses/items/@id
     */
    public function deleteItem(\Base $f3, array $params): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $item = new ExpenseItem($f3->get('DB'));
        if (!$item->findByIdAndUser((int) $params['id'], (int) $user->id)) {
            $this->json($f3, ['error' => 'Pozycja nie została znaleziona.'], 404);
            return;
        }

        $item->erase();
        $this->json($f3, ['message' => 'Pozycja została usunięta.']);
    }
}
