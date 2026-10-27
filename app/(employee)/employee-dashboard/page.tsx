"use client";

import {
  ArrowRight,
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  FileText,
  Megaphone,
  Plus,
  Target,
  TrendingUp,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";

const employee = {
  name: "Oluwatosin Akinbobola",
  role: "Junior Front End Engineer",
  department: "Technology",
  lineManager: "Daniel Adeyemi",
  initials: "OA",
};

const leaveBalance = [
  { label: "Annual leave", used: 6, total: 20, color: "bg-[#FDC517]" },
  { label: "Sick leave", used: 1, total: 10, color: "bg-[#8E9CCB]" },
  { label: "Casual leave", used: 2, total: 5, color: "bg-[#77A88C]" },
];

const leaveRequests = [
  { type: "Annual leave", dates: "Nov 9 – Nov 13, 2026", days: "5 days", status: "Pending" },
  { type: "Casual leave", dates: "Oct 12, 2026", days: "1 day", status: "Approved" },
  { type: "Annual leave", dates: "Sep 3 – Sep 4, 2026", days: "2 days", status: "Approved" },
];

const announcements = [
  {
    category: "Company update",
    title: "Q4 all-hands meeting",
    body: "Join the team for our quarterly update and business priorities.",
    date: "Oct 28, 2026",
    initials: "HR",
  },
  {
    category: "People & culture",
    title: "Update your personal information",
    body: "Please make sure your contact and emergency details are up to date.",
    date: "Oct 22, 2026",
    initials: "PE",
  },
];

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e9e9e5] bg-white p-5 shadow-[0_2px_10px_rgba(20,20,20,0.025)] sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-[#202024]">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-[#858585]">{subtitle}</p>}
        </div>
        {action && (
          <a href={action.href} className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-[#665000] hover:text-[#17171b]">
            {action.label}<ArrowRight size={15} />
          </a>
        )}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon: Icon,
  tint,
}: {
  label: string;
  value: string;
  note: string;
  icon: typeof CalendarDays;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e9e9e5] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-[#77777b]">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tint}`}><Icon size={18} /></span>
      </div>
      <p className="text-2xl font-semibold tracking-tight text-[#202024]">{value}</p>
      <p className="mt-1.5 text-xs text-[#858585]">{note}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Pending: "bg-[#fff5d1] text-[#8a6900]",
    Approved: "bg-[#e6f4eb] text-[#287548]",
    Rejected: "bg-[#fbe8e7] text-[#a23b35]",
    Draft: "bg-[#efeff1] text-[#66666c]",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] ?? styles.Draft}`}>{status}</span>;
}

export default function EmployeeDashboard() {
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const firstName = employee.name.split(" ")[0];
  const leaveRemaining = leaveBalance.reduce((sum, item) => sum + item.total - item.used, 0);

  return (
    <main className="min-w-0 bg-[#f7f7f5] px-4 pb-10 pt-6 text-[#202024] md:px-8">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs text-[#77777b]">{dateLabel}</p>
          <h1 className="text-2xl font-semibold tracking-tight text-[#17171b] sm:text-[28px]">Welcome back, {firstName}</h1>
          <p className="mt-2 text-sm text-[#77777b]">Here’s a quick look at your work, leave and upcoming activities.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/leave" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e3e3df] bg-white px-4 py-3 text-sm font-medium text-[#303034] transition hover:bg-[#fafaf8]"><CalendarDays size={16} /> Request leave</a>
          <a href="/my-appraisal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-3 text-sm font-semibold text-[#17171b] transition hover:bg-[#edb900]"><Plus size={16} /> My appraisal</a>
        </div>
      </div>

      <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Available leave" value="26 days" note="Across your leave types" icon={Wallet} tint="bg-[#fff5d1] text-[#806000]" />
        <MetricCard label="Attendance this month" value="96%" note="Good attendance so far" icon={CalendarCheck} tint="bg-[#e8f3eb] text-[#36764e]" />
        <MetricCard label="Leave requests" value="1 pending" note="One request awaiting approval" icon={Clock3} tint="bg-[#f7eadb] text-[#966b32]" />
        <MetricCard label="Appraisal progress" value="In progress" note="Q4 2026 self-appraisal" icon={Target} tint="bg-[#e9eaf8] text-[#6266a4]" />
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <Panel title="My appraisal" subtitle="Q4 2026 performance cycle" action={{ label: "Open appraisal", href: "/my-appraisal" }}>
          <div className="rounded-xl border border-[#eee4bf] bg-[#fffaf0] p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="flex gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FDC517] text-[#17171b]"><Target size={21} /></div>
                <div>
                  <p className="font-semibold text-[#27251f]">Self-appraisal submission</p>
                  <p className="mt-1 text-sm leading-6 text-[#777064]">Review your objectives, add your comments and complete your self-ratings before the deadline.</p>
                </div>
              </div>
              <StatusPill status="Draft" />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs text-[#777064]"><span>Completion</span><span>5 of 8 objectives</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-[#eee8d7]"><div className="h-full w-[62.5%] rounded-full bg-[#FDC517]" /></div>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee4bf] pt-4 text-sm">
              <span className="inline-flex items-center gap-2 text-[#777064]"><CalendarDays size={15} /> Deadline: Nov 6, 2026</span>
              <a href="/my-appraisal" className="inline-flex items-center gap-1 font-semibold text-[#665000] hover:text-[#17171b]">Continue appraisal <ArrowRight size={15} /></a>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#f7f7f5] p-3"><p className="text-xs text-[#858585]">Cycle</p><p className="mt-1 text-sm font-semibold">Q4 2026</p></div>
            <div className="rounded-xl bg-[#f7f7f5] p-3"><p className="text-xs text-[#858585]">Line manager</p><p className="mt-1 text-sm font-semibold">{employee.lineManager}</p></div>
            <div className="rounded-xl bg-[#f7f7f5] p-3"><p className="text-xs text-[#858585]">Review stage</p><p className="mt-1 text-sm font-semibold">Self-review</p></div>
          </div>
        </Panel>

        <Panel title="My profile" subtitle="Your work information" action={{ label: "View profile", href: "/profile" }}>
          <div className="flex items-center gap-4 border-b border-[#efefec] pb-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#202024] text-sm font-semibold text-white">{employee.initials}</div>
            <div className="min-w-0"><p className="font-semibold text-[#202024]">{employee.name}</p><p className="mt-1 text-sm text-[#77777b]">{employee.role}</p><p className="mt-1 text-xs text-[#96969a]">{employee.department}</p></div>
          </div>
          <div className="space-y-4 py-5">
            <div className="flex items-start gap-3"><span className="mt-0.5 text-[#77777b]"><UserRound size={17} /></span><div><p className="text-xs text-[#858585]">Reports to</p><p className="mt-1 text-sm font-medium">{employee.lineManager}</p></div></div>
            <div className="flex items-start gap-3"><span className="mt-0.5 text-[#77777b]"><UsersRound size={17} /></span><div><p className="text-xs text-[#858585]">Department</p><p className="mt-1 text-sm font-medium">{employee.department}</p></div></div>
            <div className="flex items-start gap-3"><span className="mt-0.5 text-[#77777b]"><TrendingUp size={17} /></span><div><p className="text-xs text-[#858585]">Employment status</p><p className="mt-1 text-sm font-medium">Active</p></div></div>
          </div>
          <p className="rounded-lg bg-[#f7f7f5] px-3 py-2.5 text-xs leading-5 text-[#77777b]">Profile information shown here is demo data for the current screen.</p>
        </Panel>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="My leave balance" subtitle="Leave used and remaining for this year" action={{ label: "Leave details", href: "/leave" }}>
          <div className="mb-5 flex items-center gap-4 rounded-xl bg-[#f7f7f5] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#806000]"><Wallet size={20} /></div>
            <div><p className="text-xs text-[#858585]">Total remaining across leave types</p><p className="mt-1 text-xl font-semibold">{leaveRemaining} days</p></div>
          </div>
          <div className="space-y-5">
            {leaveBalance.map((item) => {
              const remaining = item.total - item.used;
              const percent = (item.used / item.total) * 100;
              return <div key={item.label}>
                <div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-[#858585]">{remaining} remaining <span className="px-1">·</span> {item.used} used</p></div>
                <div className="h-2 overflow-hidden rounded-full bg-[#efefec]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} /></div>
              </div>;
            })}
          </div>
        </Panel>

        <Panel title="Recent leave requests" subtitle="Check the status of your submitted requests" action={{ label: "View all", href: "/leave" }}>
          <div className="divide-y divide-[#efefec]">
            {leaveRequests.map((request) => (
              <div key={`${request.type}-${request.dates}`} className="flex flex-col justify-between gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
                <div><p className="text-sm font-semibold">{request.type}</p><p className="mt-1 text-sm text-[#77777b]">{request.dates}</p><p className="mt-1 text-xs text-[#96969a]">{request.days}</p></div>
                <StatusPill status={request.status} />
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Announcements" subtitle="Updates from HR and the organisation" action={{ label: "All announcements", href: "/announcements" }}>
          <div className="space-y-4">
            {announcements.map((item) => (
              <article key={item.title} className="flex gap-3 rounded-xl border border-[#efefec] p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff5d1] text-xs font-semibold text-[#806000]">{item.initials}</div>
                <div className="min-w-0 flex-1"><div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-[11px] font-medium uppercase tracking-wide text-[#8b6a00]">{item.category}</span><span className="text-xs text-[#a0a0a0]">· {item.date}</span></div><h3 className="text-sm font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-5 text-[#77777b]">{item.body}</p></div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Quick links" subtitle="Common tasks you may need">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a href="/leave" className="group flex items-center gap-3 rounded-xl border border-[#efefec] p-4 transition hover:border-[#e8ce6c] hover:bg-[#fffdf5]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff5d1] text-[#806000]"><CalendarDays size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Request leave</span><span className="mt-1 block text-xs text-[#858585]">Submit time off</span></span><ArrowRight size={15} className="text-[#a0a0a0] transition group-hover:translate-x-0.5" /></a>
            <a href="/my-appraisal" className="group flex items-center gap-3 rounded-xl border border-[#efefec] p-4 transition hover:border-[#e8ce6c] hover:bg-[#fffdf5]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9eaf8] text-[#6266a4]"><Target size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">My appraisal</span><span className="mt-1 block text-xs text-[#858585]">Update self-review</span></span><ArrowRight size={15} className="text-[#a0a0a0] transition group-hover:translate-x-0.5" /></a>
            <a href="/documents" className="group flex items-center gap-3 rounded-xl border border-[#efefec] p-4 transition hover:border-[#e8ce6c] hover:bg-[#fffdf5]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e6f4eb] text-[#36764e]"><FileText size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">My documents</span><span className="mt-1 block text-xs text-[#858585]">View HR documents</span></span><ArrowRight size={15} className="text-[#a0a0a0] transition group-hover:translate-x-0.5" /></a>
            <a href="/announcements" className="group flex items-center gap-3 rounded-xl border border-[#efefec] p-4 transition hover:border-[#e8ce6c] hover:bg-[#fffdf5]"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f7eadb] text-[#966b32]"><Megaphone size={18} /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Announcements</span><span className="mt-1 block text-xs text-[#858585]">Company updates</span></span><ArrowRight size={15} className="text-[#a0a0a0] transition group-hover:translate-x-0.5" /></a>
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#f7f7f5] p-3 text-xs leading-5 text-[#77777b]"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#5c8c6a]" />Your dashboard is a personal view. If you are also a line manager, team review tasks can appear in an additional manager section without replacing your employee features.</div>
        </Panel>
      </section>
    </main>
  );
}
