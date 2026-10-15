import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/Api';
import { ExternalLink, AlertCircle } from 'lucide-react';

const PublicProfile = () => {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPublicProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data profil dan link publik
        const res = await api.get(`/u/${username}`);

        if (isMounted) {
          setProfile(res.data.user);
          setLinks(res.data.links || []);
        }
      } catch (err) {
        console.error('Gagal mengambil profil publik:', err);
        if (isMounted) {
          setError('Pengguna tidak ditemukan atau profil tidak tersedia.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (username) {
      fetchPublicProfile();
    }

    return () => {
      isMounted = false;
    };
  }, [username]);

  // Handler saat pengunjung mengklik salah satu link
  const handleLinkClick = async (link) => {
    try {
      // Kirim request hitung klik sampai selesai dulu
      await api.post(`/links/${link.id}/click`);
    } catch (err) {
      console.error('Gagal mencatat statistik klik:', err);
    } finally {
      // Buka URL di tab baru
      window.open(link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // State 1: Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-500 font-medium text-sm">Memuat profil...</span>
        </div>
      </div>
    );
  }

  // State 2: Error / User Not Found (404)
  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-sm text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Profil Tidak Ditemukan</h2>
          <p className="text-slate-500 text-sm mt-2">{error}</p>
          <a
            href="/"
            className="inline-block mt-6 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all"
          >
            Kembali ke Beranda
          </a>
        </div>
      </div>
    );
  }

  // State 3: Tampilan Profil Publik
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Foto Profil */}
        <div className="relative mb-4">
          <img
            src={profile.avatar || 'https://via.placeholder.com/120'}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
          />
        </div>

        {/* Info Nama & Username */}
        <h1 className="text-2xl font-extrabold text-slate-800 text-center tracking-tight">
          {profile.name}
        </h1>
        <p className="text-xs font-mono text-indigo-600 mt-1 mb-3">
          @{profile.username}
        </p>

        {/* Bio (jika ada) */}
        {profile.bio && (
          <p className="text-sm text-slate-600 text-center max-w-xs mb-6 leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Daftar Tautan Aktif */}
        <div className="w-full space-y-3 mt-2">
          {links.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-200/60">
              <p className="text-slate-400 text-sm">Pengguna belum menambahkan tautan.</p>
            </div>
          ) : (
            links.map((link) => (
              <button
                key={link.id}
                onClick={() => handleLinkClick(link)}
                className="w-full bg-white hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold py-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between group active:scale-[0.99]"
              >
                <span className="text-sm text-center flex-1">{link.title}</span>
                <ExternalLink className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity ml-2 shrink-0" />
              </button>
            ))
          )}
        </div>

        {/* Branding Footer */}
        <footer className="mt-12 text-center">
          <a
            href="/"
            className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-600 font-medium transition-colors"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-slate-700">LinkHub</span>
          </a>
        </footer>

      </div>
    </div>
  );
};

export default PublicProfile;