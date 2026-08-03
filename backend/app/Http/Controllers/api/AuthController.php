<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserLoginRequest;
use App\Http\Requests\UserSingUpRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function signup(UserSingUpRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'email' => strtolower($data['email']),
            'password' => Hash::make($data['password']),
        ]);

        $token = $user
            ->createToken($data['device_name'] ?? 'default-device')
            ->plainTextToken;

        return response()->json([
            'message' => 'User successfully registered.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->userData($user),
        ], Response::HTTP_CREATED);
    }

    public function login(UserLoginRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::where(
            'email',
            strtolower($data['email'])
        )->first();

        if (
            $user === null ||
            ! Hash::check($data['password'], $user->password)
        ) {
            return response()->json([
                'message' => 'Invalid email or password.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $token = $user
            ->createToken($data['device_name'] ?? 'default-device')
            ->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $this->userData($user),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $this->userData($request->user()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()
            ->currentAccessToken()
            ?->delete();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()
            ->tokens()
            ->delete();

        return response()->json([
            'message' => 'Logged out from all devices.',
        ]);
    }

    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'email' => $user->email,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
        ];
    }
}
