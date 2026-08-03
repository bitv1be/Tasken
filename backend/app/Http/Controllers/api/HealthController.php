<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class HealthController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
        ])->header('Cache-Control', 'no-store');
    }

    public function ready(): JsonResponse
    {
        try {
            DB::connection()->getPdo();

            return response()->json([
                'status' => 'ready',
                'database' => DB::connection()->getDatabaseName(),
            ])->header('Cache-Control', 'no-store');
        } catch (Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
            ])->header('Cache-Control', 'no-store');
        }
    }

    public function version(): JsonResponse
    {
        $commit = config('build.commit');

        return response()->json([
            'application' => config('app.name'),
            'version' => config('build.version'),
            'commit' => $commit === 'unknown'
                ? 'unknown'
                : substr($commit, 0, 7),
            'environment' => app()->environment(),
            'built_at' => config('build.built_at'),
        ])->header('Cache-Control', 'no-store');
    }
}
