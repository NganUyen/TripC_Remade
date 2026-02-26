"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Camera,
  Save,
  Edit,
  Check,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface ProviderData {
  id: string;
  name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  website?: string;
  description?: string;
}

export function ProviderSettings() {
  const supabase = useSupabaseClient();
  const { supabaseUser, isLoading: isAuthLoading } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderData | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<ProviderData>>({
    name: "",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    address: "",
    website: "",
    description: "",
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [providerToDelete, setProviderToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (supabaseUser) {
      fetchProviders();
    }
  }, [supabaseUser]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      if (!supabaseUser) return;

      const response = await fetch("/api/partner/transport/providers", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const result = await response.json();

      if (result.success && result.data) {
        setProviders(result.data as ProviderData[]);
        if (result.data.length === 1 && !selectedProvider) {
          setSelectedProvider(result.data[0] as ProviderData);
        }
      }
    } catch (error) {
      console.error("Error fetching providers:", error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (p: ProviderData | null) => {
    if (p) {
      setSelectedProvider(p);
      setFormData({
        name: p.name || "",
        logo_url: p.logo_url || "",
        contact_email: p.contact_email || "",
        contact_phone: p.contact_phone || "",
        address: p.address || "",
        website: p.website || "",
        description: p.description || "",
      });
    } else {
      setSelectedProvider(null);
      setFormData({
        name: "",
        logo_url: "",
        contact_email: "",
        contact_phone: "",
        address: "",
        website: "",
        description: "",
      });
    }
    setEditMode(true);
  };

  const handleSave = async () => {
    console.log("🚀 [handleSave] Started", { formData, selectedProvider, supabaseUser });
    try {
      if (!formData.name) {
        toast.error("Vui lòng nhập tên doanh nghiệp");
        return;
      }

      setSaving(true);
      if (!supabaseUser) {
        console.error("❌ [handleSave] No user found");
        toast.error("Bạn chưa đăng nhập hoặc phiên làm việc hết hạn");
        return;
      }

      const dataToSave = {
        ...formData,
        id: selectedProvider?.id // Include ID if updating
      };

      console.log("📡 [handleSave] Fetching API", dataToSave);

      const response = await fetch("/api/partner/transport/providers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": supabaseUser.id
        },
        body: JSON.stringify(dataToSave),
      });

      console.log("📊 [handleSave] Response received", response.status);
      const result = await response.json();
      console.log("✅ [handleSave] Result:", result);

      if (!result.success) throw new Error(result.error);

      toast.success(selectedProvider ? "Cập nhật hồ sơ thành công" : "Tạo hồ sơ nhà xe mới thành công");
      setEditMode(false);
      fetchProviders();
    } catch (error: any) {
      console.error("🔥 [handleSave] Error:", error);
      const errorMessage = error.message || "Vui lòng kiểm tra console";
      toast.error(`Lỗi khi lưu: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (providerId: string) => {
    setProviderToDelete(providerId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!providerToDelete) return;

    try {
      if (!supabaseUser) return;
      setLoading(true);
      setShowDeleteModal(false);

      const response = await fetch(`/api/partner/transport/providers?id=${providerToDelete}`, {
        method: "DELETE",
        headers: {
          "x-user-id": supabaseUser.id
        }
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Đã xóa hồ sơ nhà xe thành công");
      fetchProviders();
    } catch (error: any) {
      console.error("Error deleting provider:", error);
      toast.error(`Lỗi khi xóa: ${error.message}`);
    } finally {
      setLoading(false);
      setProviderToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 animate-pulse" />
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-12 bg-slate-200 dark:bg-slate-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-2xl">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Hồ sơ Nhà xe
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              {editMode
                ? "Đang chỉnh sửa thông tin doanh nghiệp"
                : "Quản lý thông tin và thương hiệu của bạn"}
            </p>
          </div>
        </div>
        {!editMode && (
          <button
            onClick={() => startEditing(null)}
            className="flex items-center gap-2.5 px-6 py-3 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-primary/90 hover:scale-105 transition-all shadow-lg shadow-primary/25"
          >
            <Building2 className="w-5 h-5" />
            Thêm Nhà xe mới
          </button>
        )}
      </div>

      {editMode ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none sticky top-8">
              <div className="text-center">
                <div className="relative inline-block mb-6 group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-800 shadow-inner">
                    {formData.logo_url ? (
                      <img
                        src={formData.logo_url}
                        alt={formData.name || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg border-4 border-white dark:border-slate-900 hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formData.name || "Tên doanh nghiệp"}
                </h2>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mt-3">
                  <Building2 className="w-3 h-3" />
                  Transport Partner
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {formData.contact_email || "Chưa cập nhật"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                  <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-sm font-medium">
                    {formData.contact_phone || "Chưa cập nhật"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                      Thông tin chi tiết
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setEditMode(false)}
                      className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-105 transition-all shadow-lg disabled:opacity-50"
                    >
                      {saving ? "Đang lưu..." : "Lưu hồ sơ"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Tên doanh nghiệp
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Email liên hệ
                    </label>
                    <input
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_email: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contact_phone: e.target.value,
                        })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Địa chỉ trụ sở
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2 ml-1">
                      Mô tả doanh nghiệp
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={5}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary/20 focus:bg-white dark:focus:bg-slate-800 rounded-[1.5rem] outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : providers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {providers.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-primary/5 transition-all group"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700">
                  {p.logo_url ? (
                    <img
                      src={p.logo_url}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEditing(p)}
                    className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary rounded-xl transition-all"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-3 bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2 truncate">
                {p.name}
              </h3>
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5" />
                  {p.contact_email}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <Phone className="w-3.5 h-3.5" />
                  {p.contact_phone}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800">
                <button
                  onClick={() => startEditing(p)}
                  className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all"
                >
                  Quản lý hồ sơ
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
            Chưa có thông tin nhà cung cấp
          </h3>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto mb-8">
            Để bắt đầu kinh doanh trên TripC, bạn cần thiết lập hồ sơ doanh
            nghiệp trước.
          </p>
          <button
            onClick={() => startEditing(null)}
            className="px-8 py-4 bg-primary text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Tạo hồ sơ ngay
          </button>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-[1.5rem] flex items-center justify-center mb-6">
                  <AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                  Xác nhận xóa?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-8">
                  Bạn có chắc chắn muốn xóa hồ sơ nhà xe này? Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị mất.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 py-4 bg-red-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-600 shadow-lg shadow-red-500/25 hover:scale-105 transition-all"
                  >
                    Xác nhận xóa
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
