import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Download, ArrowLeft, Coffee } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import Button from "../../components/ui/Button";
import PageContainer from "../../components/PageContainer";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

// Displays order confirmation and allows downloading a PDF receipt
const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const receiptRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Retrieve order data from navigation state
  const orderData = location.state;

  // Redirect if accessed without valid order data
  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) return null;

  // Generate and download receipt as PDF
  const handleDownloadBill = async () => {
    setIsDownloading(true);

    try {
      const element = receiptRef.current;

      // Convert receipt DOM element to high-quality image
      const imgData = await toPng(element, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });

      // Create PDF document (A5 size)
      const pdf = new jsPDF("p", "mm", "a5");

      const pdfWidth = pdf.internal.pageSize.getWidth();

      // Load image to calculate proper scaling
      const img = new Image();
      img.src = imgData;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const pdfHeight = (img.height * pdfWidth) / img.width;

      // Add image to PDF and save
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Brew_And_Bloom_Order_${orderData.order_number}.pdf`);
    } catch (error) {
      console.error("PDF Error:", error);
      alert("Failed to download bill. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto animate-fade-in">
        {/* Success message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />

          <h1 className="text-3xl font-extrabold">Order Received!</h1>

          <p className="text-gray-500 mt-2">
            The kitchen has started preparing your order.
          </p>
        </div>

        {/* Receipt container (used for PDF generation) */}
        <div
          ref={receiptRef}
          className="bg-white rounded-2xl p-2 mb-8 shadow-sm border"
        >
          <div className="bg-white rounded-3xl p-1 shadow-2xl mb-8">
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-8 shadow-none text-slate-900">
              {/* Header */}
              <div className="text-center border-b border-gray-100 pb-6 mb-6">
                <h2 className="text-xl font-black uppercase flex items-center justify-center gap-2 text-slate-900">
                  <Coffee className="h-5 w-5 text-coffee-accent" /> Café Ember
                </h2>

                <p className="text-sm text-slate-500 font-medium mt-2">
                  {orderData.date}
                </p>

                <p className="text-xs text-slate-400 font-bold mt-1">
                  123 Cafe Street, Berhampore
                </p>
              </div>

              {/* Order info */}
              <div className="text-center mb-8">
                <p className="text-xs uppercase font-black tracking-widest text-slate-400 mb-1">
                  Order Number
                </p>

                <div className="text-6xl font-black text-slate-900 tracking-tighter">
                  #{orderData.order_number}
                </div>

                <p className="text-sm text-slate-500 font-semibold mt-4 bg-slate-50 py-1.5 px-4 rounded-full inline-block">
                  Customer Phone: {orderData.phone_number}
                </p>
              </div>

              {/* Items list */}
              <div className="space-y-4 mb-8">
                {orderData.cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-base font-bold text-slate-700"
                  >
                    <span>
                      <span className="text-coffee-accent mr-2">
                        {item.quantity}x
                      </span>
                      {item.name}
                    </span>

                    <span className="text-slate-900">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-6 border-t border-dashed border-slate-200 mb-8">
                <span className="font-bold text-slate-400 uppercase text-xs tracking-widest">
                  Total Paid
                </span>

                <span className="text-3xl font-black text-coffee-accent">
                  ₹{orderData.total.toFixed(2)}
                </span>
              </div>

              {/* Footer */}
              <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <p>Thank you for choosing Café Ember!</p>
                <p className="mt-1">
                  Please keep this receipt for your order pickup.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {/* Download PDF */}
          <Button onClick={handleDownloadBill} isLoading={isDownloading}>
            <Download className="h-4 w-4" />
            {isDownloading ? "Generating PDF..." : "Download Custom Bill (PDF)"}
          </Button>

          {/* Back to menu */}
          <Button onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" /> Back to Menu
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default OrderSuccess;
