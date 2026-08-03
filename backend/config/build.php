<?php

return [
    'commit' => env('APP_COMMIT', 'unknown'),
    'version' => env('APP_VERSION', 'dev'),
    'built_at' => env('APP_BUILD_TIME', now()->toIso8601String()),
];
