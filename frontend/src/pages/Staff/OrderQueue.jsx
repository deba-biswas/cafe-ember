import React, { useState, useEffect } from "react";
import { ChefHat, RefreshCw, CheckCircle2, ListFilter } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import StatusBadge from "../../components/ui/StatusBadge";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";
import { io } from "socket.io-client";

// Kitchen workspace for managing live and completed orders
const Queue = () => {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("active"); // "active" or "completed"

  // Fetch all orders from backend
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("staffToken");

      const res = await fetch("http://127.0.0.1:5000/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      } else {
        setError("Failed to load orders");
      }
    } catch {
      setError("Network error connecting to kitchen server");
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchOrders();

    // Establish WebSocket connection for real-time updates
    const socket = io("http://127.0.0.1:5000");

    socket.on("kitchen_update", (data) => {
      console.log("Live Update:", data?.message);
      fetchOrders(); // Refresh orders on update
    });

    // Cleanup on component unmount
    return () => socket.disconnect();
  }, []);

  // Update order status
  const updateStatus = async (id, status) => {
    const token = localStorage.getItem("staffToken");

    try {
      await fetch(`http://127.0.0.1:5000/api/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      // WebSocket will automatically refresh UI
    } catch {
      alert("Status update failed");
    }
  };

  // Filter orders based on selected tab
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "active") {
      return o.status !== "ready" && o.status !== "completed";
    }
    return o.status === "ready" || o.status === "completed";
  });

  return (
    <PageContainer>
      <div className="animate-fade-in max-w-400 mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-coffee-accent/10 rounded-2xl">
              <ChefHat className="h-8 w-8 text-coffee-accent" />
            </div>

            <div>
              <h1 className="text-3xl font-black">Kitchen Workspace</h1>

              <p className="text-gray-500 text-sm">
                Manage live orders and production
              </p>
            </div>
          </div>

          {/* Manual refresh */}
          <button
            onClick={fetchOrders}
            className="p-3 rounded-xl border shadow-sm transition active:scale-95"
            title="Refresh Queue"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 rounded-2xl w-fit mb-8 border">
          <button
            onClick={() => setActiveTab("active")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "active" ? "bg-white shadow-sm" : ""
            }`}
          >
            <ListFilter className="h-4 w-4" />
            Active Queue
            {/* Active orders count */}
            <span className="ml-1 px-2 py-0.5 rounded-md text-xs">
              {orders.filter((o) => o.status !== "ready").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition ${
              activeTab === "completed" ? "bg-white shadow-sm" : ""
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-600 rounded-xl border">
            {error}
          </div>
        )}

        {/* Orders grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredOrders.length === 0 ? (
            // Empty state
            <GlassCard className="col-span-full text-center py-32 border-dashed border-2">
              <ChefHat className="h-16 w-16 mx-auto mb-4 text-gray-300" />

              <p className="text-xl font-bold text-gray-400">
                {activeTab === "active"
                  ? "No active orders. Take a break!"
                  : "No completed orders yet."}
              </p>
            </GlassCard>
          ) : (
            // Orders list
            filteredOrders.map((order) => (
              <GlassCard
                key={order._id}
                className={`p-6 flex flex-col transition-all hover:shadow-xl border-t-4 ${
                  order.status === "preparing"
                    ? "border-t-yellow-500"
                    : "border-t-coffee-accent"
                }`}
              >
                {/* Order header */}
                <div className="flex justify-between items-start mb-6 pb-4 border-b">
                  <div>
                    <span className="text-3xl font-black text-coffee-accent">
                      #{order.order_number || "---"}
                    </span>

                    <h3 className="text-sm font-bold mt-2 uppercase truncate max-w-30">
                      {order.customer_name === "Guest"
                        ? `ID: ${order.phone_number.slice(-4)}`
                        : order.customer_name}
                    </h3>
                  </div>

                  <StatusBadge status={order.status} />
                </div>

                {/* Items list */}
                <ul className="space-y-3 mb-8 grow">
                  {order.items.map((item, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center px-4 py-3 rounded-xl border"
                    >
                      <span>{item.name}</span>

                      <span className="font-bold">{item.quantity}x</span>
                    </li>
                  ))}
                </ul>

                {/* Action buttons */}
                <div className="mt-auto space-y-2">
                  {activeTab === "active" && (
                    <>
                      {order.status === "pending" && (
                        <Button
                          onClick={() => updateStatus(order._id, "preparing")}
                        >
                          Start Preparing
                        </Button>
                      )}

                      {order.status === "preparing" && (
                        <Button
                          onClick={() => updateStatus(order._id, "ready")}
                        >
                          Mark Ready
                        </Button>
                      )}
                    </>
                  )}

                  {/* Recall order back to kitchen */}
                  {activeTab === "completed" && (
                    <Button
                      onClick={() => updateStatus(order._id, "preparing")}
                      variant="secondary"
                    >
                      Recall to Kitchen
                    </Button>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default Queue;
