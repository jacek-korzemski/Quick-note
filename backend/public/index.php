<?php

// CORS: send headers for every request so preflight and actual requests are allowed
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Max-Age: 3600');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$f3 = require('../base.php');
$f3->config('../app/config.ini');

$db = new \DB\SQL('sqlite:' . realpath('../data') . '/notes.db');
$f3->set('DB', $db);

$db->exec([
    "CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        token TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    )",
    "CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        label TEXT DEFAULT 'none',
        created_at TEXT NOT NULL,
        updated_at TEXT,
        user_id INTEGER NOT NULL,
        category_id INTEGER REFERENCES categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE IF NOT EXISTS board_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        parent_id INTEGER,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (parent_id) REFERENCES board_categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE IF NOT EXISTS boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        board_category_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (board_category_id) REFERENCES board_categories(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        board_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        difficulty INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'todo',
        FOREIGN KEY (board_id) REFERENCES boards(id)
    )",
    "CREATE TABLE IF NOT EXISTS task_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        changed_at TEXT NOT NULL,
        description TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id)
    )",
    "CREATE TABLE IF NOT EXISTS time_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        comment TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )",
    "CREATE TABLE IF NOT EXISTS time_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_id INTEGER NOT NULL,
        start_datetime TEXT NOT NULL,
        end_datetime TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (task_id) REFERENCES time_tasks(id)
    )"
]);

try {
    $db->exec("ALTER TABLE notes ADD COLUMN category_id INTEGER REFERENCES categories(id)");
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate column name') === false) {
        throw $e;
    }
}
try {
    $db->exec("ALTER TABLE time_tasks ADD COLUMN comment TEXT");
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate column name') === false) {
        throw $e;
    }
}
try {
    $db->exec("ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0");
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate column name') === false) {
        throw $e;
    }
}
try {
    $db->exec("ALTER TABLE boards ADD COLUMN archived_at TEXT");
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate column name') === false) {
        throw $e;
    }
}

// Migracja: board_category_id nullable (archiwum jest płaskie, bez kategorii)
try {
    $info = $db->exec('PRAGMA table_info(boards)');
    $boardCategoryNotNull = true;
    foreach ($info as $col) {
        if ($col['name'] === 'board_category_id' && (int) $col['notnull'] === 0) {
            $boardCategoryNotNull = false;
            break;
        }
    }
    if ($boardCategoryNotNull) {
        $db->exec('CREATE TABLE boards_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            board_category_id INTEGER REFERENCES board_categories(id),
            user_id INTEGER NOT NULL,
            archived_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )');
        $db->exec('INSERT INTO boards_new (id, name, board_category_id, user_id, archived_at)
            SELECT id, name, CASE WHEN archived_at IS NOT NULL THEN NULL ELSE board_category_id END, user_id, archived_at FROM boards');
        $db->exec('DROP TABLE boards');
        $db->exec('ALTER TABLE boards_new RENAME TO boards');
    }
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'already exists') === false && strpos($e->getMessage(), 'duplicate') === false) {
        throw $e;
    }
}

$f3->set('CORS.origin', '*');

$f3->route('OPTIONS /*', function($f3) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 3600');
    $f3->status(200);
});

$f3->route('POST /api/auth/register', 'AuthController->register');
$f3->route('POST /api/auth/login', 'AuthController->login');
$f3->route('POST /api/auth/logout', 'AuthController->logout');
$f3->route('GET  /api/auth/me', 'AuthController->me');

$f3->route('GET    /api/notes', 'NoteController->index');
$f3->route('POST   /api/notes', 'NoteController->create');
$f3->route('PUT    /api/notes/@id', 'NoteController->update');
$f3->route('DELETE /api/notes/@id', 'NoteController->delete');

$f3->route('GET    /api/categories', 'CategoryController->index');
$f3->route('POST   /api/categories', 'CategoryController->create');
$f3->route('PUT    /api/categories/@id', 'CategoryController->update');
$f3->route('DELETE /api/categories/@id', 'CategoryController->delete');

$f3->route('GET    /api/board-categories', 'BoardCategoryController->index');
$f3->route('POST   /api/board-categories', 'BoardCategoryController->create');
$f3->route('PUT    /api/board-categories/@id', 'BoardCategoryController->update');
$f3->route('DELETE /api/board-categories/@id', 'BoardCategoryController->delete');

$f3->route('GET    /api/boards', 'BoardController->index');
$f3->route('GET    /api/boards/@id', 'BoardController->getOne');
$f3->route('POST   /api/boards', 'BoardController->create');
$f3->route('PUT    /api/boards/@id', 'BoardController->update');
$f3->route('DELETE /api/boards/@id', 'BoardController->delete');
$f3->route('POST   /api/boards/@id/archive', 'BoardController->archive');
$f3->route('POST   /api/boards/@id/copy', 'BoardController->copy');

$f3->route('GET    /api/boards/@boardId/tasks', 'TaskController->index');
$f3->route('POST   /api/boards/@boardId/tasks', 'TaskController->create');
$f3->route('PUT    /api/boards/@boardId/tasks/reorder', 'TaskController->reorder');
$f3->route('PUT    /api/boards/@boardId/tasks/@id', 'TaskController->update');
$f3->route('DELETE /api/boards/@boardId/tasks/@id', 'TaskController->delete');

$f3->route('GET    /api/time/week', 'TimeTrackerController->week');
$f3->route('POST   /api/time/tasks', 'TimeTrackerController->createTask');
$f3->route('PATCH  /api/time/tasks/@id', 'TimeTrackerController->updateTask');
$f3->route('DELETE /api/time/tasks/@id', 'TimeTrackerController->deleteTask');

$f3->run();
