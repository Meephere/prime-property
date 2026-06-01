"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Key, Database, HelpCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console
    console.error("Root Application Level Crash:", error);
  }, [error]);

  const isClerkKeyError = error.message?.includes("Clerk") || error.message?.includes("publishableKey");
  const isDbError = error.message?.includes("Prisma") || error.message?.includes("Pool") || error.message?.includes("database");

  return (
    <html lang="id">
      <head>
        <title>Prime Property - Gangguan Sistem</title>
        <style>{`
          body {
            background-color: #111111;
            color: #d4d4d8;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          .glass-card {
            background: rgba(26, 26, 26, 0.7);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(201, 169, 97, 0.2);
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(201, 169, 97, 0.05);
          }
          .icon-container {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 50%;
            margin-bottom: 20px;
            color: #ef4444;
          }
          h1 {
            color: #ffffff;
            font-size: 20px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin: 0 0 10px 0;
          }
          h2 {
            color: #c9a961;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.15em;
            margin: 0 0 20px 0;
            font-weight: 600;
          }
          p {
            font-size: 13px;
            line-height: 1.6;
            color: #a1a1aa;
            margin-bottom: 30px;
          }
          .error-box {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid rgba(255, 255, 255, 0.05);
            padding: 15px;
            font-family: monospace;
            font-size: 11px;
            color: #f43f5e;
            text-align: left;
            overflow-x: auto;
            margin-bottom: 30px;
            max-height: 100px;
          }
          .guide-box {
            background: rgba(201, 169, 97, 0.03);
            border: 1px dashed rgba(201, 169, 97, 0.2);
            padding: 15px;
            text-align: left;
            margin-bottom: 30px;
          }
          .guide-title {
            color: #c9a961;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
          }
          .guide-item {
            font-size: 12px;
            color: #d4d4d8;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
          }
          .btn {
            background: #c9a961;
            color: #111111;
            border: none;
            padding: 12px 24px;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            cursor: pointer;
            transition: background 0.2s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }
          .btn:hover {
            background: #bca055;
          }
          .btn-icon {
            margin-right: 8px;
            width: 14px;
            height: 14px;
          }
        `}</style>
      </head>
      <body>
        <div className="glass-card">
          <div className="icon-container">
            <AlertTriangle size={32} />
          </div>
          <h1>GANGGUAN KONFIGURASI</h1>
          <h2>Prime Property Portal</h2>
          
          <p>
            Aplikasi mengalami kendala inisialisasi di server Vercel. 
            Hal ini umumnya disebabkan oleh variabel lingkungan (*Environment Variables*) yang belum lengkap di dashboard Vercel.
          </p>

          <div className="error-box">
            {error.message || "Error: Unknown execution fault."}
          </div>

          <div className="guide-box">
            <div className="guide-title">
              <HelpCircle size={14} style={{ marginRight: "6px" }} />
              Petunjuk Penyelesaian:
            </div>
            
            {isClerkKeyError && (
              <>
                <div className="guide-item" style={{ color: "#f59e0b" }}>
                  <Key size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
                  Pastikan Clerk Keys diisi di Vercel:
                </div>
                <div style={{ paddingLeft: "22px", fontSize: "11px", color: "#a1a1aa", marginBottom: "10px" }}>
                  Tambahkan <b>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</b> dan <b>CLERK_SECRET_KEY</b> di Vercel Dashboard &rarr; Settings &rarr; Environment Variables.
                </div>
              </>
            )}

            {isDbError && (
              <>
                <div className="guide-item" style={{ color: "#3b82f6" }}>
                  <Database size={14} style={{ marginRight: "8px", flexShrink: 0 }} />
                  Pastikan Database Supabase Terhubung:
                </div>
                <div style={{ paddingLeft: "22px", fontSize: "11px", color: "#a1a1aa" }}>
                  Tambahkan <b>DATABASE_URL</b> dan <b>DIRECT_URL</b> dengan connection string PostgreSQL dari dashboard Supabase Anda.
                </div>
              </>
            )}

            {!isClerkKeyError && !isDbError && (
              <div className="guide-item">
                Buka Vercel Dashboard -&gt; Project -&gt; Logs untuk melihat detail log pengecualian (*runtime exception logs*) selengkapnya.
              </div>
            )}
          </div>

          <button className="btn" onClick={() => reset()}>
            <RefreshCw className="btn-icon" />
            Muat Ulang Halaman
          </button>
        </div>
      </body>
    </html>
  );
}
