<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'     => 'sometimes|required|string|max:255',
            'url'       => 'sometimes|required|url',
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'sometimes|boolean',
        ];
    }
}