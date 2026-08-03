<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UserSingUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'password' => [
                'required',
                'string',
                'confirmed',
                'min:8',
                'max:255',
            ],

            'password_confirmation' => [
                'required',
                'string',
            ],
        ];
    }
}
