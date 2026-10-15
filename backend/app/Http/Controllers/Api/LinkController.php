<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLinkRequest;
use App\Http\Requests\UpdateLinkRequest;
use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LinkController extends Controller
{
    // READ: Tampilkan semua link milik user yang sedang login
    public function index(Request $request)
    {
        $links = $request->user()->links()->orderBy('order', 'asc')->get();

        return response()->json([
            'success' => true,
            'data'    => $links,
        ]);
    }

    // CREATE: Tambah link baru
    public function store(StoreLinkRequest $request)
    {
        $user = $request->user();

        // Hitung urutan terakhir agar link baru berada di posisi paling bawah
        $maxOrder = $user->links()->max('order') ?? 0;

        $link = $user->links()->create([
            'title'     => $request->title,
            'url'       => $request->url,
            'icon'      => $request->icon,
            'is_active' => $request->is_active ?? true,
            'order'     => $maxOrder + 1,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil ditambahkan',
            'data'    => $link,
        ], 201);
    }

    // UPDATE: Perbarui data link
    public function update(UpdateLinkRequest $request, Link $link)
    {
        // Memastikan user hanya bisa mengedit link miliknya sendiri
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $link->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil diperbarui',
            'data'    => $link,
        ]);
    }

    // DELETE: Hapus link
    public function destroy(Request $request, Link $link)
    {
        if ($link->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $link->delete();

        return response()->json([
            'success' => true,
            'message' => 'Link berhasil dihapus',
        ]);
    }

    // REORDER: Mengubah urutan posisi link (drag and drop)
    public function reorder(Request $request)
    {
        $request->validate([
            'links'         => 'required|array',
            'links.*.id'    => 'required|exists:links,id',
            'links.*.order' => 'required|integer',
        ]);

        $userId = $request->user()->id;

        DB::transaction(function () use ($request, $userId) {
            foreach ($request->links as $item) {
                Link::where('id', $item['id'])
                    ->where('user_id', $userId)
                    ->update(['order' => $item['order']]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Urutan link berhasil diperbarui',
        ]);
    }
}