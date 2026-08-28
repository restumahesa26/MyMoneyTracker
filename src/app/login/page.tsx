"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  Wallet,
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  User,
  ShieldCheck,
  TrendingUp,
  PieChart,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const { user, loginWithGoogle, loginWithEmail, registerWithEmail, loginAsGuest, loading } =
    useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await loginWithEmail(email, password);
        toast.success("Berhasil masuk!");
      } else {
        if (!name.trim()) {
          toast.error("Nama lengkap harus diisi");
          setIsSubmitting(false);
          return;
        }
        await registerWithEmail(email, password, name.trim());
        toast.success("Akun baru berhasil dibuat!");
      }
      router.push("/");
    } catch (err: any) {
      console.error("Email auth error:", err);
      if (err.code === "auth/configuration-not-found") {
        toast.error("Konfigurasi Firebase belum ditemukan. Pastikan Environment Variables sudah diatur di Vercel.");
      } else if (err.code === "auth/unauthorized-domain") {
        toast.error("Domain Vercel belum didaftarkan di Firebase Console > Authentication > Settings > Authorized domains.");
      } else if (err.code === "auth/operation-not-allowed") {
        toast.error("Provider Email/Password belum diaktifkan di Firebase Console > Authentication > Sign-in method.");
      } else if (err.code === "auth/email-already-in-use") {
        toast.error("Email ini sudah terdaftar. Silakan pilih tab 'Masuk (Login)'.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        toast.error("Email atau kata sandi yang Anda masukkan salah.");
      } else if (err.code === "auth/weak-password") {
        toast.error("Kata sandi terlalu lemah (minimal 6 karakter).");
      } else {
        toast.error(err.message || "Gagal melakukan autentikasi");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      toast.success("Berhasil masuk dengan Google!");
      router.push("/");
    } catch (err: any) {
      console.error("Google auth error:", err);
      if (err.code === "auth/unauthorized-domain") {
        toast.error("Domain Vercel belum didaftarkan di Firebase Console > Authentication > Settings > Authorized domains.");
      } else if (err.code === "auth/configuration-not-found") {
        toast.error("Konfigurasi Firebase belum lengkap. Pastikan Environment Variables sudah diatur di Vercel.");
      } else if (err.code === "auth/operation-not-allowed") {
        toast.error("Provider Google belum diaktifkan di Firebase Console > Authentication > Sign-in method.");
      } else if (err.code === "auth/popup-closed-by-user") {
        toast.info("Proses login Google dibatalkan.");
      } else {
        toast.error(err.message || "Gagal masuk dengan Google");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoAccess = () => {
    loginAsGuest();
    toast.success("Masuk dalam Mode Demo Tamu!");
    router.push("/");
  };

  const firebaseReady = isFirebaseConfigured();

  return (
    <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow ambient effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 py-8">
        {/* Left Side: Branding & Value Proposition */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Personal Finance Tracker 2026</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Kendalikan Finansial Anda dengan{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                Elegan & Akurat
              </span>
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
              Aplikasi pencatatan keuangan pribadi generasi baru dengan visualisasi arus kas mendalam, pelacakan budget multi-dompet, dan sinkronisasi Cloud Firestore.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200">Arus Kas & Backdate</p>
                <p className="text-[11px] text-slate-400">Pencatatan fleksibel masa lalu</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <PieChart className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-200">Analisis & Budgeting</p>
                <p className="text-[11px] text-slate-400">Monitoring overbudget pintar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
            {/* Brand Logo in Card */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">MyMoneyTracker</h3>
                  <p className="text-[11px] text-slate-400">Masuk untuk memulai</p>
                </div>
              </div>

              {!firebaseReady && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
                  Demo Ready
                </span>
              )}
            </div>

            {/* Instant Demo Access Button (Prominent) */}
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 group"
            >
              <Sparkles className="w-4 h-4 text-emerald-200 group-hover:rotate-12 transition-transform" />
              <span>Coba Mode Demo (Akses Tamu Instan)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="relative flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute bg-slate-900 px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                atau gunakan akun
              </span>
            </div>

            {/* Google Sign-in */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs flex items-center justify-center gap-2.5 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.54 0 2.94.54 4.04 1.44l3.03-3.03C17.24 1.7 14.81 1 12 1 7.37 1 3.44 3.73 1.57 7.73l3.66 2.84C6.1 7.6 8.82 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.68 2.85c2.14-1.98 3.74-4.89 3.74-8.67z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.23 14.57c-.25-.74-.39-1.53-.39-2.35s.14-1.61.39-2.35L1.57 7.03C.57 9.03 0 11.45 0 14s.57 4.97 1.57 6.97l3.66-2.84c-.25-.74-.39-1.53-.39-2.35z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.94-2.91l-3.68-2.85c-1.07.72-2.45 1.16-4.26 1.16-3.18 0-5.9-2.6-6.77-5.57L1.57 16.03C3.44 20.27 7.37 23 12 23z"
                />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </button>

            {/* Email/Password Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === "login"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Masuk (Login)
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`py-1.5 rounded-xl text-xs font-bold transition-all ${
                  mode === "register"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              {mode === "register" && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Memproses..."
                  : mode === "login"
                  ? "Masuk ke Akun"
                  : "Daftar Sekarang"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
