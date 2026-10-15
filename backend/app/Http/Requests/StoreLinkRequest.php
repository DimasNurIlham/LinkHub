<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'     => 'required|string|max:255',
            'url'       => 'required|url',
            'icon'      => 'nullable|string|max:50',
            'is_active' => 'boolean',
        ];
    }
}