<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ResendEmailVerificationRequest;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class EmailVerificationController extends Controller
{
    public function verify(int $id, string $hash): RedirectResponse
    {
        $user = User::query()->findOrFail($id);

        abort_unless(
            hash_equals(
                sha1($user->getEmailForVerification()),
                $hash,
            ),
            Response::HTTP_FORBIDDEN,
        );

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            event(new Verified($user));
        }

        return redirect()->to(
            url()->query('/login', ['verified' => '1']),
        );
    }

    public function resend(
        ResendEmailVerificationRequest $request,
    ): JsonResponse {
        $email = strtolower($request->validated('email'));

        $user = User::query()
            ->where('email', $email)
            ->first();

        if ($user !== null && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();
        }

        return response()->json([
            'message' => 'If an unverified account exists, a verification link has been sent.',
        ], Response::HTTP_ACCEPTED);
    }
}
