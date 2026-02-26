"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bus,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Wifi,
  AirVent,
  Tv,
  Usb,
  Check,
  X,
  Save,
  Image as ImageIcon,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface Vehicle {
  id: string;
  type: string;
  vehicle_type?: string; // Legacy/Mapped
  plate_number: string;
  model: string;
  capacity: number;
  amenities: {
    wifi?: boolean;
    ac?: boolean;
    tv?: boolean;
    usb?: boolean;
  };
  images: string[];
  status: "active" | "maintenance" | "inactive";
  provider_id: string;
}

interface TransportProvider {
  id: string;
  name: string;
  logo_url: string;
}

export function FleetManagement() {
  const supabase = useSupabaseClient();
  const { supabaseUser, isLoading: isAuthLoading } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    type: "bus",
    status: "active",
    amenities: { wifi: true, ac: true },
    images: [],
    capacity: 29,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (supabaseUser) fetchData();
  }, [supabaseUser]);

  const refreshProviders = async () => {
    if (!supabaseUser) return [];
    try {
      const resp = await fetch("/api/partner/transport/providers", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const result = await resp.json();
      if (result.success) {
        setProviders(result.data || []);
        return result.data || [];
      }
    } catch (error) {
      console.error("Error refreshing providers:", error);
    }
    return [];
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      if (!supabaseUser) return;

      // 1. Fetch providers
      const myProviders = await refreshProviders();

      if (myProviders.length > 0) {
        const allVehicles: Vehicle[] = [];
        for (const p of myProviders) {
          const resp = await fetch(`/api/partner/transport/vehicles?provider_id=${p.id}`, {
            headers: { "x-user-id": supabaseUser.id },
          });
          const result = await resp.json();
          if (result.success && result.data) {
            allVehicles.push(...result.data);
          }
        }
        setVehicles(allVehicles);
      } else {
        setVehicles([]);
      }
    } catch (error: any) {
      console.error("Error fetching vehicles:", error);
      toast.error("Lỗi khi tải đội xe: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!supabaseUser) return;

      // Validate
      if (!formData.plate_number) {
        toast.error("Vui lòng nhập biển số xe");
        return;
      }

      const plateRegex = /^[0-9]{2}[A-Z]-[0-9]{3,5}(\.[0-9]{2})?$/i;
      if (!plateRegex.test(formData.plate_number.replace(/\s/g, ""))) {
        toast.warning("Biển số xe có vẻ không hợp lệ. Vui lòng kiểm tra lại.");
      }

      if (!formData.model) {
        toast.error("Vui lòng nhập mẫu xe (ví dụ: Hyundai Solati)");
        return;
      }

      if (!formData.capacity || formData.capacity < 1) {
        toast.error("Số chỗ ngồi phải lớn hơn 0");
        return;
      }

      setSaving(true);

      const dataToSave = {
        ...formData,
        id: editingVehicle?.id,
        provider_id: formData.provider_id || providers[0]?.id,
      };

      if (!dataToSave.provider_id) {
        toast.error("Vui lòng tạo hồ sơ nhà cung cấp trước khi thêm phương tiện.");
        setSaving(false);
        return;
      }

      const response = await fetch("/api/partner/transport/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": supabaseUser.id
        },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success(editingVehicle ? "Cập nhật phương tiện thành công" : "Thêm phương tiện mới thành công");

      setShowModal(false);
      setEditingVehicle(null);
      setFormData({
        type: "bus",
        status: "active",
        amenities: { wifi: true, ac: true },
        images: [],
        capacity: 29,
      });
      fetchData();
    } catch (error: any) {
      console.error("Error saving vehicle:", error);
      toast.error("Lỗi khi lưu phương tiện: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabaseUser) return;
    if (!confirm("Bạn có chắc chắn muốn xóa phương tiện này?")) return;

    try {
      const response = await fetch(`/api/partner/transport/vehicles?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-id": supabaseUser.id },
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Đã xóa phương tiện");
      fetchData();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      toast.error("Lỗi khi xóa phương tiện: " + error.message);
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData(vehicle);
    setShowModal(true);
  };

  const openAddModal = async () => {
    setEditingVehicle(null);
    // Refresh providers on open to ensure sync
    const currentProviders = await refreshProviders();
    setFormData({
      type: "bus",
      status: "active",
      amenities: { wifi: true, ac: true },
      images: [],
      provider_id: currentProviders.length > 0 ? currentProviders[0].id : "",
      capacity: 29,
    });
    setShowModal(true);
  };

  const vehicleTypes = [
    { value: "all", label: "Tất cả" },
    { value: "bus", label: "Xe buýt / Khách", defaultCapacity: 29 },
    { value: "limousine", label: "Limousine", defaultCapacity: 9 },
    { value: "private_car", label: "Xe riêng (4-7 chỗ)", defaultCapacity: 4 },
    { value: "train", label: "Tàu hỏa", defaultCapacity: 40 },
    { value: "airplane", label: "Máy bay", defaultCapacity: 150 },
  ];

  const handleTypeChange = (type: string) => {
    const selectedType = vehicleTypes.find((t) => t.value === type);
    setFormData({
      ...formData,
      type,
      capacity: selectedType?.defaultCapacity || formData.capacity,
    });
  };

  const getVehicleIcon = (type: string) => {
    return Bus;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> =
    {
      active: {
        bg: "bg-green-100 dark:bg-green-900/20",
        text: "text-green-700 dark:text-green-400",
        label: "Hoạt động",
      },
      maintenance: {
        bg: "bg-amber-100 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-400",
        label: "Bảo trì",
      },
      inactive: {
        bg: "bg-red-100 dark:bg-red-900/20",
        text: "text-red-700 dark:text-red-400",
        label: "Không hoạt động",
      },
    };
    const c = config[status] || config.active;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  const getVehicleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      bus: "Xe buýt",
      limousine: "Limousine",
      private_car: "Xe riêng",
      train: "Tàu",
      airplane: "Máy bay",
    };
    return labels[type] || type;
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || vehicle.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getProviderName = (providerId: string) => {
    return providers.find((p) => p.id === providerId)?.name || "N/A";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quản lý Đội xe
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Quản lý và theo dõi tất cả phương tiện trong hệ thống
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Thêm phương tiện
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo biển số, mẫu xe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            {vehicleTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicle Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse"
            >
              <div className="h-40 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredVehicles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle, index) => {
            const VehicleIcon = getVehicleIcon(vehicle.type);
            return (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow group"
              >
                {/* Vehicle Image */}
                <div className="relative h-40 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                  {vehicle.images?.[0] ? (
                    <img
                      src={vehicle.images[0]}
                      alt={vehicle.model}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <VehicleIcon className="w-16 h-16 text-slate-300 dark:text-slate-600" />
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(vehicle.status || "active")}
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {vehicle.model || getVehicleTypeLabel(vehicle.type)}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {vehicle.plate_number} • {vehicle.capacity} chỗ
                      </p>
                    </div>
                  </div>

                  {/* Provider */}
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-medium">Nhà cung cấp:</span>{" "}
                    {getProviderName(vehicle.provider_id || "")}
                  </p>

                  {/* Amenities */}
                  <div className="flex items-center gap-2">
                    {vehicle.amenities?.wifi && (
                      <div
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title="WiFi"
                      >
                        <Wifi className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {vehicle.amenities?.ac && (
                      <div
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title="Điều hòa"
                      >
                        <AirVent className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {vehicle.amenities?.tv && (
                      <div
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title="TV"
                      >
                        <Tv className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    {vehicle.amenities?.usb && (
                      <div
                        className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg"
                        title="USB"
                      >
                        <Usb className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => openEditModal(vehicle)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle.id)}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200 dark:border-slate-800 text-center">
          <Bus className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Chưa có phương tiện nào
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Bắt đầu bằng cách thêm phương tiện đầu tiên của bạn
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Thêm phương tiện
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[
          {
            label: "Tổng phương tiện",
            value: vehicles.length,
            color: "text-primary",
          },
          {
            label: "Đang hoạt động",
            value: vehicles.filter((v) => v.status === "active").length,
            color: "text-green-600",
          },
          {
            label: "Bảo trì",
            value: vehicles.filter((v) => v.status === "maintenance").length,
            color: "text-amber-600",
          },
          {
            label: "Không hoạt động",
            value: vehicles.filter((v) => v.status === "inactive").length,
            color: "text-red-600",
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

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingVehicle
                    ? "Chỉnh sửa phương tiện"
                    : "Thêm phương tiện mới"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Provider Selection (only if multiple or newly created) */}
              {(providers.length > 1 || !editingVehicle) && (
                <div className="space-y-1.5 p-6 bg-primary/5 rounded-2xl border border-primary/10 mb-6">
                  <label className="text-sm font-bold text-primary flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    Nhà cung cấp vận chuyển
                  </label>
                  <select
                    value={formData.provider_id || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, provider_id: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border-2 border-primary/20 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all font-semibold"
                  >
                    <option value="" disabled>--- Chọn nhà cung cấp ---</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-primary/60 italic px-1">
                    * Bạn có thể tạo thêm hồ sơ trong phần "Cài đặt"
                  </p>
                </div>
              )}

              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Basic Info Group */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Biển số xe
                      </label>
                      <input
                        type="text"
                        value={formData.plate_number || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            plate_number: e.target.value.toUpperCase(),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 italic">
                        Ví dụ: 29B-123.45
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Loại xe
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleTypeChange(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        {vehicleTypes
                          .filter((t) => t.value !== "all")
                          .map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Tên mẫu xe (Model)
                    </label>
                    <input
                      type="text"
                      value={formData.model || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Số chỗ ngồi
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={formData.capacity || 0}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            capacity: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Trạng thái
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
                        <option value="active">Hoạt động</option>
                        <option value="maintenance">Bảo trì</option>
                        <option value="inactive">Ngưng hoạt động</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Amenities Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Tiện ích đi kèm
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { key: "wifi", label: "WiFi", icon: Wifi },
                      { key: "ac", label: "Điều hòa", icon: AirVent },
                      { key: "tv", label: "TV", icon: Tv },
                      { key: "usb", label: "USB", icon: Usb },
                    ].map((item) => (
                      <label
                        key={item.key}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${formData.amenities?.[
                          item.key as keyof Vehicle["amenities"]
                        ]
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-500"
                          }`}
                      >
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={
                            formData.amenities?.[
                            item.key as keyof Vehicle["amenities"]
                            ] || false
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              amenities: {
                                ...formData.amenities,
                                [item.key]: e.target.checked,
                              },
                            })
                          }
                        />
                        <item.icon className="w-5 h-5 mb-1" />
                        <span className="text-xs font-medium">
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Image Section */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Hình ảnh phương tiện
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.images?.[0] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, images: [e.target.value] })
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  {formData.images?.[0] ? (
                    <div className="relative group rounded-2xl overflow-hidden aspect-video bg-slate-100 border-2 border-slate-100 dark:border-slate-800 shadow-inner">
                      <img
                        src={formData.images[0]}
                        alt="Preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x225?text=Ảnh+không+hợp+lệ";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          Click để thay đổi
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400">
                      <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
                      <p className="text-xs">Chưa có ảnh preview</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 italic flex-1">
                  Dữ liệu sau khi lưu sẽ tự động đồng bộ lên trang tìm kiếm của
                  khách hàng.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center gap-2 ${saving ? "opacity-70 cursor-not-allowed" : ""}`}
                  >
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {editingVehicle ? "Cập nhật" : "Lưu phương tiện"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
