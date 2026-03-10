<?php

class TimeTrackerController {

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

    /**
     * GET /api/time/week?from=YYYY-MM-DD
     */
    public function week(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $fromStr = $f3->get('GET.from');
        try {
            if ($fromStr) {
                $weekStart = new DateTime($fromStr . ' 00:00:00');
            } else {
                $weekStart = new DateTime('monday this week');
                $weekStart->setTime(0, 0, 0);
            }
        } catch (Exception $e) {
            $this->json($f3, ['error' => 'Nieprawidłowa data parametru from.'], 400);
            return;
        }

        // Zakres pn–pt (5 dni)
        $weekEnd = clone $weekStart;
        $weekEnd->modify('+5 days');

        /** @var \DB\SQL $db */
        $db = $f3->get('DB');
        $rows = $db->exec(
            "SELECT
                e.id,
                e.user_id,
                e.task_id,
                e.start_datetime,
                e.end_datetime,
                e.created_at,
                t.title,
                t.description,
                t.duration_minutes,
                t.comment
            FROM time_entries e
            JOIN time_tasks t ON t.id = e.task_id
            WHERE e.user_id = ?
              AND e.start_datetime >= ?
              AND e.start_datetime < ?
            ORDER BY e.start_datetime ASC",
            [
                (int) $user->id,
                $weekStart->format('Y-m-d H:i:s'),
                $weekEnd->format('Y-m-d H:i:s'),
            ]
        );

        $this->json($f3, ['entries' => $rows]);
    }

    /**
     * POST /api/time/tasks
     * Body: { title, description?, start_datetime, duration_minutes }
     */
    public function createTask(\Base $f3): void {
        $user = $this->getCurrentUser($f3);
        if (!$user) {
            $this->json($f3, ['error' => 'Brak autoryzacji.'], 401);
            return;
        }

        $data = $this->getBody();
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $comment = trim($data['comment'] ?? '');
        $durationMinutes = isset($data['duration_minutes']) ? (int) $data['duration_minutes'] : 0;
        $startStr = $data['start_datetime'] ?? null;

        if ($title === '' || !$startStr || $durationMinutes <= 0) {
            $this->json($f3, ['error' => 'Wymagane pola: title, start_datetime, duration_minutes > 0.'], 400);
            return;
        }

        if ($durationMinutes % 30 !== 0) {
            $this->json($f3, ['error' => 'Czas trwania musi być wielokrotnością 30 minut.'], 400);
            return;
        }

        try {
            $start = new DateTime($startStr);
        } catch (Exception $e) {
            $this->json($f3, ['error' => 'Nieprawidłowa wartość start_datetime.'], 400);
            return;
        }

        // Zaokrąglenie startu do najbliższego slotu 30-minutowego w górę
        $minute = (int) $start->format('i');
        if ($minute % 30 !== 0) {
            $delta = 30 - ($minute % 30);
            $start->modify('+' . $delta . ' minutes');
        }

        /** @var \DB\SQL $db */
        $db = $f3->get('DB');
        $db->begin();

        try {
            $task = new TimeTask($db);
            $task->reset();
            $task->user_id = (int) $user->id;
            $task->title = $title;
            $task->description = $description;
            $task->comment = $comment;
            $task->duration_minutes = $durationMinutes;
            $task->created_at = date('Y-m-d H:i:s');
            $task->updated_at = $task->created_at;
            $task->save();

            $remaining = $durationMinutes;
            $currentStart = clone $start;

            while ($remaining > 0) {
                // Pomiń weekendy – przejdź do najbliższego poniedziałku
                $dow = (int) $currentStart->format('N'); // 1=pn ... 7=nd
                if ($dow > 5) {
                    $currentStart->modify('next monday');
                    $currentStart->setTime(9, 0, 0);
                }

                $dayStart = (clone $currentStart)->setTime(9, 0, 0);
                $dayEnd = (clone $currentStart)->setTime(17, 0, 0);

                // Jeżeli przed 9:00 – ustaw na 9:00
                if ($currentStart < $dayStart) {
                    $currentStart = clone $dayStart;
                }

                // Jeżeli po 17:00 – przejdź do kolejnego dnia roboczego 9:00
                if ($currentStart >= $dayEnd) {
                    $currentStart->modify('+1 day');
                    $currentStart->setTime(9, 0, 0);
                    continue;
                }

                // Wylicz ile 30-min slotów mamy jeszcze dziś
                $maxMinutesToday = (int) floor(($dayEnd->getTimestamp() - $currentStart->getTimestamp()) / 60);
                $maxSlotsToday = intdiv($maxMinutesToday, 30);
                if ($maxSlotsToday <= 0) {
                    $currentStart->modify('+1 day');
                    $currentStart->setTime(9, 0, 0);
                    continue;
                }

                $remainingSlots = intdiv($remaining, 30);
                $slots = min($remainingSlots, $maxSlotsToday);
                if ($slots <= 0) {
                    break;
                }

                $chunkMinutes = $slots * 30;
                $slotEnd = (clone $currentStart)->modify('+' . $chunkMinutes . ' minutes');

                $entry = new TimeEntry($db);
                $entry->reset();
                $entry->user_id = (int) $user->id;
                $entry->task_id = (int) $task->id;
                $entry->start_datetime = $currentStart->format('Y-m-d H:i:s');
                $entry->end_datetime = $slotEnd->format('Y-m-d H:i:s');
                $entry->created_at = date('Y-m-d H:i:s');
                $entry->save();

                $remaining -= $chunkMinutes;
                $currentStart = clone $slotEnd;
            }

            $db->commit();

            // Zwracamy task + jego wpisy
            $entries = $db->exec(
                'SELECT * FROM time_entries WHERE task_id = ? ORDER BY start_datetime ASC',
                [(int) $task->id]
            );

            $this->json($f3, [
                'task'    => $task->toArray(),
                'entries' => $entries,
            ], 201);
        } catch (Exception $e) {
            $db->rollback();
            $this->json($f3, ['error' => 'Nie udało się utworzyć zadania czasu pracy.'], 500);
        }
    }

    /**
     * DELETE /api/time/tasks/@id
     */
    public function deleteTask(\Base $f3, array $params): void {
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

        /** @var \DB\SQL $db */
        $db = $f3->get('DB');
        $task = new TimeTask($db);
        if (!$task->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Zadanie nie zostało znalezione.'], 404);
            return;
        }

        $db->begin();
        try {
            $db->exec('DELETE FROM time_entries WHERE task_id = ?', [$id]);
            $task->erase();
            $db->commit();
            $this->json($f3, ['message' => 'Zadanie zostało usunięte.']);
        } catch (Exception $e) {
            $db->rollback();
            $this->json($f3, ['error' => 'Nie udało się usunąć zadania czasu pracy.'], 500);
        }
    }

    /**
     * PATCH /api/time/tasks/@id
     * Body: { title?, description?, comment?, duration_minutes? }
     */
    public function updateTask(\Base $f3, array $params): void {
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

        /** @var \DB\SQL $db */
        $db = $f3->get('DB');
        $task = new TimeTask($db);
        if (!$task->findByIdAndUser($id, (int) $user->id)) {
            $this->json($f3, ['error' => 'Zadanie nie zostało znalezione.'], 404);
            return;
        }

        $data = $this->getBody();
        $newTitle = array_key_exists('title', $data) ? trim((string) $data['title']) : null;
        $newDescription = array_key_exists('description', $data) ? trim((string) $data['description']) : null;
        $newComment = array_key_exists('comment', $data) ? trim((string) $data['comment']) : null;
        $newDuration = array_key_exists('duration_minutes', $data) ? (int) $data['duration_minutes'] : null;
        $newStartStr = array_key_exists('start_datetime', $data) ? (string) $data['start_datetime'] : null;

        if ($newDuration !== null) {
            if ($newDuration <= 0 || $newDuration % 30 !== 0) {
                $this->json($f3, ['error' => 'Czas trwania musi być dodatni i wielokrotnością 30 minut.'], 400);
                return;
            }
        }

        if ($newTitle !== null && $newTitle === '') {
            $this->json($f3, ['error' => 'Tytuł nie może być pusty.'], 400);
            return;
        }

        $start = null;
        if ($newStartStr !== null) {
            try {
                $start = new DateTime($newStartStr);
            } catch (Exception $e) {
                $this->json($f3, ['error' => 'Nieprawidłowa wartość start_datetime.'], 400);
                return;
            }
        }

        $db->begin();
        try {
            if ($newTitle !== null) {
                $task->title = $newTitle;
            }
            if ($newDescription !== null) {
                $task->description = $newDescription;
            }
            if ($newComment !== null) {
                $task->comment = $newComment;
            }
            if ($newDuration !== null) {
                $task->duration_minutes = $newDuration;
            }
            $task->updated_at = date('Y-m-d H:i:s');
            $task->save();

            // Jeżeli zmieniono czas trwania lub start, przelicz wpisy czasu
            if ($newDuration !== null || $start !== null) {
                $rows = $db->exec(
                    'SELECT MIN(start_datetime) AS start_dt FROM time_entries WHERE task_id = ?',
                    [$id]
                );
                $startStr = $rows[0]['start_dt'] ?? null;

                if ($start === null) {
                    if ($startStr === null) {
                        $start = new DateTime();
                    } else {
                        $start = new DateTime($startStr);
                    }
                }

                $db->exec('DELETE FROM time_entries WHERE task_id = ?', [$id]);

                $durationToUse = $newDuration !== null ? $newDuration : (int) $task->duration_minutes;
                $remaining = $durationToUse;
                $currentStart = clone $start;

                while ($remaining > 0) {
                    $dow = (int) $currentStart->format('N');
                    if ($dow > 5) {
                        $currentStart->modify('next monday');
                        $currentStart->setTime(9, 0, 0);
                    }

                    $dayStart = (clone $currentStart)->setTime(9, 0, 0);
                    $dayEnd = (clone $currentStart)->setTime(17, 0, 0);

                    if ($currentStart < $dayStart) {
                        $currentStart = clone $dayStart;
                    }

                    if ($currentStart >= $dayEnd) {
                        $currentStart->modify('+1 day');
                        $currentStart->setTime(9, 0, 0);
                        continue;
                    }

                    $maxMinutesToday = (int) floor(($dayEnd->getTimestamp() - $currentStart->getTimestamp()) / 60);
                    $maxSlotsToday = intdiv($maxMinutesToday, 30);
                    if ($maxSlotsToday <= 0) {
                        $currentStart->modify('+1 day');
                        $currentStart->setTime(9, 0, 0);
                        continue;
                    }

                    $remainingSlots = intdiv($remaining, 30);
                    $slots = min($remainingSlots, $maxSlotsToday);
                    if ($slots <= 0) {
                        break;
                    }

                    $chunkMinutes = $slots * 30;
                    $slotEnd = (clone $currentStart)->modify('+' . $chunkMinutes . ' minutes');

                    $entry = new TimeEntry($db);
                    $entry->reset();
                    $entry->user_id = (int) $user->id;
                    $entry->task_id = (int) $task->id;
                    $entry->start_datetime = $currentStart->format('Y-m-d H:i:s');
                    $entry->end_datetime = $slotEnd->format('Y-m-d H:i:s');
                    $entry->created_at = date('Y-m-d H:i:s');
                    $entry->save();

                    $remaining -= $chunkMinutes;
                    $currentStart = clone $slotEnd;
                }
            }

            $db->commit();

            $entries = $db->exec(
                'SELECT * FROM time_entries WHERE task_id = ? ORDER BY start_datetime ASC',
                [$id]
            );

            $this->json($f3, [
                'task'    => $task->toArray(),
                'entries' => $entries,
            ]);
        } catch (Exception $e) {
            $db->rollback();
            $this->json($f3, ['error' => 'Nie udało się zaktualizować zadania czasu pracy.'], 500);
        }
    }
}

