"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import NavigationHeader from '@/components/NavigationHeader'; // Adjust path as needed
import Link from 'next/link';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending_verification' | 'unknown'>('loading');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const razorpay_payment_id = searchParams.get('razorpay_payment_id');
    const razorpay_order_id = searchParams.get('razorpay_order_id');
    const razorpay_signature = searchParams.get('razorpay_signature');

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      setStatus('error');
      setMessage('Payment details missing from URL. Unable to verify payment.');
      // If these are missing, it might be a direct navigation or an issue with Razorpay's redirect.
      // For a direct navigation attempt, we can't do much here without an order ID from somewhere else.
      // It could also be that Razorpay failed before sending these params.
      return;
    }

    setStatus('pending_verification');
    setMessage('Verifying your payment with the server, please wait...');

    const verifyPaymentOnServer = async () => {
      try {
        const response = await fetch('/api/razorpay/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ razorpay_payment_id, razorpay_order_id, razorpay_signature }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus('error');
          setMessage(data.error || 'Failed to verify payment with server.');
          return;
        }

        if (data.success) {
          setStatus('success');
          setMessage(data.message || 'Payment successful! Your account has been upgraded.');
          setTimeout(() => {
            router.push('/dashboard');
          }, 3000);
        } else {
          // Handle cases where verification was done but payment wasn't confirmed by Razorpay (e.g. signature mismatch, already processed)
          setStatus('error');
          setMessage(data.message || 'Payment verification failed. Please contact support.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('An unexpected error occurred while verifying your payment with the server.');
        console.error('Server payment verification error:', err);
      }
    };

    verifyPaymentOnServer();
  }, [searchParams, router]);

  const renderIcon = () => {
    switch (status) {
      case 'loading': // Initial page load before params are checked
      case 'pending_verification': // After params are found, calling backend
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />;
      case 'error':
        return <XCircle className="h-16 w-16 text-red-500" />;
      case 'unknown': // This state might not be actively set now, but kept for robustness
        return <AlertTriangle className="h-16 w-16 text-gray-500" />;
      default:
        return null;
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading': return 'Loading Payment Status...';
      case 'pending_verification': return 'Verifying Your Payment...';
      case 'success': return 'Payment Successful!';
      case 'error': return 'Payment Verification Failed';
      case 'unknown': return 'Payment Status Unknown';
      default: return 'Payment Status';
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0f] text-white selection:bg-blue-500/20 selection:text-blue-200">
      <NavigationHeader />
      <div className="container mx-auto flex flex-col items-center justify-center px-4 py-16 text-center min-h-[calc(100vh-100px)]">
        <div className="mb-8">{renderIcon()}</div>
        <h1 className="text-4xl font-bold mb-4">{getTitle()}</h1>
        <p className="text-lg text-gray-300 mb-8 max-w-md">
          {message || (status === 'loading' ? 'Please wait while we check your payment details.' : ' ')}
        </p>
        {status === 'success' && (
          <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-colors">
            Go to Dashboard
          </Link>
        )}
        {status === 'error' && (
          <Link href="/pricing" className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg text-white font-semibold transition-colors">
            Try Payment Again or Contact Support
          </Link>
        )}
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    // Suspense is required by Next.js for pages that use useSearchParams().
    <Suspense fallback={<div className="flex justify-center items-center h-screen bg-[#0a0a0f] text-white"><Loader2 className="h-12 w-12 animate-spin" /> Loading payment status...</div>}>
      <PaymentStatusContent />
    </Suspense>
  );
} 