<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    // Redirect user ke halaman Google Login
    public function redirectToGoogle()
    {
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');

        return $driver->stateless()->redirect();
    }

    // Handle callback dari Google setelah user menyetujui login
    public function handleGoogleCallback()
    {
        try {
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');

            $googleUser = $driver->stateless()->user();

            // Cari user berdasarkan google_id atau email
            $user = User::where('google_id', $googleUser->getId())
                ->orWhere('email', $googleUser->getEmail())
                ->first();

            if (!$user) {
                // Generate username unik dari bagian depan email
                $baseUsername = Str::slug(explode('@', $googleUser->getEmail())[0]);
                $username = $baseUsername;
                $count = 1;

                while (User::where('username', $username)->exists()) {
                    $username = $baseUsername . $count;
                    $count++;
                }

                // Buat user baru
                $user = User::create([
                    'google_id' => $googleUser->getId(),
                    'name'      => $googleUser->getName(),
                    'email'     => $googleUser->getEmail(),
                    'username'  => $username,
                    'avatar'    => $googleUser->getAvatar(),
                ]);
            } else {
                // Update data jika user sudah ada
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar'    => $googleUser->getAvatar(),
                ]);
            }

            // Buat Sanctum API Token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Redirect ke React Frontend membawa token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->to("{$frontendUrl}/auth/callback?token={$token}");

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal login via Google',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    // Endpoint untuk mengambil profil user yang sedang login
    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Berhasil logout'
        ]);
    }
}