import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      // 1. Simpan Sanctum Token ke localStorage
      localStorage.setItem('token', token);

      // 2. Arahkan pengguna ke halaman Dashboard
      navigate('/dashboard', { replace: true });
    } else {
      // Jika tidak ada token (login gagal / dibatalkan), kembalikan ke halaman login
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="flex items-center space-x-3 bg-white px-6 py-4 rounded-2xl shadow-md border border-slate-100">
        <div className="w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-slate-700 font-medium text-sm">
          Memproses verifikasi akun Google...
        </span>
      </div>
    </div>
  );
};

export default AuthCallback;