"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Star,
  Edit,
  Trash2,
  Car,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  licenseNumber: string;
  licenseExpiry: string;
  status: "available" | "on_trip" | "off_duty";
  rating: number;
  totalTrips: number;
  joinedDate: string;
}

export function DriverManagement() {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentProviderId, setCurrentProviderId] = useState<string | null>(
    null,
  );
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);
  const [providers, setProviders] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    licenseNumber: "",
    licenseExpiry: "",
    status: "available" as Driver["status"],
    rating: 5.0,
    totalTrips: 0,
    provider_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Providers for current user
      const { data: providersData, error: providerError } = await supabase
        .from("transport_providers")
        .select("id, name")
        .eq("owner_id", user.id);

      if (providerError) throw providerError;

      const myProviders = providersData || [];
      setProviders(myProviders);

      if (myProviders.length === 0) {
        setDrivers([]);
        setLoading(false);
        return;
      }

      const providerIds = myProviders.map((p) => p.id);
      if (!formData.provider_id && myProviders.length > 0) {
        setFormData((prev) => ({ ...prev, provider_id: myProviders[0].id }));
      }

      // 2. Get Drivers
      const { data: driversData, error: driversError } = await supabase
        .from("transport_drivers")
        .select("*")
        .in("provider_id", providerIds)
        .order("created_at", { ascending: false });

      if (driversError) throw driversError;

      if (driversData) {
        setDrivers(
          driversData.map((d: any) => ({
            id: d.id,
            name: d.name,
            phone: d.phone,
            email: d.email,
            licenseNumber: d.license_number,
            licenseExpiry: d.license_expiry,
            status: d.status,
            rating: d.rating,
            totalTrips: d.total_trips,
            joinedDate: d.joined_date,
            provider_id: d.provider_id,
          })),
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.provider_id) {
      alert("Vui lòng chọn nhà cung cấp");
      return;
    }

    // Basic validation
    if (!formData.name || !formData.phone || !formData.licenseNumber) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setSaving(true);
      const driverData = {
        provider_id: formData.provider_id,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        license_number: formData.licenseNumber,
        license_expiry: formData.licenseExpiry,
        status: formData.status,
        rating: formData.rating,
        total_trips: formData.totalTrips,
      };

      if (editingDriver) {
        const { error } = await supabase
          .from("transport_drivers")
          .update(driverData)
          .eq("id", editingDriver.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("transport_drivers")
          .insert([driverData]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingDriver(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Có lỗi xảy ra khi lưu thông tin tài xế");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài xế này?")) return;

    try {
      const { error } = await supabase
        .from("transport_drivers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error("Error deleting driver:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      email: "",
      licenseNumber: "",
      licenseExpiry: "",
      status: "available",
      rating: 5.0,
      totalTrips: 0,
      provider_id: providers.length > 0 ? providers[0].id : "",
    });
  };

  const openEditModal = (driver: any) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      email: driver.email || "",
      licenseNumber: driver.licenseNumber,
      licenseExpiry: driver.licenseExpiry,
      status: driver.status,
      rating: driver.rating,
      totalTrips: driver.totalTrips,
      provider_id: driver.provider_id,
    });
    setShowAddModal(true);
  };

  const getStatusBadge = (status: Driver["status"]) => {
    const config = {
      available: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        label: "Sẵn sàng",
        icon: CheckCircle,
      },
      on_trip: {
        bg: "bg-blue-100 dark:bg-blue-900/20",
        text: "text-blue-700 dark:text-blue-400",
        label: "Đang chạy",
        icon: Car,
      },
      off_duty: {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-400",
        label: "Nghỉ",
        icon: Clock,
      },
    };
    const c = config[status] || config.available;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
      >
        <c.icon className="w-3 h-3" />
        {c.label}
      </span>
    );
  };

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone.includes(searchTerm) ||
      driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || driver.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quản lý Tài xế
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý thông tin và lịch trình của đội ngũ tài xế
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDriver(null);
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm tài xế
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tên, số điện thoại, bằng lái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Sẵn sàng</option>
          <option value="on_trip">Đang chạy</option>
          <option value="off_duty">Nghỉ</option>
        </select>
      </div>

      {/* Driver Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="flex-1">
                  <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow"
            >
              {/* Driver Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {driver.name.split(" ").pop()?.[0] || "D"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {driver.name}
                    </h3>
                    {getStatusBadge(driver.status)}
                  </div>
                </div>
              </div>

              {/* Driver Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {driver.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {driver.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Car className="w-4 h-4 text-slate-400" />
                  Bằng lái: {driver.licenseNumber}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{driver.rating}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Đánh giá
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-900 dark:text-white">
                    {driver.totalTrips}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chuyến đi
                  </p>
                </div>
              </div>

              {/* License Expiry */}
              <div className="text-sm mb-4">
                <span className="text-slate-500 dark:text-slate-400">
                  Bằng lái hết hạn:{" "}
                </span>
                <span
                  className={`font-medium ${new Date(driver.licenseExpiry) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) ? "text-amber-600" : "text-slate-900 dark:text-white"}`}
                >
                  {formatDate(driver.licenseExpiry)}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openEditModal(driver)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(driver.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <Users className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có tài xế nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Bắt đầu bằng cách thêm tài xế đầu tiên
          </p>
          <button
            onClick={() => {
              setEditingDriver(null);
              resetForm();
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm tài xế
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Tổng tài xế",
            value: drivers.length,
            color: "text-primary",
          },
          {
            label: "Sẵn sàng",
            value: drivers.filter((d) => d.status === "available").length,
            color: "text-green-600",
          },
          {
            label: "Đang chạy",
            value: drivers.filter((d) => d.status === "on_trip").length,
            color: "text-blue-600",
          },
          {
            label: "Nghỉ",
            value: drivers.filter((d) => d.status === "off_duty").length,
            color: "text-slate-600",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {stat.label}
            </p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingDriver ? "Cập nhật tài xế" : "Thêm tài xế mới"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Thông tin chi tiết đội ngũ lái xe
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar"
            >
              {/* Provider Selection (only if multiple) */}
              {providers.length > 1 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nhà cung cấp
                  </label>
                  <select
                    value={formData.provider_id}
                    onChange={(e) =>
                      setFormData({ ...formData, provider_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Họ và tên
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    placeholder="Nhập họ tên tài xế"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Số điện thoại
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="090..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Số bằng lái
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      placeholder="GPLX..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Ngày hết hạn
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.licenseExpiry}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseExpiry: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái công việc
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  >
                    <option value="available">Sẵn sàng (Available)</option>
                    <option value="on_trip">Đang chạy (On Trip)</option>
                    <option value="off_duty">Đang nghỉ (Off Duty)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 rounded-xl">
                <p className="text-xs text-amber-700 dark:text-amber-400 italic">
                  Lưu ý: Thông tin bằng lái cần chính xác để đảm bảo an toàn vận
                  hành và đối soát bảo hiểm.
                </p>
              </div>
            </form>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-800/50">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className={`px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                {editingDriver ? "Cập nhật" : "Thêm tài xế"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
