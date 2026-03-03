"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Route as RouteIcon,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Calendar,
  ArrowRight,
  X,
  Save,
} from "lucide-react";
import { useSupabaseClient } from "@/lib/supabase";
import { toast } from "sonner";
import { useCurrentUser } from "@/lib/hooks/useCurrentUser";

interface TransportRoute {
  id: string;
  origin: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  price: number;
  currency: string;
  seats_available: number;
  type: string;
  vehicle_type: string;
  vehicle_details: Record<string, any>;
  provider_id: string;
  vehicle_id?: string;
  transport_providers?: {
    name: string;
    logo_url: string;
  };
  transport_vehicles?: {
    plate_number: string;
    model: string;
  };
}

interface Vehicle {
  id: string;
  type: string;
  plate_number: string;
  model: string;
  capacity: number;
  amenities: Record<string, any>;
  provider_id: string;
  status: string;
}

interface TransportProvider {
  id: string;
  name: string;
  logo_url: string;
}

export function RouteManagement() {
  const supabase = useSupabaseClient();
  const { supabaseUser, isLoading: isAuthLoading } = useCurrentUser();
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<TransportRoute[]>([]);
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRoute, setEditingRoute] = useState<TransportRoute | null>(null);
  const [formData, setFormData] = useState<Partial<TransportRoute>>({
    currency: "VND",
    type: "bus",
    vehicle_type: "29 seats",
    seats_available: 29,
  });
  const [saving, setSaving] = useState(false);
  const [minDateTime, setMinDateTime] = useState("");

  useEffect(() => {
    updateMinDateTime();
    const interval = setInterval(updateMinDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const updateMinDateTime = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = new Date(Date.now() - tzOffset).toISOString().slice(0, 16);
    setMinDateTime(localISOTime);
  };

  useEffect(() => {
    if (supabaseUser) {
      fetchRoutes();
    }
  }, [supabaseUser]);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      if (!supabaseUser) return;

      // 1. Fetch providers
      const providersResp = await fetch("/api/partner/transport/providers", {
        headers: { "x-user-id": supabaseUser.id },
      });
      const providersResult = await providersResp.json();
      if (!providersResult.success) throw new Error(providersResult.error);

      const myProviders = (providersResult.data || []) as TransportProvider[];
      setProviders(myProviders);

      if (myProviders.length > 0) {
        const allVehicles: Vehicle[] = [];
        const allRoutes: TransportRoute[] = [];

        for (const p of myProviders) {
          // Fetch vehicles
          const vResp = await fetch(`/api/partner/transport/vehicles?provider_id=${p.id}`, {
            headers: { "x-user-id": supabaseUser.id },
          });
          const vResult = await vResp.json();
          if (vResult.success && vResult.data) {
            allVehicles.push(...vResult.data.filter((v: any) => v.status === "active"));
          }

          // Fetch routes
          const rResp = await fetch(`/api/partner/transport/routes?provider_id=${p.id}`, {
            headers: { "x-user-id": supabaseUser.id },
          });
          const rResult = await rResp.json();
          if (rResult.success && rResult.data) {
            allRoutes.push(...rResult.data);
          }
        }

        setVehicles(allVehicles);
        setRoutes(allRoutes);
      } else {
        setVehicles([]);
        setRoutes([]);
      }
    } catch (error: any) {
      console.error("Error fetching routes data:", error);
      toast.error("Lỗi khi tải dữ liệu: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!supabaseUser) return;

      // Validate
      if (!formData.origin || !formData.destination) {
        toast.error("Vui lòng nhập điểm đi và điểm đến");
        return;
      }

      if (!formData.departure_time || !formData.arrival_time) {
        toast.error("Vui lòng chọn thời gian khởi hành và kết thúc");
        return;
      }

      const now = new Date();
      const departure = new Date(formData.departure_time);
      const arrival = new Date(formData.arrival_time);

      if (departure < now) {
        toast.error("Thời gian khởi hành phải từ thời điểm hiện tại trở đi");
        return;
      }

      if (arrival <= departure) {
        toast.error("Thời gian đến phải sau thời gian khởi hành");
        return;
      }

      if (formData.price === undefined || formData.price < 0) {
        toast.error("Giá vé không hợp lệ");
        return;
      }

      setSaving(true);

      const dataToSave: any = {
        ...formData,
        id: editingRoute?.id,
        provider_id: formData.provider_id || providers[0]?.id || null,
        vehicle_id: formData.vehicle_id || null,
      };

      if (!dataToSave.provider_id) {
        toast.error("Vui lòng thiết lập hồ sơ nhà cung cấp trong phần 'Cài đặt' trước khi tạo tuyến đường");
        setSaving(false);
        return;
      }

      // Clean up visual and internal fields that shouldn't be in the DB
      const UI_FIELDS = [
        "transport_providers",
        "transport_vehicles",
        "created_at",
        "updated_at",
      ];
      UI_FIELDS.forEach((field) => delete dataToSave[field]);

      // Ensure UUID fields are not empty strings
      if (dataToSave.provider_id === "") dataToSave.provider_id = null;
      if (dataToSave.vehicle_id === "") dataToSave.vehicle_id = null;

      // Ensure dates are valid ISO strings if present
      if (dataToSave.departure_time) {
        dataToSave.departure_time = new Date(dataToSave.departure_time).toISOString();
      }
      if (dataToSave.arrival_time) {
        dataToSave.arrival_time = new Date(dataToSave.arrival_time).toISOString();
      }

      const response = await fetch("/api/partner/transport/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": supabaseUser.id
        },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success(editingRoute ? "Cập nhật tuyến đường thành công" : "Đã tạo tuyến đường mới thành công");

      setShowModal(false);
      setEditingRoute(null);
      setFormData({
        currency: "VND",
        type: "bus",
        vehicle_type: "29 seats",
        seats_available: 29,
      });
      fetchRoutes();
    } catch (error: any) {
      console.error("Error saving route:", error);
      toast.error(`Lỗi khi lưu: ${error.message || "Vui lòng kiểm tra console"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabaseUser) return;
    if (!confirm("Bạn có chắc chắn muốn xóa tuyến đường này?")) return;

    try {
      const response = await fetch(`/api/partner/transport/routes?id=${id}`, {
        method: "DELETE",
        headers: { "x-user-id": supabaseUser.id },
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      toast.success("Đã xóa tuyến đường");
      fetchRoutes();
    } catch (error: any) {
      console.error("Error deleting route:", error);
      toast.error("Lỗi khi xóa tuyến đường: " + error.message);
    }
  };

  const openEditModal = (route: TransportRoute) => {
    // Sync check on edit as well
    if (providers.length === 0) {
      fetchRoutes();
    }

    setEditingRoute(route);
    setFormData({
      ...route,
      // Format datetime for input field
      departure_time: route.departure_time
        ? new Date(route.departure_time).toISOString().slice(0, 16)
        : "",
      arrival_time: route.arrival_time
        ? new Date(route.arrival_time).toISOString().slice(0, 16)
        : "",
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    // Refresh providers if none exist (help sync with Settings)
    if (providers.length === 0) {
      fetchRoutes();
    }

    // If we have providers but no provider_id in formData, default to the first one
    const defaultProviderId = formData.provider_id || providers[0]?.id;

    setEditingRoute(null);
    setFormData({
      currency: "VND",
      type: "bus",
      vehicle_type: "29 seats",
      seats_available: 29,
      provider_id: defaultProviderId,
    });
    setShowModal(true);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " " + currency;
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const diff = new Date(arrival).getTime() - new Date(departure).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
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

  // Handler for selecting a vehicle
  const handleVehicleChange = (vehicleId: string) => {
    const selectedVehicle = vehicles.find((v) => v.id === vehicleId);
    if (selectedVehicle) {
      setFormData({
        ...formData,
        vehicle_id: selectedVehicle.id,
        provider_id: selectedVehicle.provider_id,
        type: selectedVehicle.type,
        vehicle_type: selectedVehicle.model, // Or just use the model name
        seats_available: selectedVehicle.capacity,
        vehicle_details: selectedVehicle.amenities,
      });
    } else {
      setFormData({
        ...formData,
        vehicle_id: undefined,
      });
    }
  };

  // Get unique origins for filter
  const uniqueOrigins = ["all", ...new Set(routes.map((r) => r.origin))];

  const filteredRoutes = routes.filter((route) => {
    const matchesSearch =
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterOrigin === "all" || route.origin === filterOrigin;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Quản lý Tuyến đường
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Tạo và quản lý các tuyến đường vận chuyển
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Tạo tuyến mới
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm điểm đi, điểm đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-slate-400" />
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            {uniqueOrigins.map((origin) => (
              <option key={origin} value={origin}>
                {origin === "all" ? "Tất cả điểm đi" : origin}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : filteredRoutes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Tuyến đường
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Thời gian
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Loại xe
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Giá
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Chỗ trống
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Nhà cung cấp
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRoutes.map((route, index) => (
                  <motion.tr
                    key={route.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                          <MapPin className="w-4 h-4 text-primary" />
                          {route.origin}
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                          {route.destination}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {formatTime(route.departure_time)} -{" "}
                          {formatTime(route.arrival_time)}
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs mt-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(route.departure_time)} •{" "}
                          {calculateDuration(
                            route.departure_time,
                            route.arrival_time,
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                        {getVehicleTypeLabel(route.type)} - {route.vehicle_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-slate-900 dark:text-white font-semibold">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {formatCurrency(route.price, route.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span
                          className={`font-medium ${route.seats_available > 5 ? "text-green-600" : route.seats_available > 0 ? "text-amber-600" : "text-red-600"}`}
                        >
                          {route.seats_available}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        {(route.transport_providers as any)?.name || "N/A"}
                      </div>
                      {route.transport_vehicles && (
                        <div className="text-xs text-slate-500 mt-1">
                          BS: {(route.transport_vehicles as any).plate_number}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(route)}
                          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-primary" />
                        </button>
                        <button
                          onClick={() => handleDelete(route.id)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <RouteIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Chưa có tuyến đường nào
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Bắt đầu bằng cách tạo tuyến đường đầu tiên
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Tạo tuyến mới
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Tổng số tuyến", value: routes.length, icon: RouteIcon },
          {
            label: "Điểm đi",
            value: new Set(routes.map((r) => r.origin)).size,
            icon: MapPin,
          },
          {
            label: "Điểm đến",
            value: new Set(routes.map((r) => r.destination)).size,
            icon: MapPin,
          },
          {
            label: "Tổng chỗ trống",
            value: routes.reduce((sum, r) => sum + r.seats_available, 0),
            icon: Users,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4"
          >
            <div className="p-3 bg-primary/10 rounded-xl">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {stat.label}
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
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
              className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {editingRoute
                    ? "Chỉnh sửa tuyến đường"
                    : "Tạo tuyến đường mới"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {providers.length === 0 && (
                <div className="p-4 mx-6 mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                  <strong>Cảnh báo:</strong> Bạn chưa có hồ sơ nhà cung cấp vận chuyển. Vui lòng tạo hồ sơ trong phần <strong>Cài đặt</strong> trước khi thiết lập tuyến đường.
                </div>
              )}

              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {/* Provider Selection */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    Nhà cung cấp vận chuyển
                  </label>
                  {providers.length > 1 ? (
                    <select
                      value={formData.provider_id || ""}
                      onChange={(e) => setFormData({ ...formData, provider_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    >
                      <option value="">-- Chọn nhà cung cấp --</option>
                      {providers.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  ) : providers.length === 1 ? (
                    <div className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-xl font-bold text-slate-900 dark:text-white">
                      {providers[0].name}
                    </div>
                  ) : (
                    <div className="px-4 py-2.5 bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 rounded-xl font-bold text-red-500">
                      Chưa có hồ sơ nhà cung cấp
                    </div>
                  )}
                </div>

                {/* Route Selection */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Điểm khởi hành
                      </label>
                      <input
                        type="text"
                        value={formData.origin || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, origin: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Điểm đến
                      </label>
                      <input
                        type="text"
                        value={formData.destination || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            destination: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Vehicle Selection */}
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-3">
                    <label className="text-sm font-semibold text-primary">
                      Phân bổ Phương tiện
                    </label>
                    <select
                      value={formData.vehicle_id || ""}
                      onChange={(e) => handleVehicleChange(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border-primary/20 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-700 dark:text-slate-200"
                    >
                      <option value="">-- Chọn phương tiện có sẵn --</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate_number} - {vehicle.model} (
                          {vehicle.capacity} chỗ)
                        </option>
                      ))}
                    </select>
                    {!formData.vehicle_id && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                        * Lưu ý: Nếu không chọn phương tiện từ Fleet, bạn cần
                        nhập thủ công thông tin xe bên dưới.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Thời gian khởi hành
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.departure_time || ""}
                        min={minDateTime}
                        onFocus={updateMinDateTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            departure_time: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formData.departure_time && formData.departure_time < minDateTime ? 'border-red-500 ring-2 ring-red-500/20' : ''
                          }`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Thời gian đến (dự kiến)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.arrival_time || ""}
                        min={formData.departure_time || minDateTime}
                        onFocus={updateMinDateTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            arrival_time: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all ${formData.arrival_time && (formData.arrival_time < (formData.departure_time || minDateTime)) ? 'border-red-500 ring-2 ring-red-500/20' : ''
                          }`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5 flex-1">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex justify-between">
                        <span>Giá vé</span>
                        <span className="text-primary font-bold">
                          {formatCurrency(formData.price || 0, formData.currency)}
                        </span>
                      </label>
                      <input
                        type="number"
                        value={formData.price || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value ? Number(e.target.value) : 0,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Số chỗ (Capacity)
                      </label>
                      <input
                        type="number"
                        value={formData.seats_available || 29}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            seats_available: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tiền tệ
                      </label>
                      <select
                        value={formData.currency || "VND"}
                        onChange={(e) =>
                          setFormData({ ...formData, currency: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Loại hình
                      </label>
                      <select
                        value={formData.type || "bus"}
                        onChange={(e) =>
                          setFormData({ ...formData, type: e.target.value })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      >
                        <option value="bus">Xe buýt / Khách</option>
                        <option value="limousine">Limousine</option>
                        <option value="private_car">Xe riêng</option>
                        <option value="train">Tàu hỏa</option>
                        <option value="airplane">Máy bay</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Chi tiết xe (Nhãn)
                      </label>
                      <input
                        type="text"
                        value={formData.vehicle_type || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            vehicle_type: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
                <p className="text-xs text-slate-500 italic flex-1">
                  Tuyến đường sẽ hiển thị ngay khi được lưu và có hiệu lực theo
                  thời gian khởi hành.
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
                    {editingRoute ? "Cập nhật" : "Tạo tuyến đường"}
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
