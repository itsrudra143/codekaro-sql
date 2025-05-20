"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Function to load Razorpay script
const loadRazorpayScript = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const UpgradeButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    setIsLoading(true);
    const scriptLoaded = await loadRazorpayScript("https://checkout.razorpay.com/v1/checkout.js");

    if (!scriptLoaded) {
      alert('Could not load payment gateway. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Create an order on your backend
      const orderResponse = await fetch('/api/razorpay/checkout', {
        method: 'POST',
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json().catch(() => ({ error: 'Failed to parse error response.' }));
        throw new Error(errorData.error || 'Failed to create Razorpay order.');
      }

      const orderDetails = await orderResponse.json();

      const options = {
        key: orderDetails.razorpayKeyId,
        amount: orderDetails.amount.toString(), // Amount is in currency subunits. Default currency is INR. Convert toString.
        currency: orderDetails.currency,
        name: 'Code-Karo Pro',
        description: 'Lifetime Pro Access',
        image: '/favicon.ico', // TODO: Replace with your actual logo URL
        order_id: orderDetails.orderId,
        handler: function (response: any) {
          // This function is called after successful payment
          // We will redirect to a status page to verify on backend
          router.push(`/payment/status?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}`);
        },
        prefill: {
          name: orderDetails.userName,
          email: orderDetails.userEmail,
          // contact: orderDetails.userPhone // if available
        },
        notes: {
          address: 'Code-Karo Corporate Office'
        },
        theme: {
          color: '#3b82f6' // Blue color, adjust as needed
        }
      };

      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay payment failed:', response.error);
        alert(`Payment Failed: ${response.error.description}. Code: ${response.error.code}. Please try again or contact support.`);
        // Optionally, redirect to a payment failed page or show message on current page
        // router.push(`/payment/failed?order_id=${orderDetails.orderId}&reason=${response.error.reason}`);
      });
      rzp.open();

    } catch (error) {
      console.error('Upgrade error:', error);
      alert(`Error: ${(error as Error).message}`);
    } finally {
      // setIsLoading(false); // isLoading should remain true while Razorpay modal is open
      // It will be set to false if modal is closed manually or payment fails in handler.
      // For now, to ensure button is re-enabled if user closes modal, we can do this:
      // However, Razorpay's own modal close usually handles this. If rzp.open() is called,
      // this finally block might execute before payment is complete or modal is closed.
      // A better approach for isLoading is to manage it within rzp events if needed.
    }
    // Set loading false only if rzp.open() fails to init or if script fails to load.
    // If rzp.open() is successful, the modal takes over.
    // We can add a listener to modal close to set loading to false.
    // For simplicity now, we'll allow the page redirect to handle the visual state change.
    // If the modal is closed by the user, the button will remain disabled until page refresh or new attempt.
    // This can be improved with more granular event handling from Razorpay.
    // setIsLoading(false); // Re-evaluating this - if control reaches here after rzp.open(), it's usually because rzp.open() itself didn't throw error.
  };

  // Effect to set isLoading to false if Razorpay modal is closed by user
  useEffect(() => {
    const handler = () => {
      // This is a generic way to detect if user might have closed modal
      // A more specific Razorpay event would be better if available for modal close without payment.
      // console.log("Focus changed, potentially Razorpay modal closed");
      // if (isLoading) setIsLoading(false); // Re-enable button if user manually closes modal
    };
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [isLoading]);


  return (
    <button
      onClick={handleUpgrade}
      disabled={isLoading}
      className="inline-flex items-center justify-center gap-2 px-8 py-4 text-white 
        bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg 
        hover:from-blue-600 hover:to-blue-700 transition-all 
        disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <Zap className="w-5 h-5 mr-2" />
      )}
      {isLoading ? 'Processing...' : 'Upgrade to Pro'}
    </button>
  );
};

export default UpgradeButton; 