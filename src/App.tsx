import React, { useState, useEffect, useRef } from 'react';

interface LedgerItem {
  date: string;
  action: string;
  invested: string;
  withdrawn: string;
  fee: string;
  status: string;
  statusColor: string;
}

const HISTORY_DATA: LedgerItem[] = [
  {
    date: 'Mar 8, 2019',
    action: 'Initial Deposit',
    invested: '$5,000.00',
    withdrawn: '$11,750.00',
    fee: '$1,586.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Oct 29, 2019',
    action: 'Reinvestment',
    invested: '$4,000.00',
    withdrawn: '$12,000.00',
    fee: '$1,264.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Jan 6, 2020',
    action: 'Deposit',
    invested: '$500.00',
    withdrawn: '$2,000.00',
    fee: '$300.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Jul 14, 2020',
    action: 'Deposit',
    invested: '$7,000.00',
    withdrawn: '$16,000.00',
    fee: '$2,000.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Feb 10, 2021',
    action: 'Deposit',
    invested: '$1,000.00',
    withdrawn: '$4,000.00',
    fee: '$700.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Sep 20, 2021',
    action: 'Deposit',
    invested: '$10,000.00',
    withdrawn: '$31,000.00',
    fee: '$3,900.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Jan 5, 2022',
    action: 'Deposit',
    invested: '$6,000.00',
    withdrawn: '$14,000.00',
    fee: '$1,800.00',
    status: 'Completed',
    statusColor: 'var(--green)'
  },
  {
    date: 'Apr 12 / Jul 7, 2022',
    action: 'Reinvested Yield',
    invested: '$4,000.00 (Profit: $12k)',
    withdrawn: 'Reinvested',
    fee: '-',
    status: 'Rolled Over',
    statusColor: '#38bdf8'
  }
];

export const App: React.FC = () => {
  // Hash Routing: 'login' | 'dashboard' | 'withdraw'
  const [currentRoute, setCurrentRoute] = useState<'login' | 'dashboard' | 'withdraw'>('login');

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return (
        sessionStorage.getItem('btn_authenticated') === 'true' ||
        localStorage.getItem('btn_authenticated') === 'true'
      );
    } catch {
      return false;
    }
  });

  // Login form inputs
  const [email, setEmail] = useState<string>(() => {
    try {
      return localStorage.getItem('btn_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [loginStepText, setLoginStepText] = useState<string>('Sign In to Dashboard');

  // Dashboard state
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletError, setWalletError] = useState<string | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('47986');
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState<boolean>(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState<boolean>(false);
  const [modalRequestedAmount, setModalRequestedAmount] = useState<string>('$47,986.00');
  const [modalTargetWallet, setModalTargetWallet] = useState<string>('');

  // Simulation modal state
  const [showSimulationModal, setShowSimulationModal] = useState<boolean>(false);

  const directWithdrawSectionRef = useRef<HTMLElement>(null);
  const walletInputRef = useRef<HTMLInputElement>(null);

  // Sync route on hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
      if (hash === 'dashboard') {
        setCurrentRoute('dashboard');
        document.title = 'bit Trade net - Client Dashboard';
      } else if (hash === 'withdraw' || hash === 'paytowithdraw') {
        setCurrentRoute('withdraw');
        document.title = 'bit Trade net - Withdrawal Authorization';
      } else {
        setCurrentRoute('login');
        document.title = 'bit Trade net - Secure Portal Login';
        if (window.location.hash !== '#login') {
          history.replaceState(null, '', '#login');
        }
      }
      window.scrollTo(0, 0);
    };

    // Initial check
    const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');
    if (!hash) {
      if (isAuthenticated) {
        window.location.replace('#dashboard');
      } else {
        window.location.replace('#login');
      }
    } else {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Keyboard shortcut Alt+A to autofill
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && (e.key === 'a' || e.key === 'A')) || (e.ctrlKey && e.shiftKey && (e.key === 'L' || e.key === 'l'))) {
        e.preventDefault();
        autofillCredentials();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const autofillCredentials = () => {
    setEmail('Berginjoshua1@gmail.com');
    setPassword('Thatguy12@');
    setLoginError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password;

    const isEmailMatch = cleanEmail === 'berginjoshua1@gmail.com';
    const isPassMatch = cleanPass === 'Thatguy12@' || cleanPass === 'Thatguy@12';

    if (isEmailMatch && isPassMatch) {
      setLoginError(null);
      setIsLoggingIn(true);
      setLoginStepText('Verifying Credentials...');

      // Ensure hash is explicitly #login
      if (window.location.hash !== '#login') {
        window.location.hash = '#login';
      }

      if (rememberMe) {
        try {
          localStorage.setItem('btn_remembered_email', email.trim());
          localStorage.setItem('btn_authenticated', 'true');
          localStorage.setItem('btn_user', 'Joshua James Bergin');
          localStorage.setItem('btn_email', 'Berginjoshua1@gmail.com');
        } catch {}
      } else {
        try {
          localStorage.removeItem('btn_remembered_email');
          localStorage.removeItem('btn_authenticated');
          localStorage.removeItem('btn_user');
          localStorage.removeItem('btn_email');
        } catch {}
      }

      try {
        sessionStorage.setItem('btn_authenticated', 'true');
        sessionStorage.setItem('btn_user', 'Joshua James Bergin');
        sessionStorage.setItem('btn_email', 'Berginjoshua1@gmail.com');
      } catch {}

      setIsAuthenticated(true);

      setTimeout(() => {
        setLoginStepText('Authorizing & Redirecting...');
      }, 350);

      // Transitions hash directly to /#dashboard
      setTimeout(() => {
        setIsLoggingIn(false);
        setLoginStepText('Sign In to Dashboard');
        window.location.hash = '#dashboard';
      }, 650);
    } else {
      if (!cleanEmail || !cleanPass) {
        setLoginError('Please enter both your email address and password.');
      } else {
        setLoginError('Invalid email or password. Access is restricted to authorized accounts.');
      }
    }
  };

  const handleSignOut = () => {
    try {
      sessionStorage.clear();
      localStorage.removeItem('btn_authenticated');
      localStorage.removeItem('btn_user');
      localStorage.removeItem('btn_email');
    } catch {}
    setIsAuthenticated(false);
    setPassword('');
    window.location.hash = '#login';
  };

  const handleDirectWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWallet = walletAddress.trim();
    if (!cleanWallet) {
      setWalletError('Please enter a destination digital wallet address.');
      walletInputRef.current?.focus();
      return;
    }
    setWalletError(null);

    setIsProcessingWithdraw(true);

    setTimeout(() => {
      setIsProcessingWithdraw(false);
      const parsedAmount = parseFloat(withdrawAmount);
      setModalRequestedAmount(
        isNaN(parsedAmount)
          ? '$47,986.00'
          : `$${parsedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      );
      setModalTargetWallet(cleanWallet);
      setShowWithdrawalModal(true);
    }, 850);
  };

  const scrollToWithdrawal = () => {
    if (directWithdrawSectionRef.current) {
      directWithdrawSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      walletInputRef.current?.focus();
    }
  };

  return (
    <>
      {/* Background Decorative Grid */}
      <div className="bg-grid" aria-hidden="true" />

      {/* Real-Time Crypto Ticker Tape */}
      <aside className="ticker-bar" aria-label="Market Data Stream">
        <div className="ticker-track">
          <div className="ticker-badge-live">
            <span className="pulse-dot" />
            <span>MARKETS LIVE</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">BTC/USD</span>
            <span>$89,412.50</span>
            <span className="ticker-up">▲ +3.42%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">ETH/USD</span>
            <span>$3,348.20</span>
            <span className="ticker-up">▲ +2.18%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">SOL/USD</span>
            <span>$184.60</span>
            <span className="ticker-up">▲ +4.91%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">USDT/USD</span>
            <span>$1.0001</span>
            <span className="ticker-up" style={{ color: '#94a3b8' }}>● 0.00%</span>
          </div>
          <div className="ticker-item">
            <span className="ticker-symbol">CLIENT LEDGER</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>$47,986.00</span>
            <span className="ticker-up">◈ SETTLED</span>
          </div>
        </div>
      </aside>

      {/* Top Navigation Header */}
      <header className="navbar">
        <a
          href={currentRoute === 'login' ? '#login' : '#dashboard'}
          className="brand-logo"
          aria-label="bit Trade net Home"
        >
          <svg className="brand-icon-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 3L4 11V25L18 33L32 25V11L18 3Z" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="#091322" />
            <path d="M18 3L4 11L18 19L32 11L18 3Z" fill="url(#brandRedGrad)" />
            <path d="M4 11V25L18 33V19L4 11Z" fill="url(#brandWhiteGrad)" />
            <path d="M32 11V25L18 33V19L32 11Z" fill="url(#brandBlueGrad)" />
            <defs>
              <linearGradient id="brandRedGrad" x1="4" y1="3" x2="32" y2="19" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ef4444" />
                <stop offset="1" stopColor="#dc2626" />
              </linearGradient>
              <linearGradient id="brandWhiteGrad" x1="4" y1="11" x2="18" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#cbd5e1" />
              </linearGradient>
              <linearGradient id="brandBlueGrad" x1="18" y1="19" x2="32" y2="33" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
          </svg>
          <span className="brand-text">bit Trade net</span>
          <span className="brand-badge">BTN</span>
        </a>

        {currentRoute === 'login' ? (
          <div className="nav-user">
            <div className="nav-security-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>256-Bit SSL</span>
            </div>
            <span style={{ fontSize: '0.84rem', color: '#94a3b8' }}>Client Portal</span>
          </div>
        ) : (
          <div className="nav-user">
            <div className="user-tag" title="Joshua James Bergin (Tier-2)">
              <span className="user-tag-dot" />
              <span className="name-full">Joshua James Bergin</span>
              <span className="name-short">Joshua B.</span>
            </div>
            <button type="button" onClick={handleSignOut} className="btn-logout" title="Sign out of account">
              Sign Out
            </button>
          </div>
        )}
      </header>

      {/* ========================================== */}
      {/* 1. VIEW: LOGIN GATEWAY (/#login)           */}
      {/* ========================================== */}
      {currentRoute === 'login' && (
        <main className="auth-wrapper">
          <div className="auth-card">
            <div className="auth-header">
              <div>
                <span
                  className="auth-kicker"
                  onClick={autofillCredentials}
                  style={{ cursor: 'pointer' }}
                  title="Click to auto-fill authorized credentials"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Secure Client Gateway
                </span>
              </div>
              <h1>bit Trade net</h1>
              <p>Sign in to access your investment portfolio &amp; real-time ledger</p>
            </div>

            {loginError && (
              <div className="error-alert show" role="alert">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} noValidate>
              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="email">Account Email Address</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authorized Access</span>
                </div>
                <div className="form-input-wrapper">
                  <span className="input-icon-left">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label" htmlFor="password">Password</label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Confidential</span>
                </div>
                <div className="form-input-wrapper">
                  <span className="input-icon-left">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    title="Toggle password visibility"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="form-hint">Authorized client credentials required for gateway access</div>
              </div>

              <div className="form-extra-row">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    className="remember-checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Remember session</span>
                </label>
                <span style={{ color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Protected
                </span>
              </div>

              <button type="submit" disabled={isLoggingIn} className="btn btn-primary">
                {isLoggingIn && (
                  <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite', display: 'inline-block' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                )}
                <span>{loginStepText}</span>
                {!isLoggingIn && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            </form>

            <div className="auth-trust-footer">
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#60a5fa' }}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>256-Bit SSL</span>
              </div>
              <span style={{ opacity: 0.3 }}>•</span>
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--green)' }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Tier-2 Custody</span>
              </div>
              <span style={{ opacity: 0.3 }}>•</span>
              <div className="trust-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f59e0b' }}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Instant Settlement</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center', maxWidth: '500px' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: '#cbd5e1', display: 'block', fontSize: '0.86rem' }}>$111,009.79</strong>
              Portfolio Valuation
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: 'var(--green)', display: 'block', fontSize: '0.86rem' }}>$47,986.00</strong>
              Settled Balance
            </div>
            <div style={{ width: '1px', height: '32px', background: 'rgba(255, 255, 255, 0.08)' }} />
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <strong style={{ color: '#60a5fa', display: 'block', fontSize: '0.86rem' }}>Tier-2 Node</strong>
              Client Gateway
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* 2. VIEW: DASHBOARD (/#dashboard)           */}
      {/* ========================================== */}
      {currentRoute === 'dashboard' && (
        <main className="page-container">
          <section className="dashboard-hero">
            <div className="hero-profile-row">
              <div>
                <span className="account-status-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Verified Tier-2 Investor
                </span>
                <h1 className="user-title" style={{ marginTop: '8px' }}>Welcome, Joshua James Bergin</h1>
                <div className="user-meta">
                  <div className="meta-item">Profile Name: <strong>Joshua James Bergin</strong></div>
                  <div className="meta-item">Email: <strong>Berginjoshua1@gmail.com</strong></div>
                  <div className="meta-item">Account ID: <strong>BTN-94821-JB</strong></div>
                </div>
              </div>
            </div>

            <div className="hero-actions">
              <button type="button" onClick={scrollToWithdrawal} className="btn btn-green">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                Process Withdrawal
              </button>

              <a href="#withdraw" className="btn btn-outline">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Review Investment Rules Notice
              </a>
            </div>
          </section>

          {/* Portfolio Statistics */}
          <section className="stats-grid">
            <article className="stat-card accent-blue">
              <div className="stat-label">
                <span>Total Portfolio</span>
                <div className="stat-icon" style={{ color: 'var(--brand-blue)' }}>$</div>
              </div>
              <div className="stat-value">$111,009.79</div>
              <div className="stat-sub">
                <span className="trend-badge">▲ +1.81%</span>
                <span>&nbsp;Consolidated Net Valuation</span>
              </div>
            </article>

            <article className="stat-card accent-green">
              <div className="stat-label">
                <span>Available Balance</span>
                <div className="stat-icon" style={{ color: 'var(--green)' }}>◈</div>
              </div>
              <div className="stat-value highlight-green">$47,986.00</div>
              <div className="stat-sub">
                <span>Settled ledger funds ready for disbursement</span>
              </div>
            </article>

            <article className="stat-card accent-red">
              <div className="stat-label">
                <span>Today's Profit / Loss</span>
                <div className="stat-icon" style={{ color: 'var(--green)' }}>↗</div>
              </div>
              <div className="stat-value highlight-green">+$1,973.74</div>
              <div className="stat-sub">
                <span className="trend-badge">▲ +1.78%</span>
                <span>&nbsp;24h Performance</span>
              </div>
            </article>
          </section>

          {/* Withdrawal from Available Balance Section */}
          <section
            ref={directWithdrawSectionRef}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '26px',
              boxShadow: 'var(--shadow)',
              marginBottom: '28px',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div>
                <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--green)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span className="pulse-dot" /> DIRECT LEDGER DISBURSEMENT
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 850, letterSpacing: '-0.02em', marginTop: '4px' }}>
                  Withdraw from Available Balance ($47,986.00)
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Disburse funds directly to your verified external digital wallet address
                </p>
              </div>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '8px 14px', borderRadius: '8px', textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Disbursable Limit</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 850, color: 'var(--green)' }}>$47,986.00</div>
              </div>
            </div>

            <form onSubmit={handleDirectWithdrawSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Destination Wallet Address (BTC / ETH / USDT)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    ref={walletInputRef}
                    type="text"
                    className="form-input"
                    placeholder="0x71C... or bc1q... or TXYZ..."
                    value={walletAddress}
                    onChange={(e) => {
                      setWalletAddress(e.target.value);
                      if (walletError) setWalletError(null);
                    }}
                    required
                    style={{
                      paddingLeft: '14px',
                      fontFamily: 'monospace',
                      fontSize: '0.88rem',
                      borderColor: walletError ? '#ef4444' : undefined
                    }}
                  />
                  {walletError && (
                    <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>⚠</span> {walletError}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1' }}>
                    Withdrawal Amount ($ USD)
                  </label>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount('47986')}
                    style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    MAX ($47,986.00)
                  </button>
                </div>
                <input
                  type="number"
                  className="form-input"
                  placeholder="Enter amount (e.g. 47986)"
                  min="10"
                  max="47986"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div>
                <button type="submit" disabled={isProcessingWithdraw} className="btn btn-green" style={{ width: '100%', height: '48px' }}>
                  {isProcessingWithdraw ? (
                    <>
                      <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                      </svg>
                      <span>Processing Ledger Protocol...</span>
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span>Initiate Withdrawal</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Historical Ledger Section */}
          <section style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '24px', boxShadow: 'var(--shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Profile Investment Ledger History</h2>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-card-alt)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                Historical Records (2019 - 2022)
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Date</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Action Type</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Invested / Profit</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Withdrawal Gross</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Withdrawal Fee</th>
                    <th style={{ padding: '10px 12px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody style={{ color: 'var(--text-primary)' }}>
                  {HISTORY_DATA.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < HISTORY_DATA.length - 1 ? '1px solid #132238' : 'none' }}>
                      <td style={{ padding: '12px' }}>{row.date}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: row.action === 'Reinvested Yield' ? '#a78bfa' : '#60a5fa', fontWeight: 600 }}>{row.action}</span>
                      </td>
                      <td style={{ padding: '12px' }}>{row.invested}</td>
                      <td style={{ padding: '12px' }}>{row.withdrawn}</td>
                      <td style={{ padding: '12px', color: row.fee === '-' ? 'var(--text-muted)' : '#fca5a5' }}>{row.fee}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: row.statusColor, fontWeight: 700 }}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      )}

      {/* ========================================== */}
      {/* 3. VIEW: WITHDRAWAL NOTICE (/#withdraw)    */}
      {/* ========================================== */}
      {currentRoute === 'withdraw' && (
        <main className="page-container">
          <div className="withdrawal-card">
            <div className="withdrawal-card-header">
              <div className="warning-badge-pill">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Account Compliance Notice
              </div>
              <h1 className="withdrawal-title">Withdrawal Authorization Notice</h1>
              <p className="withdrawal-subtitle">Review release requirements before requesting ledger disbursement</p>
            </div>

            <div className="breakdown-box">
              <div className="breakdown-row">
                <span>Account Holder</span>
                <strong>Joshua James Bergin</strong>
              </div>
              <div className="breakdown-row">
                <span>Registered Email</span>
                <strong>Berginjoshua1@gmail.com</strong>
              </div>
              <div className="breakdown-row">
                <span>Available Balance</span>
                <strong style={{ color: 'var(--green)', fontSize: '1.15rem' }}>$47,986.00</strong>
              </div>
              <div className="breakdown-row highlight">
                <div>
                  <span style={{ display: 'block', color: '#fbbf24', fontWeight: 700 }}>Required Clearance Fee</span>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Calculated protocol clearance tariff</span>
                </div>
                <strong>$5,960.00</strong>
              </div>
            </div>

            <div className="advisory-box">
              <div className="advisory-icon">⚠️</div>
              <div>
                <div className="advisory-title">Investor Security Advisory &amp; Safe Practices</div>
                <div className="advisory-text">
                  <strong>Notice:</strong> Regulated financial institutions, legitimate cryptocurrency exchanges, and licensed brokerages{' '}
                  <strong>deduct transaction fees directly</strong> from existing account balances. They never require an investor{' '}
                  to send external out-of-pocket wire transfers or cryptocurrency deposits to "unlock" or "release" their own funds.{' '}
                  Demanding an upfront fee to access accumulated investment profits is a recognized hallmark of advance-fee fraud.
                </div>
              </div>
            </div>

            <div className="withdrawal-actions">
              <button
                type="button"
                onClick={() => setShowSimulationModal(true)}
                className="btn btn-green"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Pay Clearance Fee (Simulation)
              </button>

              <a href="#dashboard" className="btn btn-secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Dashboard
              </a>
            </div>
          </div>
        </main>
      )}

      {/* ========================================== */}
      {/* MODAL: WITHDRAWAL PROTOCOL NOTICE ($5,960) */}
      {/* ========================================== */}
      {showWithdrawalModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWithdrawalModal(false);
          }}
          style={{
            display: 'flex',
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 11, 20, 0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 9999,
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#091322',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(239, 68, 68, 0.15)',
              overflow: 'hidden',
              animation: 'modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ height: '4px', background: 'linear-gradient(90deg, #dc2626, #f59e0b, #dc2626)' }} />

            <div style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444',
                    flexShrink: 0
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f87171', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Clearance Protocol Notice
                  </span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em', marginTop: '2px' }}>
                    Withdrawal Authorization Required
                  </h3>
                </div>
              </div>

              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.94rem', lineHeight: 1.55, color: '#fecaca', margin: 0 }}>
                  Notice: <strong style={{ color: '#ffffff', textDecoration: 'underline' }}>$5,960.00</strong> has to be paid before the available balance can be withdrawn, to meet the investment clearance protocol.
                </p>
              </div>

              <div style={{ background: 'var(--bg-card-alt)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px', marginBottom: '24px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Available Balance:</span>
                  <span style={{ fontWeight: 700, color: 'var(--green)' }}>$47,986.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Requested Amount:</span>
                  <span style={{ fontWeight: 700, color: '#ffffff' }}>{modalRequestedAmount}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Wallet:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#93c5fd', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {modalTargetWallet || '-'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#fca5a5', fontWeight: 600 }}>Required Clearance Fee:</span>
                  <span style={{ fontWeight: 800, color: '#ef4444', fontSize: '0.98rem' }}>$5,960.00</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a
                  href="#withdraw"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="btn btn-green"
                  style={{ flex: 1, textAlign: 'center', textDecoration: 'none', justifyContent: 'center' }}
                >
                  <span>Review Clearance &amp; Pay</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </a>
                <button
                  type="button"
                  onClick={() => setShowWithdrawalModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Dismiss Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Feedback Modal */}
      {showSimulationModal && (
        <div className="modal-overlay" style={{ display: 'flex' }} role="dialog" aria-modal="true">
          <div className="simulation-modal">
            <span className="modal-badge">Simulation Mode Only</span>
            <h3>Clearance Fee Simulation Completed</h3>
            <p>
              You triggered the front-end simulation for the <strong>$5,960.00</strong> clearance fee.
            </p>
            <p style={{ background: '#081220', border: '1px solid var(--border)', padding: '14px', borderRadius: '8px', fontSize: '0.86rem', color: '#94a3b8' }}>
              🛡️ <strong>Safety Reminder:</strong> This applet is strictly front-end with zero real transactions or payment processing. In the real world, never transfer funds or cryptocurrency to third parties requesting upfront fees to release investment earnings.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => {
                  setShowSimulationModal(false);
                  window.location.hash = '#dashboard';
                }}
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                Acknowledge &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <footer>
        &copy; 2026 bit Trade net. All rights reserved. Simulation &amp; Client Dashboard Portal.
      </footer>
    </>
  );
};

export default App;
