// HrDashboard React Component for LVO Workforce Portal (job.wearelvo.com)
// Visualizes 12-month payroll trends via Recharts AreaChart & fetches live user data

(function (global) {
  const React = global.React;
  const ReactDOM = global.ReactDOM;
  const Recharts = global.Recharts;
  const h = React.createElement;

  function HrDashboard() {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [activeTab, setActiveTab] = React.useState('overview');
    const [selectedStub, setSelectedStub] = React.useState(null);
    const [chartMetric, setChartMetric] = React.useState('both'); // 'both', 'net', 'gross'
    const [toastMessage, setToastMessage] = React.useState('');
    const [ptoForm, setPtoForm] = React.useState({
      type: 'vacation',
      start: '2026-10-19',
      end: '2026-10-23'
    });

    const triggerToast = (msg) => {
      setToastMessage(msg);
      setTimeout(() => setToastMessage(''), 3500);
    };

    // Fetch user profile and payroll data from API route
    React.useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user') || 'Marcus Sterling';
      const apiUrl = `/api/dashboard/me?user=${encodeURIComponent(userParam)}`;

      fetch(apiUrl)
        .then((res) => {
          if (!res.ok) throw new Error('Network error loading HR profile');
          return res.json();
        })
        .then((json) => {
          setData(json);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('API error, falling back to local dataset', err);
          setLoading(false);
        });
    }, []);

    if (loading) {
      return h(
        'div',
        { className: 'loading-screen' },
        h('div', { className: 'spinner' }),
        h('p', { style: { marginTop: '1rem', color: 'var(--ink-muted)' } }, 'Connecting to LVO Workforce Systems...')
      );
    }

    const user = (data && data.user) || {
      name: 'Marcus Sterling',
      email: 'm.sterling@wearelvo.com',
      employeeId: 'LVO-EMP-8842',
      initials: 'MS',
      department: 'Core Systems Architecture',
      hireDate: 'Nov 14, 2024',
      status: 'Active Full-Time'
    };

    const position = (data && data.currentPosition) || {
      title: 'Senior Systems Architect',
      division: 'Development & Systems',
      classification: 'Exempt · Salaried',
      workplace: 'Hybrid (2 days HQ / 3 days Remote)',
      manager: 'Eleanor Ross (VP Tech Infrastructure)',
      departmentCode: 'CORP-DEV-004',
      flsa: 'Exempt Professional',
      annualSalary: 175000,
      semiMonthlyGross: 7291.67,
      responsibilities: [
        'Lead high-availability distributed systems architecture across LVO digital portals including job.wearelvo.com and careers.wearelvo.com.',
        'Oversee Cloudflare edge workers, zero-trust token authentication, and Postgres Cloud SQL integrations.',
        'Mentor junior software engineers and conduct weekly architecture review panels for corporate divisions.'
      ]
    };

    const payroll = (data && data.payrollSummary) || {
      annualSalary: 175000,
      semiMonthlyGross: 7291.67,
      netPay: 5142.30,
      ytdGross: 131250.00,
      ytdTaxes: 32840.10,
      ytdRetirement: 7875.00,
      nextPayDate: 'Oct 15, 2026',
      depositAccount: 'JPMorgan Chase Bank, N.A. (••••4821)',
      ptoBalance: 18.5,
      sickBalance: 5.0
    };

    const trends = (data && data.payrollTrends12Months) || [];
    const applications = (data && data.internalApplications) || [];
    const stubs = (data && data.payStatements) || [];

    // Recharts 12-Month Area Chart Component
    const renderAreaChart = () => {
      if (!Recharts || !trends || trends.length === 0) {
        return h('div', { style: { padding: '2rem', textAlign: 'center', color: 'var(--ink-muted)' } }, '12-Month payroll trend data loading...');
      }

      const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

      return h(
        ResponsiveContainer,
        { width: '100%', height: 260 },
        h(
          AreaChart,
          {
            data: trends,
            margin: { top: 15, right: 15, left: -5, bottom: 5 }
          },
          h(
            'defs',
            null,
            h(
              'linearGradient',
              { id: 'grossGradient', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '5%', stopColor: '#171614', stopOpacity: 0.16 }),
              h('stop', { offset: '95%', stopColor: '#171614', stopOpacity: 0.0 })
            ),
            h(
              'linearGradient',
              { id: 'netGradient', x1: '0', y1: '0', x2: '0', y2: '1' },
              h('stop', { offset: '5%', stopColor: '#9C7A3C', stopOpacity: 0.38 }),
              h('stop', { offset: '95%', stopColor: '#9C7A3C', stopOpacity: 0.02 })
            )
          ),
          h(CartesianGrid, { strokeDasharray: '3 3', vertical: false, stroke: '#E8E5DC' }),
          h(XAxis, {
            dataKey: 'shortMonth',
            tick: { fill: '#747167', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
            axisLine: { stroke: '#D4D0C5' },
            tickLine: false
          }),
          h(YAxis, {
            tickFormatter: (val) => `$${(val / 1000).toFixed(0)}k`,
            domain: [0, 18000],
            tick: { fill: '#747167', fontSize: 11, fontFamily: "'JetBrains Mono', monospace" },
            axisLine: false,
            tickLine: false,
            width: 48
          }),
          h(Tooltip, {
            formatter: (val, name) => [`$${Number(val).toLocaleString()}`, name === 'gross' ? 'Monthly Gross' : 'Monthly Net Take-Home'],
            labelFormatter: (label, payload) => {
              if (payload && payload[0] && payload[0].payload) {
                return payload[0].payload.month;
              }
              return label;
            },
            contentStyle: {
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2DFD6',
              borderRadius: '6px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              fontSize: '12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              color: '#171614'
            }
          }),
          (chartMetric === 'both' || chartMetric === 'gross') &&
            h(Area, {
              type: 'monotone',
              dataKey: 'gross',
              name: 'Monthly Gross',
              stroke: '#2B2A27',
              strokeWidth: 2,
              fillOpacity: 1,
              fill: 'url(#grossGradient)'
            }),
          (chartMetric === 'both' || chartMetric === 'net') &&
            h(Area, {
              type: 'monotone',
              dataKey: 'net',
              name: 'Monthly Net Take-Home',
              stroke: '#9C7A3C',
              strokeWidth: 2.5,
              fillOpacity: 1,
              fill: 'url(#netGradient)'
            })
        )
      );
    };

    return h(
      'div',
      { className: 'hr-dashboard-app' },

      // Subdomain Banner
      h(
        'aside',
        { className: 'portal-banner' },
        h(
          'div',
          { className: 'portal-subdomain-tag' },
          h(
            'svg',
            { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            h('rect', { x: 3, y: 11, width: 18, height: 11, rx: 2, ry: 2 }),
            h('path', { d: 'M7 11V7a5 5 0 0 1 10 0v4' })
          ),
          h('span', null, 'Subdomain: ', h('strong', null, 'job.wearelvo.com'), ' · Workforce Operations & HR Central')
        ),
        h(
          'div',
          { className: 'portal-banner-links' },
          h('a', { href: '/', title: 'Back to Careers' }, '← Return to careers.wearelvo.com'),
          h('span', { 'aria-hidden': 'true', style: { opacity: 0.4 } }, '·'),
          h('a', { href: 'https://privacy.wearelvo.com/', target: '_blank', rel: 'noopener noreferrer' }, 'Privacy Policy'),
          h('span', { 'aria-hidden': 'true', style: { opacity: 0.4 } }, '·'),
          h('a', { href: 'https://tos.wearelvo.com/', target: '_blank', rel: 'noopener noreferrer' }, 'Terms of Service')
        )
      ),

      // Header Bar
      h(
        'header',
        { className: 'dashboard-header' },
        h(
          'div',
          { className: 'header-inner' },
          h(
            'div',
            { className: 'brand-group' },
            h(
              'a',
              { href: '/dashboard', className: 'brand-link' },
              h('img', { src: 'assets/logo.png', alt: 'LVO Logo', className: 'brand-logo' }),
              h('span', { className: 'brand-title' }, 'LVO', h('span', null, 'Workforce'))
            ),
            h('div', { className: 'header-divider' }),
            h('span', { className: 'subdomain-badge' }, 'job.wearelvo.com')
          ),
          h(
            'div',
            { className: 'user-actions' },
            h(
              'div',
              { className: 'user-profile-badge' },
              h(
                'div',
                null,
                h('div', { className: 'user-meta-name' }, user.name),
                h('div', { className: 'user-meta-id' }, `${user.employeeId} · ${position.division}`)
              ),
              h('div', { className: 'user-avatar' }, user.initials)
            ),
            h(
              'a',
              {
                href: '/',
                className: 'btn-signout',
                onClick: (e) => {
                  e.preventDefault();
                  triggerToast('Signed out of job.wearelvo.com workforce session.');
                  setTimeout(() => {
                    window.location.href = '/';
                  }, 600);
                }
              },
              'Sign Out'
            )
          )
        )
      ),

      // Navigation Tabs
      h(
        'nav',
        { className: 'dashboard-tabs-bar', 'aria-label': 'Dashboard navigation' },
        h(
          'div',
          { className: 'dashboard-tabs-inner' },
          [
            { id: 'overview', label: 'Overview' },
            { id: 'positions', label: 'Current Positions & Mobility' },
            { id: 'payroll', label: 'Payroll & Compensation' },
            { id: 'benefits', label: 'Benefits & Time Off' },
            { id: 'documents', label: 'Tax Forms & Documents' }
          ].map((tab) =>
            h(
              'button',
              {
                key: tab.id,
                type: 'button',
                className: `tab-btn ${activeTab === tab.id ? 'active' : ''}`,
                onClick: () => setActiveTab(tab.id)
              },
              h('span', null, tab.label)
            )
          )
        )
      ),

      // Main Container
      h(
        'main',
        { className: 'dashboard-main' },

        // Stat Cards Summary Row (Always visible or in Overview)
        h(
          'div',
          { className: 'stat-cards-grid' },
          h(
            'div',
            { className: 'stat-card' },
            h('div', { className: 'stat-card-label' }, 'Current Position'),
            h('div', { className: 'stat-card-value', style: { fontSize: '1.25rem' } }, position.title),
            h('div', { className: 'stat-card-meta' }, position.division)
          ),
          h(
            'div',
            { className: 'stat-card' },
            h('div', { className: 'stat-card-label' }, 'Next Paycheck (Semi-Monthly)'),
            h('div', { className: 'stat-card-value tabular-nums' }, `$${payroll.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
            h(
              'div',
              { className: 'stat-card-meta positive' },
              h(
                'svg',
                { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                h('polyline', { points: '20 6 9 17 4 12' })
              ),
              h('span', null, `Deposits ${payroll.nextPayDate} (Chase ····4821)`)
            )
          ),
          h(
            'div',
            { className: 'stat-card' },
            h('div', { className: 'stat-card-label' }, 'YTD Gross Earnings'),
            h('div', { className: 'stat-card-value tabular-nums' }, `$${payroll.ytdGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
            h('div', { className: 'stat-card-meta' }, `Annualized base: $${payroll.annualSalary.toLocaleString()} / yr`)
          ),
          h(
            'div',
            { className: 'stat-card' },
            h('div', { className: 'stat-card-label' }, 'PTO Balance'),
            h('div', { className: 'stat-card-value tabular-nums' }, `${payroll.ptoBalance} Days`),
            h('div', { className: 'stat-card-meta' }, 'Accrual rate: 2.0 days / month')
          )
        ),

        // TAB 1: OVERVIEW
        activeTab === 'overview' &&
          h(
            'section',
            { className: 'tab-content active' },
            // RECHARTS 12-MONTH AREA CHART SECTION
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, '12-Month Payroll Trends & Compensation History'),
                  h('p', { className: 'dash-card-subtitle' }, `Visualizing monthly gross earnings vs. net take-home pay for ${user.name} (Oct 2025 – Sep 2026)`)
                ),
                h(
                  'div',
                  { style: { display: 'flex', gap: '0.45rem', alignItems: 'center' } },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `filter-btn ${chartMetric === 'both' ? 'active' : ''}`,
                      onClick: () => setChartMetric('both')
                    },
                    'Both Streams'
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `filter-btn ${chartMetric === 'net' ? 'active' : ''}`,
                      onClick: () => setChartMetric('net')
                    },
                    'Net Pay Only'
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: `filter-btn ${chartMetric === 'gross' ? 'active' : ''}`,
                      onClick: () => setChartMetric('gross')
                    },
                    'Gross Only'
                  )
                )
              ),

              // The Area Chart container
              renderAreaChart(),

              // Chart Metrics Breakdown Strip
              h(
                'div',
                {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.9rem',
                    marginTop: '0.85rem',
                    borderTop: '1px solid var(--border-subtle)',
                    flexWrap: 'wrap',
                    gap: '1rem',
                    fontSize: '0.82rem'
                  }
                },
                h(
                  'div',
                  { style: { display: 'flex', gap: '1.5rem', alignItems: 'center' } },
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '0.4rem' } },
                    h('span', { style: { width: 12, height: 12, backgroundColor: '#9C7A3C', borderRadius: 2, display: 'inline-block' } }),
                    h('span', { style: { color: 'var(--ink-secondary)' } }, 'Average Monthly Net: '),
                    h('strong', { className: 'tabular-nums font-semibold' }, '$10,285.00')
                  ),
                  h(
                    'div',
                    { style: { display: 'flex', alignItems: 'center', gap: '0.4rem' } },
                    h('span', { style: { width: 12, height: 12, backgroundColor: '#2B2A27', borderRadius: 2, display: 'inline-block' } }),
                    h('span', { style: { color: 'var(--ink-secondary)' } }, 'Average Monthly Gross: '),
                    h('strong', { className: 'tabular-nums font-semibold' }, '$14,583.33')
                  )
                ),
                h(
                  'div',
                  { style: { color: 'var(--ink-muted)' } },
                  'Effective statutory & voluntary deduction rate: ',
                  h('strong', { className: 'tabular-nums', style: { color: 'var(--ink)' } }, '29.5%')
                )
              )
            ),

            // 2-Column Split: Active Position Snapshot & Recent Paystubs
            h(
              'div',
              { className: 'dashboard-grid-layout' },
              h(
                'div',
                null,
                // Active Position Snapshot
                h(
                  'div',
                  { className: 'dash-card' },
                  h(
                    'div',
                    { className: 'dash-card-header' },
                    h(
                      'div',
                      null,
                      h('h2', { className: 'dash-card-title' }, 'Current Active Position'),
                      h('p', { className: 'dash-card-subtitle' }, 'Corporate personnel file registered on job.wearelvo.com')
                    ),
                    h('span', { className: 'status-indicator-tag' }, position.classification)
                  ),
                  h(
                    'div',
                    { className: 'position-hero-row' },
                    h(
                      'div',
                      null,
                      h('h3', { className: 'position-main-title' }, position.title),
                      h('p', { className: 'position-division-text' }, `LVO Holdings · ${position.division}`)
                    )
                  ),
                  h(
                    'div',
                    { className: 'attr-matrix' },
                    h('div', null, h('div', { className: 'attr-label' }, 'Employee ID'), h('div', { className: 'attr-value tabular-nums' }, user.employeeId)),
                    h('div', null, h('div', { className: 'attr-label' }, 'Reporting Manager'), h('div', { className: 'attr-value' }, position.manager)),
                    h('div', null, h('div', { className: 'attr-label' }, 'Workplace'), h('div', { className: 'attr-value' }, position.workplace)),
                    h('div', null, h('div', { className: 'attr-label' }, 'Hire Date'), h('div', { className: 'attr-value tabular-nums' }, user.hireDate))
                  ),
                  h(
                    'div',
                    { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' } },
                    h(
                      'button',
                      { type: 'button', className: 'btn-action-text', onClick: () => setActiveTab('positions') },
                      'View Position Details & Scopes →'
                    ),
                    h(
                      'button',
                      { type: 'button', className: 'btn-action-text', onClick: () => setActiveTab('payroll') },
                      'Manage Payroll & Tax Withholdings →'
                    )
                  )
                )
              ),

              h(
                'div',
                null,
                // Recent Paystubs Table Snapshot
                h(
                  'div',
                  { className: 'dash-card' },
                  h(
                    'div',
                    { className: 'dash-card-header' },
                    h(
                      'div',
                      null,
                      h('h2', { className: 'dash-card-title' }, 'Recent Pay Statements'),
                      h('p', { className: 'dash-card-subtitle' }, 'Recent semi-monthly disbursements')
                    ),
                    h(
                      'button',
                      { type: 'button', className: 'btn-action-text', onClick: () => setActiveTab('payroll') },
                      'View All History →'
                    )
                  ),
                  h(
                    'div',
                    { className: 'data-table-container' },
                    h(
                      'table',
                      { className: 'data-table' },
                      h(
                        'thead',
                        null,
                        h(
                          'tr',
                          null,
                          h('th', null, 'Pay Date'),
                          h('th', null, 'Gross Pay'),
                          h('th', null, 'Net Take-Home'),
                          h('th', null, 'Action')
                        )
                      ),
                      h(
                        'tbody',
                        null,
                        stubs.slice(0, 3).map((s, idx) =>
                          h(
                            'tr',
                            { key: s.id },
                            h('td', { className: 'tabular-nums font-semibold' }, s.payDate),
                            h('td', { className: 'tabular-nums' }, `$${s.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                            h('td', { className: 'tabular-nums font-semibold', style: { color: 'var(--emerald)' } }, `$${s.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                            h(
                              'td',
                              null,
                              h(
                                'button',
                                {
                                  type: 'button',
                                  className: 'btn-action-text',
                                  onClick: () => setSelectedStub(s)
                                },
                                'View Stub'
                              )
                            )
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          ),

        // TAB 2: CURRENT POSITIONS & MOBILITY
        activeTab === 'positions' &&
          h(
            'section',
            { className: 'tab-content active' },
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, 'Current Active Position'),
                  h('p', { className: 'dash-card-subtitle' }, 'Primary appointment in LVO Holdings workforce directory')
                ),
                h('span', { className: 'status-indicator-tag' }, 'Active Full-Time')
              ),
              h(
                'div',
                { className: 'position-hero-row' },
                h(
                  'div',
                  null,
                  h('h3', { className: 'position-main-title' }, position.title),
                  h('p', { className: 'position-division-text' }, `LVO Holdings · ${position.division}`)
                ),
                h(
                  'div',
                  { style: { textAlign: 'right' } },
                  h('div', { style: { fontSize: '0.74rem', color: 'var(--ink-muted)', textTransform: 'uppercase' } }, 'Compensation Rate'),
                  h('div', { className: 'tabular-nums', style: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--ink)' } }, `$${position.annualSalary.toLocaleString()}.00 / yr`)
                )
              ),
              h(
                'div',
                { className: 'attr-matrix' },
                h('div', null, h('div', { className: 'attr-label' }, 'Employee ID'), h('div', { className: 'attr-value tabular-nums' }, user.employeeId)),
                h('div', null, h('div', { className: 'attr-label' }, 'Classification'), h('div', { className: 'attr-value' }, position.classification)),
                h('div', null, h('div', { className: 'attr-label' }, 'Workplace'), h('div', { className: 'attr-value' }, position.workplace)),
                h('div', null, h('div', { className: 'attr-label' }, 'Direct Manager'), h('div', { className: 'attr-value' }, position.manager)),
                h('div', null, h('div', { className: 'attr-label' }, 'Department Code'), h('div', { className: 'attr-value tabular-nums' }, position.departmentCode)),
                h('div', null, h('div', { className: 'attr-label' }, 'FLSA Status'), h('div', { className: 'attr-value' }, position.flsa))
              ),
              h('h4', { style: { fontFamily: 'var(--font-brand)', fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.65rem' } }, 'Core Responsibilities & Scopes'),
              h(
                'ul',
                { style: { fontSize: '0.88rem', color: 'var(--ink-secondary)', marginLeft: '1.25rem', lineHeight: 1.7, marginBottom: '1.5rem' } },
                position.responsibilities.map((r, i) => h('li', { key: i }, r))
              ),
              h(
                'div',
                {
                  style: {
                    padding: '1rem',
                    background: 'var(--surface-subtle)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 6,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }
                },
                h(
                  'div',
                  null,
                  h('strong', null, 'Request Role Reclassification or Title Adjustment'),
                  h('p', { style: { fontSize: '0.8rem', color: 'var(--ink-muted)' } }, 'Submissions are reviewed by Division Executive Leads and LVO HR.')
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'btn-action-text',
                    onClick: () => triggerToast('Notification dispatched to HR Business Partner (hr@wearelvo.com)')
                  },
                  'Contact HR Business Partner'
                )
              )
            ),

            // Internal Applications & Mobility
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, 'Internal Mobility & Active Applications'),
                  h('p', { className: 'dash-card-subtitle' }, 'Track cross-division applications and leadership succession pipelines')
                ),
                h('a', { href: '/', className: 'btn-action-text' }, 'Explore All Roles on careers.wearelvo.com →')
              ),
              h(
                'div',
                { className: 'data-table-container' },
                h(
                  'table',
                  { className: 'data-table' },
                  h(
                    'thead',
                    null,
                    h(
                      'tr',
                      null,
                      h('th', null, 'Target Role'),
                      h('th', null, 'Division'),
                      h('th', null, 'Date Applied'),
                      h('th', null, 'Stage'),
                      h('th', null, 'Hiring Lead'),
                      h('th', null, 'Status')
                    )
                  ),
                  h(
                    'tbody',
                    null,
                    applications.map((app, i) =>
                      h(
                        'tr',
                        { key: i },
                        h('td', null, h('strong', null, app.title)),
                        h('td', null, app.division),
                        h('td', { className: 'tabular-nums' }, app.dateApplied),
                        h(
                          'td',
                          null,
                          h(
                            'span',
                            {
                              className: 'status-indicator-tag',
                              style: app.status === 'Active' ? { background: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' } : {}
                            },
                            app.stage
                          )
                        ),
                        h('td', null, app.lead),
                        h(
                          'td',
                          null,
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'btn-action-text',
                              onClick: () => triggerToast(`Application details for ${app.title} synced with recruiter`)
                            },
                            'View Updates'
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          ),

        // TAB 3: PAYROLL & COMPENSATION
        activeTab === 'payroll' &&
          h(
            'section',
            { className: 'tab-content active' },
            // Recharts 12-Month Area Chart in Payroll Tab as well
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, '12-Month Compensation & Payroll Trajectory'),
                  h('p', { className: 'dash-card-subtitle' }, 'Detailed view of semi-monthly earnings aggregated monthly over the preceding 12 months')
                )
              ),
              renderAreaChart()
            ),

            // Paystubs Table
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, 'Pay Statements & Earning Archives'),
                  h('p', { className: 'dash-card-subtitle' }, 'Official disbursements processed through LVO Treasury & Payroll')
                ),
                h(
                  'button',
                  {
                    type: 'button',
                    className: 'btn-action-text',
                    onClick: () => triggerToast('Generating encrypted 2026 Pay Archive CSV...')
                  },
                  'Export CSV'
                )
              ),
              h(
                'div',
                { className: 'data-table-container' },
                h(
                  'table',
                  { className: 'data-table' },
                  h(
                    'thead',
                    null,
                    h(
                      'tr',
                      null,
                      h('th', null, 'Pay Date'),
                      h('th', null, 'Pay Period'),
                      h('th', null, 'Gross Pay'),
                      h('th', null, 'Federal Tax'),
                      h('th', null, 'FICA/Med'),
                      h('th', null, 'Net Take-Home'),
                      h('th', null, 'Status'),
                      h('th', null, 'Statement')
                    )
                  ),
                  h(
                    'tbody',
                    null,
                    stubs.map((s) =>
                      h(
                        'tr',
                        { key: s.id },
                        h('td', { className: 'tabular-nums font-semibold' }, s.payDate),
                        h('td', null, s.period),
                        h('td', { className: 'tabular-nums' }, `$${s.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                        h('td', { className: 'tabular-nums text-red-600' }, `-$${s.fedTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                        h('td', { className: 'tabular-nums text-red-600' }, `-$${(s.socSec + s.medicare).toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                        h('td', { className: 'tabular-nums font-semibold', style: { color: 'var(--emerald)' } }, `$${s.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                        h('td', null, h('span', { className: 'status-indicator-tag' }, s.status)),
                        h(
                          'td',
                          null,
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'btn-action-text',
                              onClick: () => setSelectedStub(s)
                            },
                            'View Paystub'
                          )
                        )
                      )
                    )
                  )
                )
              )
            ),

            // Direct Deposit & Tax Info
            h(
              'div',
              { className: 'dashboard-grid-layout' },
              h(
                'div',
                { className: 'dash-card' },
                h(
                  'div',
                  { className: 'dash-card-header' },
                  h(
                    'div',
                    null,
                    h('h2', { className: 'dash-card-title' }, 'Direct Deposit Account'),
                    h('p', { className: 'dash-card-subtitle' }, 'Automated ACH electronic funds transfer')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'btn-action-text',
                      onClick: () => triggerToast('Direct deposit changes take effect on the following pay cycle')
                    },
                    'Edit Account'
                  )
                ),
                h(
                  'div',
                  { style: { background: 'var(--surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '1.15rem' } },
                  h(
                    'div',
                    { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' } },
                    h('strong', null, 'JPMorgan Chase Bank, N.A.'),
                    h('span', { className: 'status-indicator-tag' }, 'Verified Primary')
                  ),
                  h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--ink-secondary)' } }, 'Checking Account: •••••••••4821')
                )
              ),
              h(
                'div',
                { className: 'dash-card' },
                h(
                  'div',
                  { className: 'dash-card-header' },
                  h(
                    'div',
                    null,
                    h('h2', { className: 'dash-card-title' }, 'W-4 Tax Withholdings'),
                    h('p', { className: 'dash-card-subtitle' }, 'Federal & State tax calculation profile')
                  ),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'btn-action-text',
                      onClick: () => triggerToast('Opening digital Form W-4 amendment modal...')
                    },
                    'Update W-4'
                  )
                ),
                h(
                  'div',
                  { className: 'attr-matrix' },
                  h('div', null, h('div', { className: 'attr-label' }, 'Filing Status'), h('div', { className: 'attr-value' }, 'Single')),
                  h('div', null, h('div', { className: 'attr-label' }, 'Extra Withholding'), h('div', { className: 'attr-value tabular-nums' }, '$0.00')),
                  h('div', null, h('div', { className: 'attr-label' }, 'State Income Tax'), h('div', { className: 'attr-value' }, 'Texas (0.00% Exempt)'))
                )
              )
            )
          ),

        // TAB 4: BENEFITS & PTO
        activeTab === 'benefits' &&
          h(
            'section',
            { className: 'tab-content active' },
            h(
              'div',
              { className: 'dashboard-grid-layout' },
              h(
                'div',
                { className: 'dash-card' },
                h(
                  'div',
                  { className: 'dash-card-header' },
                  h(
                    'div',
                    null,
                    h('h2', { className: 'dash-card-title' }, 'Request Time Off (PTO)'),
                    h('p', { className: 'dash-card-subtitle' }, 'Submit paid leave request to Eleanor Ross (VP Tech)')
                  )
                ),
                h(
                  'form',
                  {
                    onSubmit: (e) => {
                      e.preventDefault();
                      triggerToast(`PTO request (${ptoForm.type}: ${ptoForm.start} to ${ptoForm.end}) submitted for executive approval.`);
                    }
                  },
                  h(
                    'div',
                    { style: { marginBottom: '1rem' } },
                    h('label', { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' } }, 'Leave Type'),
                    h(
                      'select',
                      {
                        value: ptoForm.type,
                        onChange: (e) => setPtoForm({ ...ptoForm, type: e.target.value }),
                        style: { width: '100%', padding: '0.65rem', border: '1px solid var(--border-strong)', borderRadius: 6 }
                      },
                      h('option', { value: 'vacation' }, 'Paid Vacation (18.5 Days Available)'),
                      h('option', { value: 'sick' }, 'Sick & Medical Leave (5.0 Days Available)'),
                      h('option', { value: 'personal' }, 'Personal / Floating Holiday (2.0 Days Available)')
                    )
                  ),
                  h(
                    'div',
                    { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' } },
                    h(
                      'div',
                      null,
                      h('label', { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' } }, 'Start Date'),
                      h('input', {
                        type: 'date',
                        value: ptoForm.start,
                        required: true,
                        onChange: (e) => setPtoForm({ ...ptoForm, start: e.target.value }),
                        style: { width: '100%', padding: '0.65rem', border: '1px solid var(--border-strong)', borderRadius: 6 }
                      })
                    ),
                    h(
                      'div',
                      null,
                      h('label', { style: { display: 'block', fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.35rem' } }, 'End Date'),
                      h('input', {
                        type: 'date',
                        value: ptoForm.end,
                        required: true,
                        onChange: (e) => setPtoForm({ ...ptoForm, end: e.target.value }),
                        style: { width: '100%', padding: '0.65rem', border: '1px solid var(--border-strong)', borderRadius: 6 }
                      })
                    )
                  ),
                  h(
                    'button',
                    {
                      type: 'submit',
                      className: 'btn-action-text',
                      style: { background: 'var(--ink)', color: '#fff', padding: '0.75rem 1.25rem' }
                    },
                    'Submit Request for Approval'
                  )
                )
              ),

              h(
                'div',
                { className: 'dash-card' },
                h(
                  'div',
                  { className: 'dash-card-header' },
                  h(
                    'div',
                    null,
                    h('h2', { className: 'dash-card-title' }, 'Enrolled Health & Wealth Benefits'),
                    h('p', { className: 'dash-card-subtitle' }, 'Coverage via LVO Holdings Platinum Plan')
                  )
                ),
                h(
                  'div',
                  { style: { display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.86rem' } },
                  h(
                    'div',
                    { style: { padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 6 } },
                    h('strong', null, 'BlueCross BlueShield Platinum PPO'),
                    h('div', { style: { color: 'var(--ink-muted)', fontSize: '0.78rem' } }, 'Deductible: $500 · 90% in-network coverage paid by LVO Holdings')
                  ),
                  h(
                    'div',
                    { style: { padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 6 } },
                    h('strong', null, 'Delta Dental Premier & VSP Vision'),
                    h('div', { style: { color: 'var(--ink-muted)', fontSize: '0.78rem' } }, '100% preventative dental and annual vision care covered')
                  ),
                  h(
                    'div',
                    { style: { padding: '0.75rem', border: '1px solid var(--border-subtle)', borderRadius: 6 } },
                    h('strong', null, 'Vanguard 401(k) Retirement'),
                    h('div', { style: { color: 'var(--ink-muted)', fontSize: '0.78rem' } }, 'Employee: 6% · Employer Match: 100% up to 6%')
                  )
                )
              )
            )
          ),

        // TAB 5: DOCUMENTS & TAX FORMS
        activeTab === 'documents' &&
          h(
            'section',
            { className: 'tab-content active' },
            h(
              'div',
              { className: 'dash-card' },
              h(
                'div',
                { className: 'dash-card-header' },
                h(
                  'div',
                  null,
                  h('h2', { className: 'dash-card-title' }, 'Personnel Documents & Regulatory Filings'),
                  h('p', { className: 'dash-card-subtitle' }, 'Official tax transcripts and signed personnel agreements')
                )
              ),
              h(
                'div',
                { className: 'data-table-container' },
                h(
                  'table',
                  { className: 'data-table' },
                  h(
                    'thead',
                    null,
                    h(
                      'tr',
                      null,
                      h('th', null, 'Document Title'),
                      h('th', null, 'Category'),
                      h('th', null, 'Filing Date'),
                      h('th', null, 'Status'),
                      h('th', null, 'Action')
                    )
                  ),
                  h(
                    'tbody',
                    null,
                    [
                      { title: '2025 Form W-2 Wage & Tax Statement', cat: 'Tax Document', date: 'Jan 22, 2026', status: 'Official Final' },
                      { title: 'Executive Offer Package & IP Covenant', cat: 'Contract', date: 'Nov 10, 2024', status: 'Countersigned' },
                      { title: 'Form I-9 Employment Eligibility Verification', cat: 'Compliance', date: 'Nov 14, 2024', status: 'E-Verified' },
                      { title: 'Direct Deposit Electronic Funds Authorization', cat: 'Payroll Banking', date: 'Nov 14, 2024', status: 'Active' }
                    ].map((doc, idx) =>
                      h(
                        'tr',
                        { key: idx },
                        h('td', null, h('strong', null, doc.title)),
                        h('td', null, doc.cat),
                        h('td', { className: 'tabular-nums' }, doc.date),
                        h('td', null, h('span', { className: 'status-indicator-tag' }, doc.status)),
                        h(
                          'td',
                          null,
                          h(
                            'button',
                            {
                              type: 'button',
                              className: 'btn-action-text',
                              onClick: () => triggerToast(`Downloading secure PDF for ${doc.title}...`)
                            },
                            'Download PDF'
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          )
      ),

      // Paystub Modal
      selectedStub &&
        h(
          'div',
          {
            className: 'modal-backdrop open',
            onClick: (e) => {
              if (e.target.classList.contains('modal-backdrop')) setSelectedStub(null);
            }
          },
          h(
            'div',
            { className: 'paystub-card' },
            h(
              'button',
              {
                type: 'button',
                className: 'btn-modal-close',
                onClick: () => setSelectedStub(null)
              },
              h(
                'svg',
                { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
                h('line', { x1: 18, y1: 6, x2: 6, y2: 18 }),
                h('line', { x1: 6, y1: 6, x2: 18, y2: 18 })
              )
            ),
            h(
              'div',
              { className: 'paystub-header-top' },
              h(
                'div',
                null,
                h('div', { className: 'paystub-company-title' }, 'LVO HOLDINGS'),
                h('div', { className: 'paystub-company-sub' }, 'Legion V. Omni-Operation Holdings · Houston, TX'),
                h('div', { style: { fontSize: '0.74rem', color: 'var(--ink-faint)', marginTop: '0.2rem' } }, 'Workforce Payroll Management · job.wearelvo.com')
              ),
              h(
                'div',
                { style: { textAlign: 'right' } },
                h('h3', { style: { fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)' } }, 'EARNINGS STATEMENT'),
                h('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'var(--gold-dark)' } }, selectedStub.id)
              )
            ),
            h(
              'div',
              { className: 'attr-matrix', style: { marginBottom: '1.25rem' } },
              h('div', null, h('div', { className: 'attr-label' }, 'Employee'), h('div', { className: 'attr-value' }, user.name)),
              h('div', null, h('div', { className: 'attr-label' }, 'Employee ID'), h('div', { className: 'attr-value tabular-nums' }, user.employeeId)),
              h('div', null, h('div', { className: 'attr-label' }, 'Pay Period'), h('div', { className: 'attr-value tabular-nums' }, selectedStub.period)),
              h('div', null, h('div', { className: 'attr-label' }, 'Pay Date'), h('div', { className: 'attr-value tabular-nums' }, selectedStub.payDate))
            ),
            h('div', { className: 'paystub-section-title' }, 'Earnings Breakdown'),
            h(
              'table',
              { className: 'data-table', style: { marginBottom: '1.25rem' } },
              h(
                'thead',
                null,
                h(
                  'tr',
                  null,
                  h('th', null, 'Description'),
                  h('th', null, 'Rate'),
                  h('th', null, 'Hours'),
                  h('th', null, 'Current Total'),
                  h('th', null, 'YTD Total')
                )
              ),
              h(
                'tbody',
                null,
                h(
                  'tr',
                  null,
                  h('td', null, 'Regular Salary (Semi-Monthly)'),
                  h('td', { className: 'tabular-nums' }, `$${selectedStub.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                  h('td', { className: 'tabular-nums' }, '86.67'),
                  h('td', { className: 'tabular-nums font-semibold' }, `$${selectedStub.gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`),
                  h('td', { className: 'tabular-nums font-semibold' }, '$131,250.00')
                )
              )
            ),
            h('div', { className: 'paystub-section-title' }, 'Statutory Taxes & Deductions'),
            h(
              'table',
              { className: 'data-table', style: { marginBottom: '1.25rem' } },
              h(
                'thead',
                null,
                h(
                  'tr',
                  null,
                  h('th', null, 'Tax / Deduction Item'),
                  h('th', null, 'Current Period'),
                  h('th', null, 'YTD Accumulated')
                )
              ),
              h(
                'tbody',
                null,
                h('tr', null, h('td', null, 'Federal Withholding Tax (W-4 Single)'), h('td', { className: 'tabular-nums' }, `$${selectedStub.fedTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`), h('td', { className: 'tabular-nums' }, '$20,743.20')),
                h('tr', null, h('td', null, 'Social Security (FICA 6.2%)'), h('td', { className: 'tabular-nums' }, `$${selectedStub.socSec.toLocaleString(undefined, { minimumFractionDigits: 2 })}`), h('td', { className: 'tabular-nums' }, '$8,137.44')),
                h('tr', null, h('td', null, 'Medicare (1.45%)'), h('td', { className: 'tabular-nums' }, `$${selectedStub.medicare.toLocaleString(undefined, { minimumFractionDigits: 2 })}`), h('td', { className: 'tabular-nums' }, '$1,903.14')),
                h('tr', null, h('td', null, '401(k) Retirement (6.0% Employee)'), h('td', { className: 'tabular-nums' }, `$${selectedStub.retirement.toLocaleString(undefined, { minimumFractionDigits: 2 })}`), h('td', { className: 'tabular-nums' }, '$7,875.00'))
              )
            ),
            h(
              'div',
              {
                style: {
                  background: 'var(--surface-subtle)',
                  border: '2px solid var(--border-strong)',
                  borderRadius: 6,
                  padding: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem'
                }
              },
              h(
                'div',
                null,
                h('span', { style: { fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)' } }, 'Net Take-Home Disbursement'),
                h('div', { className: 'tabular-nums', style: { fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald)' } }, `$${selectedStub.net.toLocaleString(undefined, { minimumFractionDigits: 2 })}`)
              ),
              h(
                'div',
                { style: { textAlign: 'right' } },
                h('span', { style: { fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--ink-muted)' } }, 'Disbursement Channel'),
                h('div', { style: { fontSize: '0.88rem', fontWeight: 600, color: 'var(--ink)' } }, 'Direct Deposit · Chase (••••4821)')
              )
            ),
            h(
              'div',
              { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' } },
              h('span', { style: { fontSize: '0.78rem', color: 'var(--ink-muted)' } }, 'Official digital statement generated by LVO Workforce System.'),
              h(
                'button',
                {
                  type: 'button',
                  className: 'btn-action-text',
                  style: { background: 'var(--ink)', color: '#fff', padding: '0.6rem 1.25rem' },
                  onClick: () => window.print()
                },
                'Print / Save Statement'
              )
            )
          )
        ),

      // Toast notification
      toastMessage &&
        h(
          'div',
          { className: 'toast-msg show' },
          h(
            'svg',
            { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
            h('polyline', { points: '20 6 9 17 4 12' })
          ),
          h('span', null, toastMessage)
        )
    );
  }

  // Expose component to global window
  global.HrDashboard = HrDashboard;
})(window);
