'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import authService from '@/lib/auth-service';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | 'expired'>('pending');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await authService.verifyEmail(verificationToken);
      setStatus('success');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } catch (error) {
      setStatus('error');
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);

    try {
      await authService.resendVerificationEmail();
      setResendSuccess(true);
    } catch (error) {
      console.error('Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(168,85,247,0.08),transparent_50%)]" />
      <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-2xl font-bold text-white">tarsit</span>
        </Link>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-6">
            {status === 'pending' && token && (
              <>
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-purple-400 animate-spin" />
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Verifying Your Email</h1>
                <p className="text-white/50 text-sm">Please wait while we verify your email address...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Email Verified!</h1>
                <p className="text-white/50 text-sm">Your email has been successfully verified. Redirecting you to your dashboard...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Verification Failed</h1>
                <p className="text-white/50 text-sm">We couldn't verify your email. The link may be invalid or expired.</p>
              </>
            )}

            {status === 'expired' && (
              <>
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-amber-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Link Expired</h1>
                <p className="text-white/50 text-sm">Your verification link has expired. Request a new one below.</p>
              </>
            )}

            {!token && status === 'pending' && (
              <>
                <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Mail className="h-8 w-8 text-purple-400" />
                </div>
                <h1 className="text-2xl font-semibold text-white mb-2">Check Your Email</h1>
                <p className="text-white/50 text-sm">We've sent a verification link to your email address. Click the link to verify your account.</p>
              </>
            )}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {!token && status === 'pending' && (
              <>
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-sm text-center text-white/50">
                    Didn't receive the email? Check your spam folder or request a new link.
                  </p>
                </div>

                {resendSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 text-center">
                      Verification email sent! Check your inbox.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleResendEmail}
                  disabled={isResending || resendSuccess}
                  className="w-full h-11 bg-white/5 border border-white/10 text-white rounded-lg font-medium text-sm hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isResending ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : resendSuccess ? (
                    'Email Sent!'
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </>
            )}

            {(status === 'error' || status === 'expired') && (
              <>
                <button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                >
                  {isResending ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Request New Verification Link'
                  )}
                </button>

                {resendSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-sm text-emerald-400 text-center">
                      New verification email sent! Check your inbox.
                    </p>
                  </div>
                )}
              </>
            )}

            {status === 'success' && (
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium text-sm hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25"
                >
                  Go to Dashboard
                </button>
                <p className="text-xs text-center text-white/40">
                  You will be automatically redirected in a few seconds...
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <p className="text-sm text-center text-white/50">
                Need help?{' '}
                <Link href="/contact" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/50">
            <Link href="/" className="hover:text-purple-400 transition-colors">
              ← Back to Home
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
