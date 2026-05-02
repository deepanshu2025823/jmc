export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#f9f5f0] flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">

        {/* Logo / Brand */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-widest text-[#4a3728] uppercase">
            JMC
          </h1>
          <p className="text-sm tracking-[0.3em] text-[#9b8579] uppercase mt-1">
            Skin Secrets
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#d4b89e]" />
          <span className="text-[#d4b89e] text-lg">✦</span>
          <div className="flex-1 h-px bg-[#d4b89e]" />
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#4a3728] mb-3">
            Website Under Maintenance
          </h2>
          <p className="text-[#7a6559] leading-relaxed">
            We are currently working on improvements to bring you a better experience.
            We&apos;ll be back shortly. Thank you for your patience.
          </p>
        </div>

        {/* Contact Box */}
        <div className="bg-white border border-[#e8d9cc] rounded-2xl px-8 py-6 shadow-sm">
          <p className="text-xs tracking-[0.2em] text-[#9b8579] uppercase font-medium mb-4">
            For Inquiries, Contact
          </p>

          <p className="text-lg font-semibold text-[#4a3728] mb-1">
            Deepanshu Joshi
          </p>

          <a
            href="tel:+918368436412"
            className="inline-flex items-center gap-2 text-[#7a6559] hover:text-[#4a3728] transition-colors font-medium text-base"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.18 2 2 0 0 1 3.62 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            (+91) 8368436412
          </a>
        </div>

        {/* Footer note */}
        <p className="text-xs text-[#b8a89a] mt-8 tracking-wide">
          © {new Date().getFullYear()} JMC Skin Secrets. All rights reserved.
        </p>
      </div>
    </div>
  );
}
