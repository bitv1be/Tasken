<?php

namespace App\Models;

use App\Policies\TodoPolicy;
use Database\Factories\TodoFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\UsePolicy;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['title', 'description', 'is_completed'])]
#[UsePolicy(TodoPolicy::class)]
class Todo extends Model
{
    /** @use HasFactory<TodoFactory> */
    use HasFactory;

    protected $attributes = [
        'is_completed' => false,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'is_completed' => 'boolean',
        ];
    }
}
