import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, FileText, X, Download, Coffee, ArrowLeft } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import StatusBadge from "../../components/ui/StatusBadge";
import PageContainer from "../../components/PageContainer";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// Displays user's order history with receipt preview and PDF download
const History = () => {
  const navigate = useNavigate();

  // Data and UI states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal + receipt states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const receiptRef = useRef(null);

  // Fetch order history on mount
  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem("staffToken");

      // Redirect if user is not authenticated
      if (!token) {
        navigate("/login");
        return;
      }

      const res = await fetch("http://127.0.0.1:5000/api/my-orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  // Generate PDF receipt from selected order
  const handleDownloadBill = async () => {
    setIsDownloading(true);

    try {
      const element = receiptRef.current;

      // Convert receipt DOM to image
      const imgData = await toPng(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // Create PDF document (A5)
      const pdf = new jsPDF("p", "mm", "a5");
      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Load image to calculate aspect ratio
      const img = new Image();
      img.src = imgData;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdfHeight = (img.height * pdfWidth) / img.width;

      // Add image to PDF and save file
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Brew_And_Bloom_Order_${selectedOrder.order_number}.pdf`);
    } catch {
      alert("Failed to download bill.");
    } finally {
      setIsDownloading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto animate-fade-in relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="h-8 w-8 text-coffee-accent" />
            <h1 className="text-3xl font-extrabold">Order History</h1>
          </div>

          {/* Back navigation */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Menu
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-center text-gray-500 mt-10">
            Loading your orders...
          </p>
        ) : orders.length === 0 ? (
          /* Empty state */
          <GlassCard className="text-center py-16">
            <Coffee className="h-16 w-16 mx-auto mb-4 text-gray-300" />

            <h2 className="text-xl font-bold mb-2">No orders yet</h2>

            <p className="text-gray-500 mb-6">
              Looks like you haven't placed any orders.
            </p>

            <Button onClick={() => navigate("/")}>Start an Order</Button>
          </GlassCard>
        ) : (
          /* Orders list */
          <div className="space-y-4">
            {orders.map((order, index) => (
              <GlassCard
                key={index}
                className="p-6 flex flex-col sm:flex-row justify-between items-center gap-4"
              >
                {/* Order details */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl font-black">
                      #{order.order_number}
                    </span>

                    <StatusBadge status={order.status} />
                  </div>

                  <p className="text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </p>

                  <p className="text-sm mt-2">
                    {order.items.length}{" "}
                    {order.items.length === 1 ? "item" : "items"} • ₹
                    {order.total_price.toFixed(2)}
                  </p>
                </div>

                {/* View receipt button */}
                <Button
                  onClick={() => setSelectedOrder(order)}
                  variant="secondary"
                >
                  <FileText className="h-4 w-4" /> View Receipt
                </Button>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Receipt modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-white rounded-3xl w-full max-w-md flex flex-col max-h-[90vh]">
              {/* Modal header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="font-bold text-lg">Receipt</h3>

                <button onClick={() => setSelectedOrder(null)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Receipt content (PDF target) */}
              <div className="p-6 overflow-y-auto">
                <div ref={receiptRef} className="bg-white p-4 border">
                  <div className="text-center mb-4">
                    <Coffee className="h-5 w-5 mx-auto" />
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>

                  <div className="text-center mb-4">
                    #{selectedOrder.order_number}
                  </div>

                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between mt-4 font-bold">
                    <span>Total</span>
                    <span>₹{selectedOrder.total_price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-4 border-t">
                <Button onClick={handleDownloadBill} isLoading={isDownloading}>
                  <Download className="h-4 w-4" />
                  {isDownloading ? "Generating PDF..." : "Download PDF Bill"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default History;
