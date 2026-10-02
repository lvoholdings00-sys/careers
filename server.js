import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Explicit route for /index
app.get('/index', (req, res) => {
  res.type('html');
  res.sendFile(path.join(__dirname, 'index'));
});

// Body parser
app.use(express.json());

// Explicit routes for Workforce HR & Payroll Dashboard (job.wearelvo.com)
app.get(['/dashboard', '/job', '/job.wearelvo.com', '/portal'], (req, res) => {
  res.type('html');
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API Route: Current authenticated user positions, payroll summary & 12-month compensation trends
app.get('/api/dashboard/me', (req, res) => {
  const userParam = req.query.user || 'Marcus Sterling';
  let displayName = 'Marcus Sterling';
  let initials = 'MS';
  let email = 'm.sterling@wearelvo.com';

  if (userParam && userParam !== 'undefined') {
    const raw = decodeURIComponent(userParam);
    const cleaned = raw.includes('@') ? raw.split('@')[0] : raw;
    displayName = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    const words = displayName.split(/\s+/);
    initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : displayName.slice(0, 2).toUpperCase();
    email = raw.includes('@') ? raw : `${cleaned.toLowerCase().replace(/\s+/g, '.')}@wearelvo.com`;
  }

  const payload = {
    user: {
      name: displayName,
      email: email,
      employeeId: "LVO-EMP-8842",
      initials: initials,
      department: "Core Systems Architecture",
      hireDate: "Nov 14, 2024",
      status: "Active Full-Time"
    },
    currentPosition: {
      title: "Senior Systems Architect",
      division: "Development & Systems",
      classification: "Exempt · Salaried",
      workplace: "Hybrid (2 days HQ / 3 days Remote)",
      manager: "Eleanor Ross (VP Tech Infrastructure)",
      departmentCode: "CORP-DEV-004",
      flsa: "Exempt Professional",
      annualSalary: 175000,
      semiMonthlyGross: 7291.67,
      responsibilities: [
        "Lead high-availability distributed systems architecture across LVO digital portals including job.wearelvo.com and careers.wearelvo.com.",
        "Oversee Cloudflare edge workers, zero-trust token authentication, and Postgres Cloud SQL integrations.",
        "Mentor junior software engineers and conduct weekly architecture review panels for corporate divisions."
      ]
    },
    payrollSummary: {
      annualSalary: 175000,
      semiMonthlyGross: 7291.67,
      netPay: 5142.30,
      ytdGross: 131250.00,
      ytdTaxes: 32840.10,
      ytdRetirement: 7875.00,
      nextPayDate: "Oct 15, 2026",
      depositAccount: "JPMorgan Chase Bank, N.A. (••••4821)",
      ptoBalance: 18.5,
      sickBalance: 5.0
    },
    payrollTrends12Months: [
      { month: "Oct 2025", shortMonth: "Oct '25", gross: 13750, net: 9780, deductions: 3970 },
      { month: "Nov 2025", shortMonth: "Nov '25", gross: 13750, net: 9780, deductions: 3970 },
      { month: "Dec 2025", shortMonth: "Dec '25", gross: 16250, net: 11560, deductions: 4690 },
      { month: "Jan 2026", shortMonth: "Jan '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Feb 2026", shortMonth: "Feb '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Mar 2026", shortMonth: "Mar '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Apr 2026", shortMonth: "Apr '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "May 2026", shortMonth: "May '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Jun 2026", shortMonth: "Jun '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Jul 2026", shortMonth: "Jul '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Aug 2026", shortMonth: "Aug '26", gross: 14583, net: 10285, deductions: 4298 },
      { month: "Sep 2026", shortMonth: "Sep '26", gross: 14583, net: 10285, deductions: 4298 }
    ],
    internalApplications: [
      {
        title: "Principal Cloud Architect",
        division: "Development & Systems",
        dateApplied: "Sep 18, 2026",
        stage: "Interview Panel (Round 3 of 4)",
        lead: "Eleanor Ross (VP Tech)",
        status: "Active"
      },
      {
        title: "Operations & Facilities Director",
        division: "Facilities & Logistics",
        dateApplied: "Aug 22, 2026",
        stage: "Transferred to Talent Pool",
        lead: "David Vance (COO)",
        status: "Archived"
      }
    ],
    payStatements: [
      {
        id: "STUB-2026-0930",
        payDate: "Sep 30, 2026",
        period: "Sep 16, 2026 – Sep 30, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      },
      {
        id: "STUB-2026-0915",
        payDate: "Sep 15, 2026",
        period: "Sep 01, 2026 – Sep 15, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      },
      {
        id: "STUB-2026-0831",
        payDate: "Aug 31, 2026",
        period: "Aug 16, 2026 – Aug 31, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      },
      {
        id: "STUB-2026-0815",
        payDate: "Aug 15, 2026",
        period: "Aug 01, 2026 – Aug 15, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      },
      {
        id: "STUB-2026-0731",
        payDate: "Jul 31, 2026",
        period: "Jul 16, 2026 – Jul 31, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      },
      {
        id: "STUB-2026-0715",
        payDate: "Jul 15, 2026",
        period: "Jul 01, 2026 – Jul 15, 2026",
        gross: 7291.67,
        fedTax: 1152.40,
        socSec: 452.08,
        medicare: 105.73,
        retirement: 437.50,
        otherDeductions: 1.66,
        net: 5142.30,
        status: "Cleared (Direct Deposit)"
      }
    ]
  };

  res.json(payload);
});

// Serve local vendor dependencies (react, react-dom, recharts)
app.use('/vendor', express.static(path.join(__dirname, 'node_modules')));

// Serve static assets and files
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// Fallback to index.html for root or unmatched routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});
