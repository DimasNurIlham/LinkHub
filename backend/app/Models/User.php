<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'google_id',
        'name',
        'email',
        'username',
        'bio',
        'avatar',
    ];

    // Relasi: 1 User memiliki banyak Links
    public function links()
    {
        return $table = $this->hasMany(Link::class)->orderBy('order', 'asc');
    }
}