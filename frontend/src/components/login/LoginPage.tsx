import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Lock, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { useNavigate } from 'react-router-dom';

// Logo UNAIR dari Wikimedia Commons
const UNAIR_LOGO_URL =
  'https://arsip.unair.ac.id/wp-content/uploads/2019/01/logo-unair.png';

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState('');
  const [logoError, setLogoError] = useState(false);
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(nip, password);

      if (result.role === "pimpinan") {
        navigate("/pimpinan/overview");
      } else if (result.role === "admin") {
        navigate("/admin/overview");
      } else {
        navigate("/pegawai/overview");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .kp-page {
          display: flex;
          width: 100vw;
          min-height: 100vh;
          font-family: inherit;
        }

        /* ── LEFT PANEL ── */
        .kp-left {
          flex: 1;
          background: linear-gradient(145deg, #1a3a6b 0%, #1e4fa0 40%, #1565c0 70%, #0d47a1 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(32px, 5vw, 60px);
          position: relative;
          overflow: hidden;
        }
        .kp-left::before {
          content: '';
          position: absolute; top: -100px; right: -100px;
          width: 420px; height: 420px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%; pointer-events: none;
        }
        .kp-left::after {
          content: '';
          position: absolute; bottom: -80px; left: -80px;
          width: 320px; height: 320px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%; pointer-events: none;
        }
        .kp-deco {
          position: absolute; bottom: 0; left: 0;
          width: 100%; opacity: 0.07; pointer-events: none;
        }

        /* Logo area */
        .kp-logo {
          display: flex; align-items: center; gap: 14px;
          position: relative; z-index: 1;
        }
        .kp-logo-img {
          width: 52px; height: 52px; flex-shrink: 0;
          object-fit: contain;
        //   /* background putih bulat supaya logo terbaca di atas biru */
        //   background: white;
        //   border-radius: 50%;
        //   padding: 4px;
        }
        .kp-logo-fallback {
          width: 52px; height: 52px; flex-shrink: 0;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 13px; font-weight: 600;
          letter-spacing: 0.5px;
        }
        .kp-brand {
          font-size: clamp(18px, 2vw, 22px);
          font-weight: 600; color: white; line-height: 1;
          letter-spacing: -0.2px;
        }
        .kp-brand-sub {
          font-size: 11px; font-weight: 400;
          color: rgba(255,255,255,0.6);
          letter-spacing: 1.5px; text-transform: uppercase; margin-top: 4px;
        }

        /* Hero */
        .kp-hero { position: relative; z-index: 1; }
        .kp-hero-h {
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 600; color: white; line-height: 1.2;
          letter-spacing: -0.5px; margin-bottom: 16px;
        }
        .kp-hero-p {
          font-size: clamp(13px, 1.1vw, 15px);
          font-weight: 400; color: rgba(255,255,255,0.65);
          line-height: 1.75; max-width: 380px; margin-bottom: 36px;
        }
        .kp-stats { display: flex; gap: clamp(20px, 3vw, 40px); flex-wrap: wrap; }
        .kp-stat { border-left: 2px solid rgba(255,255,255,0.2); padding-left: 14px; }
        .kp-stat-val {
          font-size: clamp(22px, 2.2vw, 28px);
          font-weight: 600; color: white; line-height: 1;
        }
        .kp-stat-lbl {
          font-size: 11px; font-weight: 400;
          color: rgba(255,255,255,0.5); margin-top: 4px;
        }
        .kp-footer {
          font-size: 12px; color: rgba(255,255,255,0.3);
          position: relative; z-index: 1;
        }

        /* ── RIGHT PANEL ── */
        .kp-right {
          width: clamp(340px, 40vw, 520px);
          background: #f8f9fc;
          display: flex; align-items: center; justify-content: center;
          padding: clamp(32px, 4vw, 56px) clamp(24px, 4vw, 56px);
          position: relative; flex-shrink: 0;
        }
        .kp-right::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 1px; height: 100%;
          background: linear-gradient(to bottom, transparent, #d0d8ee, transparent);
        }

        .kp-form-wrap { width: 100%; max-width: 380px; }

        /* Form header */
        .kp-right-logo {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 28px;
        }
        .kp-right-logo-img {
          width: 40px; height: 40px;
          object-fit: contain;
        }
        .kp-right-logo-fallback {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #1e4fa0, #0d47a1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 11px; font-weight: 700;
        }
        .kp-right-brand {
          font-size: 15px; font-weight: 600; color: #1a1f36; line-height: 1;
        }
        .kp-right-brand-sub {
          font-size: 11px; color: #6b7280; margin-top: 3px;
        }

        .kp-greeting {
          font-size: 11px; font-weight: 500; color: #2563eb;
          letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;
        }
        .kp-form-h {
          font-size: clamp(22px, 2.2vw, 28px);
          font-weight: 600; color: #111827;
          line-height: 1.25; letter-spacing: -0.3px; margin-bottom: 10px;
        }
        .kp-divider {
          width: 36px; height: 3px;
          background: linear-gradient(to right, #2563eb, #60a5fa);
          border-radius: 2px; margin-bottom: 14px;
        }
        .kp-subtitle {
          font-size: 14px; font-weight: 400;
          color: #6b7280; line-height: 1.65; margin-bottom: 28px;
        }

        /* Inputs */
        .kp-field { margin-bottom: 18px; }
        .kp-label {
          display: block; font-size: 12px; font-weight: 500;
          color: #374151; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 7px;
        }
        .kp-input-wrap { position: relative; }
        .kp-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: #9ca3af; pointer-events: none; display: flex; align-items: center;
        }
        .kp-input {
          width: 100%; padding: 12px 42px;
          background: white; border: 1px solid #e5e7eb; border-radius: 8px;
          font-size: 14px; font-family: inherit; color: #111827;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        }
        .kp-input:focus {
          border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
        }
        .kp-input::placeholder { color: #c4cad4; }
        .kp-eye {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; display: flex; align-items: center; transition: color 0.15s;
        }
        .kp-eye:hover { color: #2563eb; }

        .kp-row {
          display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px;
        }
        .kp-remember { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .kp-remember input { width: 15px; height: 15px; accent-color: #2563eb; cursor: pointer; }
        .kp-remember span { font-size: 13px; color: #6b7280; }
        .kp-forgot { font-size: 13px; color: #2563eb; font-weight: 500; text-decoration: none; }
        .kp-forgot:hover { text-decoration: underline; }

        /* Submit button */
        .kp-submit {
          width: 100%; padding: 12px;
          background: #1d4ed8; color: white;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 500; font-family: inherit;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(29,78,216,0.3);
          transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        }
        .kp-submit:hover:not(:disabled) {
          background: #1e40af; transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0,0,0,0.12), 0 6px 18px rgba(29,78,216,0.35);
        }
        .kp-submit:active:not(:disabled) { transform: translateY(0); }
        .kp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .kp-spinner {
          width: 15px; height: 15px;
          border: 2px solid rgba(255,255,255,0.35); border-top-color: white;
          border-radius: 50%; animation: kp-spin 0.65s linear infinite;
        }
        @keyframes kp-spin { to { transform: rotate(360deg); } }

        .kp-note {
          text-align: center; font-size: 12px; color: #9ca3af;
          line-height: 1.7; margin-top: 24px;
        }
        .kp-note a { color: #2563eb; font-weight: 500; text-decoration: none; }
        .kp-note a:hover { text-decoration: underline; }

        .kp-fade { animation: kp-up 0.4s ease both; }
        @keyframes kp-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .kp-page { flex-direction: column; }
          .kp-left {
            flex: none; min-height: 200px;
            padding: 28px 24px;
            justify-content: flex-start; gap: 20px;
          }
          .kp-hero-p { display: none; }
          .kp-footer { display: none; }
          .kp-right { width: 100%; flex: 1; padding: 32px 24px; }
          .kp-right::before { display: none; }
          /* sembunyikan logo duplikat di right panel saat mobile karena sudah ada di left */
          .kp-right-logo { display: none; }
        }
        @media (max-width: 480px) {
          .kp-form-wrap { max-width: 100%; }
        }
      `}</style>

      <div className="kp-page">

        {/* ── LEFT ── */}
        <div className="kp-left">
          <svg className="kp-deco" viewBox="0 0 400 300" fill="none" preserveAspectRatio="xMidYMax meet">
            <circle cx="200" cy="400" r="300" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="400" r="220" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="400" r="140" stroke="white" strokeWidth="1"/>
          </svg>

          {/* Logo */}
          <div className="kp-logo">
            {!logoError ? (
              <img
                src={UNAIR_LOGO_URL}
                alt="Logo Universitas Airlangga"
                className="kp-logo-img"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="kp-logo-fallback">UA</div>
            )}
            <div>
              <div className="kp-brand">Karisma PUA</div>
              <div className="kp-brand-sub">Universitas Airlangga</div>
            </div>
          </div>

          {/* Hero */}
          <div className="kp-hero">
            <h2 className="kp-hero-h">
              Karier, Administrasi, dan Monitoring Kinerja<br />
              <span style={{ color: '#93c5fd' }}>Perpustakaan Universitas Airlangga</span>
            </h2>
            <p className="kp-hero-p">
              Platform terintegrasi untuk administrasi kepegawaian, monitoring kinerja, dan manajemen karier staf perpustakaan Universitas Airlangga.
            </p>
            <div className="kp-stats">
              {[
                { value: '99%', label: 'Uptime Sistem' },
                { value: '28',     label: 'Staf Aktif'      },
                { value: '26',     label: 'Unit Layanan'    },
              ].map(({ value, label }) => (
                <div className="kp-stat" key={label}>
                  <div className="kp-stat-val">{value}</div>
                  <div className="kp-stat-lbl">{label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="kp-footer">© 2026 Perpustakaan Universitas Airlangga · Surabaya</p>
        </div>

        {/* ── RIGHT ── */}
        <div className="kp-right">
          <div className="kp-form-wrap kp-fade">

            {/* Logo kecil di panel kanan (desktop only)
            <div className="kp-right-logo">
              {!logoError ? (
                <img
                  src={UNAIR_LOGO_URL}
                  alt="Logo Universitas Airlangga"
                  className="kp-right-logo-img"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="kp-right-logo-fallback">UA</div>
              )}
              <div>
                <div className="kp-right-brand">Karisma PUA</div>
                <div className="kp-right-brand-sub">Universitas Airlangga</div>
              </div>
            </div> */}

            <p className="kp-greeting">Selamat Datang</p>
            <h1 className="kp-form-h">Masuk ke Akun Anda</h1>
            <div className="kp-divider" />
            <p className="kp-subtitle">
              Gunakan kredensial UNAIR Anda untuk mengakses sistem Karisma PUA.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="kp-field">
                <label className="kp-label">NIP</label>
                <div className="kp-input-wrap">
                    <span className="kp-icon"><User size={15} /></span>
                    <input
                    type="text"
                    className="kp-input"
                    placeholder="Nomor Induk Pegawai"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    required
                    />
                </div>
                </div>

              <div className="kp-field">
                <label className="kp-label">Kata Sandi</label>
                <div className="kp-input-wrap">
                  <span className="kp-icon"><Lock size={15} /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="kp-input"
                    placeholder="Masukkan kata sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="kp-eye"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="kp-row">
                <label className="kp-remember">
                  <input type="checkbox" />
                  <span>Ingat saya</span>
                </label>
                <a href="#" className="kp-forgot">Lupa kata sandi?</a>
              </div>

              <button type="submit" className="kp-submit" disabled={loading}>
                {loading
                  ? <><div className="kp-spinner" />Memproses...</>
                  : <>Masuk <ArrowRight size={15} /></>
                }
              </button>
              {error && (
                <p style={{ color: "red", marginTop: "10px", fontSize: "13px" }}>
                  {error}
                </p>
              )}
            </form>

            <p className="kp-note">
              Butuh bantuan? Hubungi{' '}
              <a href="mailto:library@lib.unair.ac.id">perpustakaan@unair.ac.id</a>
            </p>

          </div>
        </div>

      </div>
    </>
  );
}

export default LoginPage;