<?php

use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;

uses(LazilyRefreshDatabase::class);

test('signup creates an unverified user and sends a verification email', function () {
    Notification::fake();

    $response = $this->postJson('/api/auth/signup', [
        'email' => 'NewUser@Example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
        'device_name' => 'test-device',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('user.email', 'newuser@example.com')
        ->assertJsonPath('user.email_verified_at', null);

    expect($response->json())->not->toHaveKey('token');

    $user = User::query()
        ->where('email', 'newuser@example.com')
        ->sole();

    expect($user->email_verified_at)->toBeNull()
        ->and($user->tokens()->count())->toBe(0);

    Notification::assertSentTo(
        $user,
        VerifyEmail::class,
        function (VerifyEmail $notification) use ($user): bool {
            $verificationUrl = $notification
                ->toMail($user)
                ->actionUrl;

            $verificationRequest = Request::create($verificationUrl);

            return str_starts_with(
                $verificationRequest->path(),
                "api/auth/email/verify/{$user->id}/",
            ) && URL::hasValidSignature($verificationRequest);
        },
    );
});

test('unverified users cannot sign in or use protected endpoints', function () {
    $user = User::factory()->unverified()->create();

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'test-device',
    ])
        ->assertForbidden()
        ->assertJsonPath(
            'message',
            'Verify your email address before signing in.',
        );

    expect($user->tokens()->count())->toBe(0);

    $token = $user->createToken('old-device')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/user')
        ->assertForbidden();

    $this->withToken($token)
        ->getJson('/api/todos')
        ->assertForbidden();
});

test('a valid signed link verifies the user and redirects to login', function () {
    Event::fake([Verified::class]);

    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addHour(),
        [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ],
    );

    $this->get($verificationUrl)
        ->assertRedirect(
            url()->query('/login', ['verified' => '1']),
        );

    expect($user->refresh()->hasVerifiedEmail())->toBeTrue();

    Event::assertDispatchedTimes(Verified::class, 1);

    $this->get($verificationUrl)
        ->assertRedirect(
            url()->query('/login', ['verified' => '1']),
        );

    Event::assertDispatchedTimes(Verified::class, 1);
});

test('verification rejects an invalid email hash', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->addHour(),
        [
            'id' => $user->id,
            'hash' => 'invalid-hash',
        ],
    );

    $this->getJson($verificationUrl)->assertForbidden();

    expect($user->refresh()->hasVerifiedEmail())->toBeFalse();
});

test('verification rejects an expired signed link', function () {
    $user = User::factory()->unverified()->create();

    $verificationUrl = URL::temporarySignedRoute(
        'verification.verify',
        now()->subMinute(),
        [
            'id' => $user->id,
            'hash' => sha1($user->getEmailForVerification()),
        ],
    );

    $this->getJson($verificationUrl)->assertForbidden();

    expect($user->refresh()->hasVerifiedEmail())->toBeFalse();
});

test('verification resend uses the same response for every account state', function () {
    Notification::fake();

    $unverifiedUser = User::factory()->unverified()->create();
    $verifiedUser = User::factory()->create();

    $expectedMessage = 'If an unverified account exists, a verification link has been sent.';

    $this->postJson('/api/auth/email/verification-notification', [
        'email' => $unverifiedUser->email,
    ])
        ->assertAccepted()
        ->assertJsonPath('message', $expectedMessage);

    $this->postJson('/api/auth/email/verification-notification', [
        'email' => $verifiedUser->email,
    ])
        ->assertAccepted()
        ->assertJsonPath('message', $expectedMessage);

    $this->postJson('/api/auth/email/verification-notification', [
        'email' => 'missing@example.com',
    ])
        ->assertAccepted()
        ->assertJsonPath('message', $expectedMessage);

    Notification::assertSentToTimes(
        $unverifiedUser,
        VerifyEmail::class,
        1,
    );
    Notification::assertNotSentTo($verifiedUser, VerifyEmail::class);
});

test('verification email resend validates the email address', function () {
    $this->postJson('/api/auth/email/verification-notification', [
        'email' => 'not-an-email',
    ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

test('verified users can sign in after confirming their email', function () {
    $user = User::factory()->create();

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
        'device_name' => 'test-device',
    ])
        ->assertSuccessful()
        ->assertJsonPath('token_type', 'Bearer')
        ->assertJsonPath('user.email_verified_at', fn ($value) => $value !== null);

    expect($user->tokens()->count())->toBe(1);
});
