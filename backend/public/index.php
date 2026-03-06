<?php

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
    )"
]);

try {
    $db->exec("ALTER TABLE notes ADD COLUMN category_id INTEGER REFERENCES categories(id)");
} catch (Exception $e) {
    if (strpos($e->getMessage(), 'duplicate column name') === false) {
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

$f3->run();
