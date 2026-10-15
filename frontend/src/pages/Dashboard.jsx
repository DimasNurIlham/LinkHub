import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/Api';
import { 
  Plus, Trash2, Edit2, LogOut, 
  BarChart2, Globe, Check, Eye, EyeOff, Copy 
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  // State Management
  const [user, setUser] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Form State (Tambah / Edit Link)
  const [formData, setFormData] = useState({ title: '', url: '' });
  const [editingId, setEditingId] = useState(null);

  // Effect untuk mengambil data User & Links secara paralel dan aman
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [userRes, linksRes] = await Promise.all([
          api.get('/me'),
          api.get('/links')
        ]);

        if (isMounted) {
          setUser(userRes.data);
          setLinks(linksRes.data.data || []);
        }
      } catch (err) {
        console.error('Gagal memuat data dashboard', err);
        if (isMounted) {
          localStorage.removeItem('token');
          navigate('/', { replace: true });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  // Handle Form Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.url) return;

    try {
      if (editingId) {
        // Mode Update
        const res = await api.put(`/links/${editingId}`, formData);
        setLinks(links.map((item) => (item.id === editingId ? res.data.data : item)));
        setEditingId(null);
      } else {
        // Mode Create
        const res = await api.post('/links', formData);
        setLinks([...links, res.data.data]);
      }
      setFormData({ title: '', url: '' });
    } catch (err) {
      console.error('Gagal menyimpan link', err);
    }
  };

  // Toggle Is Active
  const handleToggleActive = async (link) => {
    try {
      const updatedStatus = !link.is_active;
      await api.put(`/links/${link.id}`, { is_active: updatedStatus });
      setLinks(
        links.map((item) => (item.id === link.id ? { ...item, is_active: updatedStatus } : item))
      );
    } catch (err) {
      console.error('Gagal mengedit status link', err);
    }
  };

  // Handle Edit Click
  const handleEdit = (link) => {
    setEditingId(link.id);
    setFormData({ title: link.title, url: link.url });
  };

  // Handle Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ title: '', url: '' });
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus link ini?')) return;

    try {
      await api.delete(`/links/${id}`);
      setLinks(links.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Gagal menghapus link', err);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Error logout', err);
    } finally {
      localStorage.removeItem('token');
      navigate('/', { replace: true });
    }
  };

  // Copy Public Profile URL
  const publicUrl = user ? `${window.location.origin}/u/${user.username}` : '';
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header / Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-lg">
              LH
            </div>
            <span className="font-extrabold text-slate-800 text-lg tracking-tight hidden sm:inline">
              LinkHub
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {user && (
              <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                <img
                  src={user.avatar || 'https://via.placeholder.com/40'}
                  alt={user.name}
                  className="w-6 h-6 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-slate-700">{user.name}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl w-full mx-auto p-4 md:p-6 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Kolom Kiri: Form & Daftar Link */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Box Profil & URL Publik */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Profil Saya</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  URL Profil: <span className="font-mono text-indigo-600">{publicUrl}</span>
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tercopy!' : 'Copy Link'}</span>
                </button>
                <a
                  href={`/u/${user?.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-xl transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span>Buka Profil</span>
                </a>
              </div>
            </div>
          </div>

          {/* Form Tambah / Edit Link */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/80">
            <h3 className="text-base font-bold text-slate-800 mb-4">
              {editingId ? 'Edit Tautan' : 'Tambah Tautan Baru'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Judul Link
                </label>
                <input
                  type="text"
                  placeholder="Misal: Instagram Saya, Portofolio"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  URL Tujuan
                </label>
                <input
                  type="url"
                  placeholder="https://instagram.com/username"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  required
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingId ? 'Update Link' : 'Tambah Link'}</span>
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 px-4 rounded-xl text-sm transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Daftar Tautan */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-800">Daftar Link ({links.length})</h3>
            {links.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
                <p className="text-slate-400 text-sm">Belum ada link. Tambahkan link pertamamu di atas!</p>
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex items-center justify-between gap-4 ${
                    link.is_active ? 'border-slate-200/80' : 'border-slate-200 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-slate-800 text-sm truncate">{link.title}</h4>
                      <span className="flex items-center text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
                        <BarChart2 className="w-3 h-3 mr-1 text-slate-400" />
                        {link.clicks || 0} klik
                      </span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-500 hover:underline truncate block mt-0.5"
                    >
                      {link.url}
                    </a>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 sm:space-x-2 shrink-0">
                    <button
                      onClick={() => handleToggleActive(link)}
                      className={`p-2 rounded-lg transition-colors ${
                        link.is_active
                          ? 'text-emerald-600 hover:bg-emerald-50'
                          : 'text-slate-400 hover:bg-slate-100'
                      }`}
                      title={link.is_active ? 'Aktif (Sembunyikan)' : 'Non-aktif (Tampilkan)'}
                    >
                      {link.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleEdit(link)}
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(link.id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Kolom Kanan: Mobile Live Preview */}
        <div className="lg:col-span-5 xl:col-span-4 hidden lg:block">
          <div className="sticky top-20 bg-white rounded-3xl p-4 shadow-sm border border-slate-200/80 flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-3 tracking-wider uppercase">
              Live Preview
            </span>

            {/* Mockup Frame */}
            <div className="w-[280px] h-[540px] bg-slate-900 rounded-[40px] p-3 shadow-2xl ring-1 ring-slate-800 relative overflow-hidden flex flex-col">
              <div className="w-28 h-4 bg-slate-900 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-xl z-20"></div>

              <div className="w-full h-full bg-slate-50 rounded-[30px] pt-8 px-4 pb-4 overflow-y-auto flex flex-col items-center">
                <img
                  src={user?.avatar || 'https://via.placeholder.com/80'}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-white mb-2"
                />
                <h3 className="font-bold text-slate-800 text-sm">{user?.name}</h3>
                <p className="text-[11px] text-slate-500 mb-4 font-mono">@{user?.username}</p>

                <div className="w-full space-y-2.5 flex-1">
                  {links
                    .filter((l) => l.is_active)
                    .map((link) => (
                      <div
                        key={link.id}
                        className="w-full bg-white border border-slate-200/80 hover:border-indigo-500 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-medium text-center shadow-sm truncate transition-all cursor-pointer"
                      >
                        {link.title}
                      </div>
                    ))}
                </div>

                <div className="mt-4 text-[9px] text-slate-400 font-semibold tracking-widest uppercase">
                  Powered by LinkHub
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;