<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Link extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'url',
        'icon',
        'is_active',
        'clicks',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Relasi: Link dimiliki oleh 1 User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}