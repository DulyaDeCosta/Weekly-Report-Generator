import { type ReactNode } from "react"
import logo from "@/assets/logo.png"

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden p-6 sm:p-8 lg:p-10">
      {/* Background circles */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-900/40 rounded-full blur-2xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-blue-900/30 rounded-full blur-2xl -translate-x-1/4 translate-y-1/4" />
      <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-blue-800/20 rounded-full blur-3xl" />

      {/* Main grid layout */}
      <div className="relative z-10 min-h-[calc(100vh-3rem)] grid lg:grid-cols-2 gap-8">
        {/* Left panel — branding */}
        <div className="hidden lg:flex flex-col text-white p-8">
          {/* Top — logo */}
          <div>
            <img src={logo} alt="Sisenco Digital" className="relative h-16 w-auto left-18 top-25" />
          </div>

          {/* Middle — heading + tagline (vertically centered in remaining space) */}
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-3 -translate-y-16">
            <h1 className="text-5xl font-bold leading-tight tracking-tight">
              Weekly Report Generator
            </h1>
            <p className="text-slate-300 text-lg">
              Track progress. Stay aligned.
            </p>
          </div>

          {/* Bottom — copyright */}
          <div className="absolute inset-x-8 bottom-2 z-10 text-center text-sm text-slate-400">
            © 2026 Sisenco Digital. Built by Dulya De Costa. All rights reserved.
          </div>
        </div>

        {/* Right panel — white card with form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-14 flex flex-col justify-center min-h-[650px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
