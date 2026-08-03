<?php

test('the application returns a successful response', function () {
    $response = $this->get('/');

    $response
        ->assertSuccessful()
        ->assertSee('Tasken Backend');

    expect(config('app.name'))->toBe('Tasken');
});
