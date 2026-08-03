<?php

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(LazilyRefreshDatabase::class);

test('guests cannot create todos', function () {
    $this->postJson('/api/todos', [
        'title' => 'Buy groceries',
    ])->assertUnauthorized();
});

test('authenticated users can create their own todos with a bearer token', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $token = $user->createToken('test-device')->plainTextToken;

    $response = $this
        ->withToken($token)
        ->postJson('/api/todos', [
            'title' => 'Buy groceries',
            'description' => "## Shopping list\n\n- Milk\n- Bread\n\n<script>alert('xss')</script>",
            'is_completed' => true,
            'user_id' => $otherUser->id,
        ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.title', 'Buy groceries')
        ->assertJsonPath(
            'data.description',
            "## Shopping list\n\n- Milk\n- Bread\n\n<script>alert('xss')</script>",
        )
        ->assertJsonPath('data.is_completed', false);

    $todo = Todo::query()->sole();

    expect($todo->user->is($user))->toBeTrue()
        ->and($todo->title)->toBe('Buy groceries')
        ->and($todo->description)->toBe(
            "## Shopping list\n\n- Milk\n- Bread\n\n<script>alert('xss')</script>",
        )
        ->and($todo->is_completed)->toBeFalse();
});

test('todo creation validates input', function (array $payload, string $field) {
    Sanctum::actingAs(User::factory()->create());

    $this->postJson('/api/todos', $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);

    expect(Todo::query()->count())->toBe(0);
})->with([
    'missing title' => [
        ['description' => 'No title'],
        'title',
    ],
    'title is too long' => [
        ['title' => str_repeat('a', 256)],
        'title',
    ],
    'description is too long' => [
        [
            'title' => 'Valid title',
            'description' => str_repeat('a', 5001),
        ],
        'description',
    ],
]);

test('deleting a user deletes their todos', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->for($user)->create();

    $user->delete();

    $this->assertModelMissing($todo);
});
