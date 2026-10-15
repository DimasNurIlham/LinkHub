<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\LinkController;
use App\Http\Controllers\Api\PublicProfileController;
use Illuminate\Support\Facades\Route;

// Public Auth Routes
Route::get('/auth/google/redirect', [AuthController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [AuthController::class, 'handleGoogleCallback']);

// Public Profile & Click Counter Routes
Route::get('/u/{username}', [PublicProfileController::class, 'show']);
Route::post('/links/{link}/click', [PublicProfileController::class, 'click']);

// Protected Routes (Perlu Token Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Link Management API
    Route::apiResource('links', LinkController::class);
    Route::post('/links/reorder', [LinkController::class, 'reorder']);
});