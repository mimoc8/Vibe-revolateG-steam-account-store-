"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Plus, X, Loader2, Image as ImageIcon, Gamepad2, Database, Edit2, Trash2, Save } from "lucide-react";
import { createClient } from '@/lib/supabase/client';

type SysReqInfo = {
  os: string;
  cpu: string;
  ram: string;
  gpu: string;
  storage: string;
};

const PREDEFINED_TAGS = [
  'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Sports', 'Racing',
  'FPS', 'TPS', 'Open World', 'Survival', 'Sandbox', 'Puzzle', 'Platformer',
  'Soulslike', 'Roguelike', 'Metroidvania', 'MOBA', 'Battle Royale', 'MMO',
  'Gacha', 'Cyberpunk', 'Sci-Fi', 'Fantasy', 'Dark Fantasy', 'Horror',
  'Post-apocalyptic', 'Mythology', 'Anime', 'Zombies', 'Singleplayer',
  'Multiplayer', 'Co-op', 'PvP', 'PvE'
];

export default function GamesCrudTab() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [gamesList, setGamesList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFetching, setIsFetching] = useState(true);
  const supabase = createClient();

  // CHẾ ĐỘ EDIT
  const [editingId, setEditingId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string>("");
  const [existingGalleryUrls, setExistingGalleryUrls] = useState<string[]>([]);

  // Zone 1: Main Thumbnail
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  // Zone 2: Gallery
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    status: "available",
    account_username: "",
    account_password: "",
  });

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const [sysReq, setSysReq] = useState<SysReqInfo>({
    os: "Windows 10 64-bit",
    cpu: "Intel Core i5-4460 / AMD FX-6300",
    ram: "8 GB RAM",
    gpu: "NVIDIA GeForce GTX 760 / AMD Radeon R7 260x",
    storage: "50 GB available space",
  });

  // ==========================================
  // 1. READ (LẤY DANH SÁCH)
  // ==========================================
  const fetchGames = async () => {
    try {
      setIsFetching(true);
      const { data, error } = await supabase
        .from('market_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error("Không thể tải dữ liệu: " + error.message);
      setGamesList(data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách game:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  // ==========================================
  // 2. DELETE (XÓA)
  // ==========================================
  const handleDelete = async (id: string) => {
    if (!window.confirm("🚨 BẠN CÓ CHẮC CHẮN MUỐN XÓA HOÀN TOÀN TÀI KHOẢN GAME NÀY KHỎI DATABASE? Hành động này không thể hoàn tác!")) return;

    try {
      const { deleteGameAction } = await import('@/app/cyber-core-xyz/actions');
      const result = await deleteGameAction(id);

      if (!result.success) throw new Error(result.error);

      // Update local state without re-fetching to make UI snappier
      setGamesList(prev => prev.filter(game => game.id !== id));
      router.refresh();
      alert("Xóa hoàn toàn tài khoản game thành công!");
    } catch (error: any) {
      alert("Không thể xóa: " + (error?.message || String(error)));
    }
  };

  // ==========================================
  // 3. QUICK STATUS UPDATE (ĐỔI TRẠNG THÁI NHANH)
  // ==========================================
  const handleQuickStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('market_items')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw new Error(error.message);

      // Cập nhật UI ngay lập tức
      setGamesList(prev => prev.map(game => game.id === id ? { ...game, status: newStatus } : game));
      router.refresh();
    } catch (error: any) {
      alert("Lỗi Cập Nhật: " + error.message);
    }
  };

  // ==========================================
  // 4. SETUP EDIT (NẠP DATA VÀO FORM)
  // ==========================================
  const handleEditSetup = (game: any) => {
    setEditingId(game.id);
    setFormData({
      title: game.title,
      price: game.price ? game.price.toString() : "",
      description: game.description || "",
      status: game.status || "available",
      account_username: game.account_username || "",
      account_password: game.account_password || "",
    });
    setSelectedTags(game.tags || []);
    setSysReq(game.sys_requirements || {
      os: "Windows 10 64-bit", cpu: "Intel Core i5-4460 / AMD FX-6300", ram: "8 GB RAM", gpu: "NVIDIA GeForce GTX 760", storage: "50 GB"
    });

    // Giữ lại link ảnh cũ
    setExistingImageUrl(game.image_url || "");
    setExistingGalleryUrls(game.gallery || []);

    // Reset file inputs mới
    setMainImageFile(null);
    setMainImagePreview(game.image_url || null); // Hiển thị ảnh cũ để preview
    setGalleryFiles([]);
    setGalleryPreviews(game.gallery || []); // Hiển thị gallery cũ

    // Cuộn màn hình xuống form
    document.getElementById('game-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", price: "", description: "", status: "available", account_username: "", account_password: "" });
    setSelectedTags([]);
    setSysReq({ os: "Windows 10 64-bit", cpu: "Intel Core i5-4460", ram: "8 GB RAM", gpu: "NVIDIA GTX 760", storage: "50 GB" });
    setMainImageFile(null);
    setMainImagePreview(null);
    setGalleryFiles([]);
    setGalleryPreviews([]);
    setExistingImageUrl("");
    setExistingGalleryUrls([]);
  };

  // ==========================================
  // UTILS CHO FORM
  // ==========================================
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\./g, "");
    if (rawValue === "") {
      setFormData({ ...formData, price: "" });
    } else if (!isNaN(Number(rawValue))) {
      setFormData({ ...formData, price: rawValue });
    }
  };

  const displayPrice = formData.price ? Number(formData.price).toLocaleString("vi-VN") : "";

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setMainImageFile(file);
    if (file) setMainImagePreview(URL.createObjectURL(file));
  };

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filesArray = e.target.files ? Array.from(e.target.files) : [];
    setGalleryFiles((prev) => [...prev, ...filesArray]);
    const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
    setGalleryPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeGalleryImage = (index: number) => {
    // Nếu đây là ảnh mới đang chọn (nằm trong galleryFiles)
    if (index >= existingGalleryUrls.length) {
      const actualIndex = index - existingGalleryUrls.length;
      setGalleryFiles(prev => prev.filter((_, i) => i !== actualIndex));
    } else {
      // Nếu là ảnh cũ từ database, xóa nó khỏi mảng existing
      setExistingGalleryUrls(prev => prev.filter((_, i) => i !== index));
    }
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // UPLOAD ẢNH (FETCH)
  // ==========================================
  const uploadFileToSupabase = async (file: File, bucket: string): Promise<string> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${fileName}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${anonKey}`,
        'Content-Type': file.type || 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) throw new Error("Lỗi up ảnh!");
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${fileName}`;
  };

  // ==========================================
  // 5. CREATE & UPDATE (SUBMIT FORM)
  // ==========================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      // 1. Tải ảnh chính (Nếu có file mới thì up, không thì lấy link cũ)
      let imageUrl = existingImageUrl;
      if (mainImageFile) {
        imageUrl = await uploadFileToSupabase(mainImageFile, 'game_gallery');
      }

      // 2. Tải ảnh phụ (Nếu có up thêm file mới)
      let galleryUrls = [...existingGalleryUrls];
      for (const file of galleryFiles) {
        const url = await uploadFileToSupabase(file, 'game_gallery');
        galleryUrls.push(url);
      }

      const payload = {
        title: formData.title,
        price: Number(formData.price),
        status: formData.status,
        tags: selectedTags,
        description: formData.description,
        sys_requirements: sysReq,
        image_url: imageUrl,
        gallery: galleryUrls,
        account_username: formData.account_username,
        account_password: formData.account_password
      };

      // Quyết định thao tác dựa vào việc Đang Sửa hay Thêm Mới
      if (editingId) {
        const { error } = await supabase.from('market_items').update(payload).eq('id', editingId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from('market_items').insert(payload);
        if (error) throw new Error(error.message);
      }

      alert(editingId ? "🎉 CẬP NHẬT TÀI KHOẢN THÀNH CÔNG!" : "🎉 TÀI KHOẢN GAME ĐÃ ĐƯỢC THÊM!");

      resetForm();
      fetchGames(); // Tải lại danh sách
      router.refresh();

    } catch (error: any) {
      alert("LỖI: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = gamesList.filter(game => game.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 max-w-[1400px] mx-auto mb-10">
      <div className="xl:col-span-5 flex flex-col gap-4">

      {/* ========================================= */}
      {/* PHẦN 1: KHO HÀNG & QUẢN LÝ NHANH          */}
      {/* ========================================= */}
      <div className="bg-black/60 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-2xl">
        <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="text-purple-400" />
            KHO TÀI KHOẢN HIỆN CÓ
          </h2>
          <div className="bg-purple-500/20 border border-purple-500/50 px-4 py-1.5 rounded-full text-purple-300 font-mono text-sm font-bold">
            Tổng số lượng: {filteredGames.length} Game
          </div>
        </div>

        <div className="mb-4">
          <input 
            type="text" 
            placeholder="Tìm kiếm game..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-sm" 
          />
        </div>

        {isFetching ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-purple-400" size={32} /></div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-mono border border-dashed border-white/10 rounded-xl">
            Không tìm thấy tài khoản nào.
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredGames.map((game) => (
              <div key={game.id} className="bg-white/5 border border-white/10 hover:border-purple-500/50 transition-colors p-4 rounded-xl flex flex-col gap-3 group relative">

                {/* Thông tin cơ bản */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-black overflow-hidden flex-shrink-0 border border-white/10">
                    {game.image_url ? (
                      <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                    ) : (
                      <Gamepad2 className="w-full h-full p-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <h3 className="text-white font-bold text-sm truncate">{game.title}</h3>
                    <p className="text-cyan-400 font-mono text-xs mt-1">{Number(game.price).toLocaleString("vi-VN")} VNĐ</p>

                    {/* Select đổi trạng thái nhanh */}
                    <select
                      value={game.status}
                      onChange={(e) => handleQuickStatus(game.id, e.target.value)}
                      className={`mt-2 text-xs font-bold outline-none cursor-pointer rounded px-1 py-1 w-max
                        ${game.status === 'available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          game.status === 'sold' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                            'bg-gray-500/20 text-gray-400 border border-gray-500/30'}`}
                    >
                      <option value="available" className="bg-gray-900 text-white">🟢 Available</option>
                      <option value="sold" className="bg-gray-900 text-white">🔴 Sold</option>
                      <option value="hidden" className="bg-gray-900 text-white">⚪ Hidden</option>
                    </select>
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-2 pt-2 border-t border-white/5">
                  <button onClick={() => handleEditSetup(game)} className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 py-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold transition-colors">
                    <Edit2 size={12} /> SỬA
                  </button>
                  <button onClick={() => handleDelete(game.id)} className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-1.5 rounded flex items-center justify-center gap-1 text-xs font-bold transition-colors">
                    <Trash2 size={12} /> XÓA
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

      </div>

      {/* ========================================= */}
      {/* PHẦN 2: FORM THÊM / CẬP NHẬT TÀI KHOẢN    */}
      {/* ========================================= */}
      <div className="xl:col-span-7 sticky top-4 h-fit">
        <div id="game-form" className={`bg-black/60 border rounded-2xl p-6 md:p-8 backdrop-blur-md shadow-2xl transition-all duration-300 ${editingId ? 'border-cyan-500 shadow-cyan-500/20' : 'border-white/10'}`}>
        <div className="mb-8 border-b border-white/10 pb-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {editingId ? <Edit2 className="text-cyan-400" /> : <Plus className="text-cyan-400" />}
            {editingId ? "CẬP NHẬT TÀI KHOẢN" : "THÊM TÀI KHOẢN GAME MỚI"}
          </h2>
          {editingId && (
            <button type="button" onClick={resetForm} className="bg-gray-500/20 hover:bg-gray-500/40 text-gray-300 px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <X size={16} /> HỦY SỬA
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Tên Game</label>
              <input required type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Giá (VNĐ)</label>
              <input required type="text" value={displayPrice} onChange={handlePriceChange} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Tài Khoản (Username/Email)</label>
              <input required type="text" value={formData.account_username} onChange={(e) => setFormData({ ...formData, account_username: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 font-mono" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-rose-400 uppercase tracking-widest">Mật Khẩu</label>
              <input required type="text" value={formData.account_password} onChange={(e) => setFormData({ ...formData, account_password: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-rose-500 font-mono" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Thể loại / Tags</label>
            <div className="flex flex-wrap gap-2">
              {PREDEFINED_TAGS.map(tag => (
                <button type="button" key={tag} onClick={() => toggleTag(tag)} className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold transition-all ${selectedTags.includes(tag) ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-400 text-cyan-300' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Mô tả</label>
            <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cyan-500 font-mono resize-y" />
          </div>

          {/* Cấu hình hệ thống */}
          <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-xl">
            <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2"><Gamepad2 size={16} /> CẤU HÌNH HỆ THỐNG YÊU CẦU</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Hệ điều hành (OS)</label>
                <input type="text" value={sysReq.os} onChange={e => setSysReq({...sysReq, os: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono" placeholder="Ví dụ: Windows 10 64-bit" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Bộ vi xử lý (CPU)</label>
                <input type="text" value={sysReq.cpu} onChange={e => setSysReq({...sysReq, cpu: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono" placeholder="Ví dụ: Intel Core i5-4460" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Bộ nhớ (RAM)</label>
                <input type="text" value={sysReq.ram} onChange={e => setSysReq({...sysReq, ram: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono" placeholder="Ví dụ: 8 GB RAM" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400 font-bold uppercase">Đồ họa (GPU)</label>
                <input type="text" value={sysReq.gpu} onChange={e => setSysReq({...sysReq, gpu: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono" placeholder="Ví dụ: NVIDIA GTX 760" />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs text-gray-400 font-bold uppercase">Lưu trữ (Storage)</label>
                <input type="text" value={sysReq.storage} onChange={e => setSysReq({...sysReq, storage: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 font-mono" placeholder="Ví dụ: 50 GB" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4 bg-white/5 border border-cyan-500/30 p-6 rounded-xl border-dashed">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Ảnh Bìa (Đổi ảnh mới sẽ xóa ảnh cũ)</label>
                <div className="relative inline-block group">
                  <button type="button" className="bg-cyan-500/20 text-cyan-300 text-sm py-2 px-4 rounded-lg flex items-center gap-2"><ImageIcon size={16} /> Chọn Ảnh</button>
                  <input type="file" accept="image/*" onChange={handleMainImageChange} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              {mainImagePreview && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-cyan-500/50 mt-4 group">
                  <img src={mainImagePreview} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setMainImagePreview(null); setMainImageFile(null); setExistingImageUrl(""); }} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><X size={24} /></button>
                </div>
              )}
            </div>

            <div className="space-y-4 bg-white/5 border border-white/10 p-6 rounded-xl border-dashed">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-purple-400 uppercase tracking-widest">Thư Viện Ảnh (Gallery)</label>
                <div className="relative inline-block group">
                  <button type="button" className="bg-white/10 text-white text-sm py-2 px-4 rounded-lg flex items-center gap-2"><UploadCloud size={16} /> Thêm Ảnh</button>
                  <input type="file" multiple accept="image/*" onChange={handleGalleryChange} className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer" />
                </div>
              </div>
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {galleryPreviews.map((src, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden group">
                      <img src={src} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex justify-center items-center text-white"><X size={16} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={isLoading} className="w-full relative group overflow-hidden rounded-xl p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500 opacity-70 group-hover:opacity-100 animate-pulse"></span>
              <div className="relative flex items-center justify-center gap-2 bg-black hover:bg-[#0a0a0a] rounded-xl px-8 py-4">
                {isLoading ? (
                  <><Loader2 className="animate-spin text-cyan-400" /><span className="text-cyan-400 font-bold">ĐANG XỬ LÝ...</span></>
                ) : (
                  <span className="text-white font-bold tracking-widest flex items-center gap-2">
                    {editingId ? <Save size={20} /> : <Plus size={20} />}
                    {editingId ? "LƯU CẬP NHẬT TÀI KHOẢN" : "ĐĂNG TÀI KHOẢN VÀO KHO"}
                  </span>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
      </div>

    </div>
  );
}