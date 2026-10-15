<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Link;
use App\Models\User;

class PublicProfileController extends Controller
{
    // Menampilkan profil publik & daftar link yang aktif saja
    public function show($username)
    {
        $user = User::where('username', $username)->firstOrFail();

        $links = $user->links()
            ->where('is_active', true)
            ->orderBy('order', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'user'    => [
                'name'     => $user->name,
                'username' => $user->username,
                'bio'      => $user->bio,
                'avatar'   => $user->avatar,
            ],
            'links'   => $links,
        ]);
    }

    // Menambah counter klik saat tautan dibuka oleh pengunjung
    public function click(Link $link)
    {
        $link->increment('clicks');

        return response()->json([
            'success' => true,
            'url'     => $link->url,
        ]);
    }
}