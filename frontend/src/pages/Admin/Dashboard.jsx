import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  Users,
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";

/**
 * Dashboard Component
 * Central administrative hub for Menu CRUD, Staff Management, and Analytics.
 */
const Dashboard = () => {
  const navigate = useNavigate();

  // --- State Management ---
  const [tab, setTab] = useState("menu");
  const [staffList, setStaffList] = useState([]);
  const [menuList, setMenuList] = useState([]);
  const [editingMenuId, setEditingMenuId] = useState(null);

  const [analytics, setAnalytics] = useState({
    total_revenue: 0,
    total_orders: 0,
    top_item: "Loading...",
  });

  const [staffFormData, setStaffFormData] = useState({
    username: "",
    password: "",
    name: "",
    phone: "",
    email: "",
    role: "staff",
  });

  const [menuFormData, setMenuFormData] = useState({
    name: "",
    price: "",
    category: "Coffee",
    image: null,
  });

  // --- Initialization ---
  useEffect(() => {
    fetchStaff();
    fetchMenu();
    fetchAnalytics();
  }, []);

  // --- API Methods ---

  const fetchStaff = async () => {
    const token = localStorage.getItem("staffToken");
    const res = await fetch("http://127.0.0.1:5000/api/admin/staff", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setStaffList(data.staff || []);
  };

  const fetchMenu = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/menu");
    const data = await res.json();
    setMenuList(data.menu || []);
  };

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("staffToken");
    const res = await fetch("http://127.0.0.1:5000/api/admin/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setAnalytics(data);
  };

  // --- Menu Handlers ---

  const handleAddOrUpdateMenuItem = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("staffToken");
    const formData = new FormData();
    formData.append("name", menuFormData.name);
    formData.append("price", menuFormData.price);
    formData.append("category", menuFormData.category);
    if (menuFormData.image) formData.append("image", menuFormData.image);

    const url = editingMenuId
      ? `http://127.0.0.1:5000/api/admin/menu/${editingMenuId}`
      : "http://127.0.0.1:5000/api/admin/menu";

    try {
      await fetch(url, {
        method: editingMenuId ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      handleCancelEdit();
      fetchMenu();
    } catch (err) {
      console.error("Menu Update Error:", err);
    }
  };

  const handleEditClick = (item) => {
    setEditingMenuId(item._id);
    setMenuFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      image: null,
    });
  };

  const handleCancelEdit = () => {
    setEditingMenuId(null);
    setMenuFormData({ name: "", price: "", category: "Coffee", image: null });
    if (document.getElementById("image-upload-input"))
      document.getElementById("image-upload-input").value = "";
  };

  const handleDeleteMenuItem = async (id, name) => {
    if (!window.confirm(`Delete ${name} from menu?`)) return;
    const token = localStorage.getItem("staffToken");
    await fetch(`http://127.0.0.1:5000/api/admin/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchMenu();
  };

  // --- Staff Handlers ---

  /** Registers a new staff member */
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("staffToken");
    await fetch("http://127.0.0.1:5000/api/admin/staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(staffFormData),
    });
    setStaffFormData({
      username: "",
      password: "",
      name: "",
      phone: "",
      email: "",
      role: "staff",
    });
    fetchStaff();
  };

  /** Deletes a staff member account */
  const handleDeleteStaff = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${name} from the staff list?`,
      )
    )
      return;
    const token = localStorage.getItem("staffToken");

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/admin/staff/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchStaff(); // Refresh list on success
      } else {
        alert("Could not delete staff member.");
      }
    } catch (err) {
      console.error("Staff Deletion Error:", err);
    }
  };

  const dashboardTabs = [
    {
      key: "analytics",
      label: "Analytics",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    { key: "menu", label: "Menu", icon: <ShoppingBag className="h-4 w-4" /> },
    { key: "staff", label: "Staff", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <LayoutDashboard className="h-8 w-8 text-coffee-accent" />
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-[#d1cbc7]">
          Admin Dashboard
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl bg-white/40 dark:bg-gray-800/40 p-1 mb-8 max-w-md border border-white/50 dark:border-white/5 backdrop-blur-md">
        {dashboardTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-coffee-accent text-white shadow-md"
                : "text-gray-600 dark:text-[#a39c98]"
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Analytics */}
      {tab === "analytics" && (
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          <GlassCard className="p-8 text-center bg-white dark:bg-gray-800">
            <p className="text-gray-500 font-medium mb-2">Total Revenue</p>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              ₹{parseFloat(analytics.total_revenue).toFixed(2)}
            </h2>
          </GlassCard>
          <GlassCard className="p-8 text-center bg-white dark:bg-gray-800">
            <p className="text-gray-500 font-medium mb-2">Total Orders</p>
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white">
              {analytics.total_orders}
            </h2>
          </GlassCard>
          <GlassCard className="p-8 text-center bg-white dark:bg-gray-800">
            <p className="text-gray-500 font-medium mb-2">Top Item</p>
            <h2 className="text-3xl font-bold text-coffee-accent">
              {analytics.top_item}
            </h2>
          </GlassCard>
        </div>
      )}

      {/* Menu Management */}
      {tab === "menu" && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <GlassCard className="p-6 h-fit bg-white dark:bg-gray-800">
            <h2 className="mb-6 font-bold text-lg flex items-center gap-2">
              {editingMenuId ? (
                <Edit2 className="h-5 w-5" />
              ) : (
                <Plus className="h-5 w-5" />
              )}
              {editingMenuId ? "Edit Item" : "Add Item"}
            </h2>
            <form onSubmit={handleAddOrUpdateMenuItem} className="space-y-4">
              <Input
                placeholder="Name"
                value={menuFormData.name}
                onChange={(e) =>
                  setMenuFormData({ ...menuFormData, name: e.target.value })
                }
                required
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Price"
                value={menuFormData.price}
                onChange={(e) =>
                  setMenuFormData({ ...menuFormData, price: e.target.value })
                }
                required
              />
              <select
                value={menuFormData.category}
                onChange={(e) =>
                  setMenuFormData({ ...menuFormData, category: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white"
              >
                <option>Coffee</option>
                <option>Tea</option>
                <option>Food</option>
                <option>Dessert</option>
              </select>
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
                  Photo Upload
                </label>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setMenuFormData({
                      ...menuFormData,
                      image: e.target.files[0],
                    })
                  }
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-coffee-accent file:text-white hover:file:bg-[#9c5a30] transition-all bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  className="flex-1 bg-coffee-accent text-white"
                >
                  {editingMenuId ? "Update" : "Add Item"}
                </Button>
                {editingMenuId && (
                  <Button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-100 dark:bg-white/10"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </GlassCard>

          <GlassCard className="lg:col-span-2 p-6 bg-white dark:bg-gray-800">
            <h2 className="mb-6 font-bold text-lg">Current Menu</h2>
            <div className="space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
              {menuList.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl">
                        ☕
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.category} • ₹{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClick(item)}
                      className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:scale-105 transition"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenuItem(item._id, item.name)}
                      className="p-2.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:scale-105 transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Staff Management */}
      {tab === "staff" && (
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
          <GlassCard className="p-6 h-fit bg-white dark:bg-gray-800">
            <h2 className="mb-6 font-bold text-lg flex items-center gap-2">
              <Plus className="h-5 w-5" /> Add Staff
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-4">
              <Input
                placeholder="Full Name"
                value={staffFormData.name}
                onChange={(e) =>
                  setStaffFormData({ ...staffFormData, name: e.target.value })
                }
                required
              />
              <Input
                placeholder="Username"
                value={staffFormData.username}
                onChange={(e) =>
                  setStaffFormData({
                    ...staffFormData,
                    username: e.target.value,
                  })
                }
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={staffFormData.password}
                onChange={(e) =>
                  setStaffFormData({
                    ...staffFormData,
                    password: e.target.value,
                  })
                }
                required
              />
              <Button
                type="submit"
                className="mt-2 w-full bg-coffee-accent text-white"
              >
                Create Staff Account
              </Button>
            </form>
          </GlassCard>

          <GlassCard className="lg:col-span-2 p-6 bg-white dark:bg-gray-800">
            <h2 className="mb-6 font-bold text-lg">Active Team</h2>
            <div className="space-y-3 max-h-150 overflow-y-auto pr-2 custom-scrollbar">
              {staffList.map((s) => (
                <div
                  key={s._id}
                  className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-white/5"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-coffee-accent/10 flex items-center justify-center font-bold text-coffee-accent uppercase">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white">
                        {s.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        @{s.username}
                      </p>
                    </div>
                  </div>
                  {/* Delete button for staff accounts */}
                  <button
                    onClick={() => handleDeleteStaff(s._id, s.name)}
                    className="p-2.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    title="Remove Staff Member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}
    </PageContainer>
  );
};

export default Dashboard;
