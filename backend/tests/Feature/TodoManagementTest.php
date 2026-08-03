<?php

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

test('guests cannot manage todos', function (string $method, string $uri) {
    $todo = Todo::factory()->create();

    $this->json($method, str_replace('{todo}', (string) $todo->id, $uri))
        ->assertUnauthorized();
})->with([
    'list' => ['GET', '/api/todos'],
    'view' => ['GET', '/api/todos/{todo}'],
    'update' => ['PATCH', '/api/todos/{todo}'],
    'delete' => ['DELETE', '/api/todos/{todo}'],
]);

test('users retrieve only their todos in newest first order', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $olderTodo = Todo::factory()->for($user)->create([
        'title' => 'Older todo',
        'created_at' => now()->subMinute(),
    ]);
    $newerTodo = Todo::factory()->for($user)->create([
        'title' => 'Newer todo',
        'created_at' => now(),
    ]);
    Todo::factory()->for($otherUser)->create([
        'title' => 'Private todo',
    ]);

    Sanctum::actingAs($user);

    $this->getJson('/api/todos')
        ->assertSuccessful()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('data.0.id', $newerTodo->id)
        ->assertJsonPath('data.1.id', $olderTodo->id)
        ->assertJsonMissing(['title' => 'Private todo']);
});

test('users can view their own todo but not another users todo', function () {
    $user = User::factory()->create();
    $ownTodo = Todo::factory()->for($user)->create();
    $otherTodo = Todo::factory()->create();

    Sanctum::actingAs($user);

    $this->getJson("/api/todos/{$ownTodo->id}")
        ->assertSuccessful()
        ->assertJsonPath('data.id', $ownTodo->id);

    $this->getJson("/api/todos/{$otherTodo->id}")
        ->assertForbidden();
});

test('users can edit and complete or reopen their own todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    Sanctum::actingAs($user);

    $this->patchJson("/api/todos/{$todo->id}", [
        'title' => 'Updated todo',
        'description' => '**Important** details',
        'is_completed' => true,
    ])
        ->assertSuccessful()
        ->assertJsonPath('data.title', 'Updated todo')
        ->assertJsonPath('data.description', '**Important** details')
        ->assertJsonPath('data.is_completed', true);

    expect($todo->refresh()->is_completed)->toBeTrue();

    $this->patchJson("/api/todos/{$todo->id}", [
        'is_completed' => false,
    ])
        ->assertSuccessful()
        ->assertJsonPath('data.is_completed', false);

    expect($todo->refresh()->is_completed)->toBeFalse();
});

test('todo updates validate input', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    Sanctum::actingAs($user);

    $this->patchJson("/api/todos/{$todo->id}", [
        'title' => '',
        'description' => str_repeat('a', 5001),
        'is_completed' => 'yes',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'title',
            'description',
            'is_completed',
        ]);
});

test('users cannot update another users todo', function () {
    $user = User::factory()->create();
    $otherTodo = Todo::factory()->create([
        'title' => 'Private todo',
    ]);

    Sanctum::actingAs($user);

    $this->patchJson("/api/todos/{$otherTodo->id}", [
        'title' => 'Compromised',
        'is_completed' => true,
    ])->assertForbidden();

    expect($otherTodo->refresh()->title)->toBe('Private todo')
        ->and($otherTodo->is_completed)->toBeFalse();
});

test('users can delete their own todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    Sanctum::actingAs($user);

    $this->deleteJson("/api/todos/{$todo->id}")
        ->assertNoContent();

    $this->assertModelMissing($todo);
});

test('users cannot delete another users todo', function () {
    $user = User::factory()->create();
    $otherTodo = Todo::factory()->create();

    Sanctum::actingAs($user);

    $this->deleteJson("/api/todos/{$otherTodo->id}")
        ->assertForbidden();

    $this->assertModelExists($otherTodo);
});
