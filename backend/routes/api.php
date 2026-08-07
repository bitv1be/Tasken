<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\EmailVerificationController;
use App\Http\Controllers\api\HealthController;
use App\Http\Controllers\api\TodoController;
use Illuminate\Support\Facades\Route;

Route::get('/health', [HealthController::class, 'index']);
Route::get('/ready', [HealthController::class, 'ready']);
Route::get('/version', [HealthController::class, 'version']);

Route::prefix('auth')->group(function (): void {
    Route::post('/signup', [AuthController::class, 'signup'])
        ->middleware('throttle:5,1');

    Route::post('/login', [AuthController::class, 'login'])
        ->middleware('throttle:5,1');

    Route::get(
        '/email/verify/{id}/{hash}',
        [EmailVerificationController::class, 'verify'],
    )->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');

    Route::post(
        '/email/verification-notification',
        [EmailVerificationController::class, 'resend'],
    )->middleware('throttle:6,1')
        ->name('verification.send');

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/user', [AuthController::class, 'user'])
            ->middleware('verified');
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
    });
});

Route::middleware(['auth:sanctum', 'verified', 'throttle:60,1'])->group(function (): void {
    Route::apiResource('todos', TodoController::class);
});
