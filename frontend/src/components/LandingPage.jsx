import { useState } from 'react';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Sandbox',
    desc: 'Spin up an isolated dev environment in seconds with zero config.',
  },
  {
    icon: '🤖',
    title: 'AI Code Generation',
    desc: 'Chat with AI to generate, modify, and iterate on your frontend code.',
  },
  {
    icon: '🖥',
    title: 'Live Preview',
    desc: 'See your changes reflected in real-time with hot module reloading.',
  },
  {
    icon: '💻',
    title: 'Full Terminal',
    desc: 'Direct terminal access to run commands, install packages, and more.',
  },
];

export default function LandingPage({ onStart, isStarting, error }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background layers */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(124,92,252,0.18) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(91,138,245,0.10) 0%, transparent 70%), #0a0b0f',
        }}
      />
      {/* Animated grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-3xl">
        {/* Badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(124,92,252,0.12)',
            border: '1px solid rgba(124,92,252,0.3)',
            color: '#a78bfa',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#22d3a5] animate-pulse inline-block" />
          AI-Powered Development Environment
        </div>

        {/* Heading */}
        <h1
          className="text-6xl font-bold tracking-tight mb-4 leading-[1.1]"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <span className="gradient-text">Novix</span>
          <br />
          <span style={{ color: 'var(--text-1)', fontSize: '2.8rem', fontWeight: 500 }}>
            Your AI Sandbox
          </span>
        </h1>

        <p
          className="text-lg mb-12 leading-relaxed max-w-xl"
          style={{ color: 'var(--text-2)' }}
        >
          Launch a fully isolated development environment, chat with AI to build your
          frontend, and ship faster — all from the browser.
        </p>

        {/* CTA */}
        <button
          id="start-sandbox-btn"
          onClick={onStart}
          disabled={isStarting}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="relative flex items-center gap-3 px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 select-none disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: isStarting
              ? 'rgba(124,92,252,0.4)'
              : hovered
              ? 'linear-gradient(135deg, #8b6dff 0%, #6b8fff 100%)'
              : 'linear-gradient(135deg, #7c5cfc 0%, #5b8af5 100%)',
            color: '#fff',
            boxShadow: hovered && !isStarting
              ? '0 0 40px rgba(124,92,252,0.5), 0 8px 32px rgba(124,92,252,0.3)'
              : '0 4px 24px rgba(124,92,252,0.25)',
            transform: hovered && !isStarting ? 'translateY(-2px)' : 'translateY(0)',
          }}
        >
          {isStarting ? (
            <>
              <span
                className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"
              />
              Starting Sandbox…
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Start Sandbox
            </>
          )}
        </button>

        {error && (
          <div
            className="mt-4 px-4 py-2 rounded-lg text-sm"
            style={{
              background: 'rgba(248,113,113,0.1)',
              border: '1px solid rgba(248,113,113,0.3)',
              color: '#f87171',
            }}
          >
            {error}
          </div>
        )}

        {/* Feature grid */}
        <div className="mt-20 grid grid-cols-2 gap-4 w-full max-w-2xl">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="glass rounded-xl p-5 text-left transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-1)' }}>
                {f.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
