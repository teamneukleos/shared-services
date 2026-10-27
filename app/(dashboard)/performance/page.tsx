"use client";

import { useMemo, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Filter,
  GitBranch,
  ListChecks,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Target,
  UsersRound,
  X,
} from "lucide-react";

type CycleStatus = "Active" | "Draft" | "Completed";
type AppraisalStatus =
  | "Not started"
  | "Self-appraisal"
  | "Manager review"
  | "Second-level review"
  | "HR review"
  | "Completed";
type TabKey = "overview" | "cycles" | "reviews" | "objectives";

type KRA = {
  id: number;
  title: string;
  description: string;
  weight: number;
};

type Cycle = {
  id: number;
  name: string;
  period: string;
  startDate: string;
  dueDate: string;
  status: CycleStatus;
  audience: string;
  total: number;
  submitted: number;
  managerReviews: number;
  completed: number;
};

type Appraisal = {
  id: number;
  employee: string;
  role: string;
  department: string;
  manager: string;
  secondLevelManager: string;
  cycle: string;
  status: AppraisalStatus;
  dueDate: string;
  progress: number;
};

const initialKras: KRA[] = [
  {
    id: 1,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Attend 100% of company-wide meetings, internal sessions and client meetings, with no more than 2 late office arrivals in the quarter.",
    weight: 10,
  },
  {
    id: 2,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Deliver at least 80% of assigned frontend tasks by agreed deadlines.",
    weight: 15,
  },
  {
    id: 3,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Record no more than 2 revisions per task due to avoidable errors.",
    weight: 10,
  },
  {
    id: 4,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Implement UI components that match approved designs with no more than 2 visual correction requests per task.",
    weight: 15,
  },
  {
    id: 5,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Resolve at least 5 assigned frontend bugs that are merged into production during the quarter.",
    weight: 10,
  },
  {
    id: 6,
    title: "Be known as a reliable junior engineer who delivers accurately and communicates clearly",
    description: "Proactively communicate blockers within 24 hours of discovery on 100% of tasks.",
    weight: 10,
  },
  {
    id: 7,
    title: "Build frontend skills and apply new learning",
    description: "Complete at least one relevant learning course and apply the learning to a production task.",
    weight: 15,
  },
  {
    id: 8,
    title: "Demonstrate growth mindset and initiative",
    description: "Improve delivery accuracy and confidence, and review at least one relevant full-stack trend or best practice.",
    weight: 15,
  },
];

const initialCycles: Cycle[] = [
  {
    id: 1,
    name: "Q4 2026 Performance Appraisal",
    period: "October – December 2026",
    startDate: "Oct 24, 2026",
    dueDate: "Dec 18, 2026",
    status: "Active",
    audience: "All employees",
    total: 48,
    submitted: 18,
    managerReviews: 12,
    completed: 6,
  },
  {
    id: 2,
    name: "Q3 2026 Performance Appraisal",
    period: "July – September 2026",
    startDate: "Jul 01, 2026",
    dueDate: "Sep 30, 2026",
    status: "Completed",
    audience: "All employees",
    total: 46,
    submitted: 46,
    managerReviews: 46,
    completed: 43,
  },
  {
    id: 3,
    name: "Mid-year Check-in 2026",
    period: "January – June 2026",
    startDate: "Jun 01, 2026",
    dueDate: "Jun 30, 2026",
    status: "Completed",
    audience: "All employees",
    total: 44,
    submitted: 44,
    managerReviews: 44,
    completed: 44,
  },
];

const initialAppraisals: Appraisal[] = [
  { id: 1, employee: "Amara Okafor", role: "Frontend Engineer", department: "Engineering", manager: "Daniel Adeyemi", secondLevelManager: "Michael James", cycle: "Q4 2026", status: "Self-appraisal", dueDate: "Nov 06, 2026", progress: 30 },
  { id: 2, employee: "Daniel Adeyemi", role: "Engineering Lead", department: "Engineering", manager: "Michael James", secondLevelManager: "Sarah Williams", cycle: "Q4 2026", status: "Manager review", dueDate: "Nov 06, 2026", progress: 55 },
  { id: 3, employee: "Grace Eze", role: "Marketing Executive", department: "Marketing", manager: "Sarah Williams", secondLevelManager: "Motola Olusoga", cycle: "Q4 2026", status: "Second-level review", dueDate: "Nov 06, 2026", progress: 75 },
  { id: 4, employee: "Sarah Williams", role: "Marketing Manager", department: "Marketing", manager: "Motola Olusoga", secondLevelManager: "—", cycle: "Q4 2026", status: "HR review", dueDate: "Nov 06, 2026", progress: 90 },
  { id: 5, employee: "Tunde Bello", role: "Product Designer", department: "Product", manager: "Michael James", secondLevelManager: "Sarah Williams", cycle: "Q4 2026", status: "Not started", dueDate: "Nov 06, 2026", progress: 0 },
  { id: 6, employee: "Esther Adebayo", role: "HR Officer", department: "Human Resources", manager: "Motola Olusoga", secondLevelManager: "—", cycle: "Q4 2026", status: "Completed", dueDate: "Nov 06, 2026", progress: 100 },
  { id: 7, employee: "David Okoro", role: "Backend Engineer", department: "Engineering", manager: "Daniel Adeyemi", secondLevelManager: "Michael James", cycle: "Q4 2026", status: "Self-appraisal", dueDate: "Nov 06, 2026", progress: 30 },
  { id: 8, employee: "Michael James", role: "Head of Engineering", department: "Engineering", manager: "Sarah Williams", secondLevelManager: "Motola Olusoga", cycle: "Q4 2026", status: "Second-level review", dueDate: "Nov 06, 2026", progress: 75 },
];

const statusStyles: Record<AppraisalStatus, string> = {
  "Not started": "bg-[#f2f2f4] text-[#666670]",
  "Self-appraisal": "bg-[#fff5cf] text-[#816100]",
  "Manager review": "bg-[#eaf1ff] text-[#315da8]",
  "Second-level review": "bg-[#f0eaff] text-[#6945a5]",
  "HR review": "bg-[#ffeadb] text-[#99521d]",
  Completed: "bg-[#e5f6ed] text-[#24784d]",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";
  return (
    <div className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-[#f3e8bd] font-semibold text-[#6e5600]`} aria-label={name}>
      {initials(name)}
    </div>
  );
}

function StatCard({ label, value, helper, icon: Icon, trend }: { label: string; value: string; helper: string; icon: typeof UsersRound; trend?: "up" | "down" }) {
  return (
    <div className="rounded-2xl border border-[#e8e8eb] bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-[#777780]">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#19191e]">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6d7] text-[#806100]"><Icon size={19} /></div>
      </div>
      <p className="mt-3 flex items-center gap-1 text-xs text-[#777780]">
        {trend === "up" ? <ArrowUpRight size={14} className="text-[#278153]" /> : trend === "down" ? <ArrowDownRight size={14} className="text-[#b56a35]" /> : null}
        {helper}
      </p>
    </div>
  );
}

export default function PerformancePage() {
  const [tab, setTab] = useState<TabKey>("overview");
  const [cycles, setCycles] = useState<Cycle[]>(initialCycles);
  const [appraisals, setAppraisals] = useState<Appraisal[]>(initialAppraisals);
  const [kras, setKras] = useState<KRA[]>(initialKras);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showKraModal, setShowKraModal] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<Appraisal | null>(null);
  const [cycleName, setCycleName] = useState("Q1 2027 Performance Appraisal");
  const [cyclePeriod, setCyclePeriod] = useState("January – March 2027");
  const [cycleDueDate, setCycleDueDate] = useState("2027-03-19");
  const [cycleAudience, setCycleAudience] = useState("All employees");
  const [kraTitle, setKraTitle] = useState("");
  const [kraDescription, setKraDescription] = useState("");
  const [kraWeight, setKraWeight] = useState("10");
  const [notice, setNotice] = useState("");

  const activeCycle = cycles.find((cycle) => cycle.status === "Active") ?? cycles[0];
  const filteredAppraisals = useMemo(() => appraisals.filter((item) => {
    const matchesSearch = `${item.employee} ${item.role} ${item.department} ${item.manager}`.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All statuses" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [appraisals, search, statusFilter]);

  const totalWeight = kras.reduce((sum, kra) => sum + kra.weight, 0);
  const submittedCount = appraisals.filter((item) => item.status !== "Not started").length;
  const managerReviewCount = appraisals.filter((item) => item.status === "Manager review" || item.status === "Second-level review" || item.status === "HR review" || item.status === "Completed").length;
  const completedCount = appraisals.filter((item) => item.status === "Completed").length;
  const pendingReviews = appraisals.filter((item) => item.status === "Manager review" || item.status === "Second-level review" || item.status === "HR review");

  function createCycle() {
    if (!cycleName.trim() || !cycleDueDate) return;
    const due = new Date(`${cycleDueDate}T00:00:00`);
    const newCycle: Cycle = {
      id: Date.now(),
      name: cycleName.trim(),
      period: cyclePeriod.trim() || "Period not specified",
      startDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      dueDate: due.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      status: "Draft",
      audience: cycleAudience,
      total: cycleAudience === "All employees" ? 48 : 12,
      submitted: 0,
      managerReviews: 0,
      completed: 0,
    };
    setCycles((current) => [newCycle, ...current]);
    setShowCycleModal(false);
    setTab("cycles");
    setNotice("Appraisal cycle created as a draft. Review the details before activating it.");
  }

  function addKra() {
    if (!kraTitle.trim() || !kraDescription.trim()) return;
    setKras((current) => [...current, { id: Date.now(), title: kraTitle.trim(), description: kraDescription.trim(), weight: Number(kraWeight) || 0 }]);
    setKraTitle("");
    setKraDescription("");
    setKraWeight("10");
    setShowKraModal(false);
    setNotice("Objective added to the appraisal template.");
  }

  function advanceReview(appraisal: Appraisal) {
    const nextStatus: Record<AppraisalStatus, AppraisalStatus> = {
      "Not started": "Self-appraisal",
      "Self-appraisal": "Manager review",
      "Manager review": "Second-level review",
      "Second-level review": "HR review",
      "HR review": "Completed",
      Completed: "Completed",
    };
    const next = nextStatus[appraisal.status];
    setAppraisals((current) => current.map((item) => item.id === appraisal.id ? { ...item, status: next, progress: next === "Completed" ? 100 : next === "HR review" ? 90 : next === "Second-level review" ? 75 : next === "Manager review" ? 55 : next === "Self-appraisal" ? 30 : item.progress } : item));
    setSelectedAppraisal({ ...appraisal, status: next, progress: next === "Completed" ? 100 : next === "HR review" ? 90 : next === "Second-level review" ? 75 : next === "Manager review" ? 55 : 30 });
    setNotice(`Demo workflow moved to ${next.toLowerCase()}.`);
  }

  function activateCycle(id: number) {
    setCycles((current) => current.map((cycle) => cycle.id === id ? { ...cycle, status: "Active" } : cycle.status === "Active" ? { ...cycle, status: "Draft" } : cycle));
    setNotice("Cycle status updated in this demo.");
  }

  const tabItems: { key: TabKey; label: string; icon: typeof Target }[] = [
    { key: "overview", label: "Overview", icon: Target },
    { key: "cycles", label: "Appraisal cycles", icon: CalendarDays },
    { key: "reviews", label: "Review queue", icon: ClipboardCheck },
    { key: "objectives", label: "KRA & objectives", icon: ListChecks },
  ];

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 pb-10 pt-6 text-[#19191e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.12em] text-[#85858d]">People / Performance</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Performance &amp; Appraisals</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777780]">Set appraisal cycles, track employee progress, and manage reviews across your organisation.</p>
          </div>
          <button onClick={() => setShowCycleModal(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold text-[#191919] transition hover:bg-[#edb900]">
            <Plus size={17} /> Create appraisal cycle
          </button>
        </div>

        {notice && (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#eadba6] bg-[#fff9e4] px-4 py-3 text-sm text-[#6e5600]">
            <p>{notice}</p><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={16} /></button>
          </div>
        )}

        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-[#e7e7ea]">
          {tabItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition ${tab === key ? "border-[#FDC517] text-[#19191e]" : "border-transparent text-[#777780] hover:text-[#29292f]"}`}>
              <Icon size={16} />{label}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Employees in cycle" value={String(activeCycle?.total ?? 0)} helper="Included in the active cycle" icon={UsersRound} />
              <StatCard label="Self-appraisals started" value={`${submittedCount}/${appraisals.length}`} helper={`${Math.round((submittedCount / Math.max(appraisals.length, 1)) * 100)}% have started or moved forward`} icon={FileText} trend="up" />
              <StatCard label="Reviews in progress" value={String(managerReviewCount - completedCount)} helper="Across manager, second-level and HR review" icon={GitBranch} />
              <StatCard label="Completed appraisals" value={String(completedCount)} helper="Final review completed" icon={CheckCircle2} trend="up" />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
              <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
                <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2"><h2 className="text-base font-semibold">Active appraisal cycle</h2><span className="rounded-full bg-[#e5f6ed] px-2.5 py-1 text-[11px] font-semibold text-[#24784d]">{activeCycle?.status ?? "No cycle"}</span></div>
                    <p className="mt-1 text-sm text-[#777780]">{activeCycle?.name ?? "Create a cycle to get started"}</p>
                  </div>
                  <button onClick={() => setTab("cycles")} className="inline-flex items-center gap-1 text-sm font-medium text-[#806100] hover:text-[#5e4800]">View cycle <ArrowRight size={15} /></button>
                </div>
                {activeCycle ? (
                  <>
                    <div className="mb-5 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-[#fafafa] p-4"><p className="text-xs text-[#777780]">Review period</p><p className="mt-2 text-sm font-semibold">{activeCycle.period}</p></div>
                      <div className="rounded-xl bg-[#fafafa] p-4"><p className="text-xs text-[#777780]">Self-appraisal deadline</p><p className="mt-2 text-sm font-semibold">{activeCycle.dueDate}</p></div>
                      <div className="rounded-xl bg-[#fafafa] p-4"><p className="text-xs text-[#777780]">Audience</p><p className="mt-2 text-sm font-semibold">{activeCycle.audience}</p></div>
                    </div>
                    <div className="space-y-5">
                      {[
                        { label: "Self-appraisals submitted", value: activeCycle.submitted, total: activeCycle.total, color: "bg-[#FDC517]" },
                        { label: "Manager reviews completed", value: activeCycle.managerReviews, total: activeCycle.total, color: "bg-[#6088d8]" },
                        { label: "Appraisals finalised", value: activeCycle.completed, total: activeCycle.total, color: "bg-[#4b9a70]" },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="mb-2 flex items-center justify-between gap-3 text-sm"><span className="text-[#55555e]">{item.label}</span><span className="font-semibold tabular-nums">{item.value}<span className="font-normal text-[#92929a]"> / {item.total}</span></span></div>
                          <div className="h-2 overflow-hidden rounded-full bg-[#f0f0f2]"><div className={`h-full rounded-full ${item.color}`} style={{ width: `${Math.min((item.value / Math.max(item.total, 1)) * 100, 100)}%` }} /></div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : <p className="text-sm text-[#777780]">There are no appraisal cycles yet.</p>}
              </section>

              <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
                <div className="mb-5 flex items-start justify-between"><div><h2 className="text-base font-semibold">Review workflow</h2><p className="mt-1 text-sm text-[#777780]">Each appraisal follows the reporting line.</p></div><GitBranch size={19} className="text-[#806100]" /></div>
                <div className="space-y-0">
                  {[
                    { n: "01", title: "Employee self-appraisal", detail: "Employee rates objectives and adds comments", icon: FileText },
                    { n: "02", title: "Line manager review", detail: "Direct manager reviews performance and gives feedback", icon: UsersRound },
                    { n: "03", title: "Second-level review", detail: "The manager’s own line manager reviews next", icon: GitBranch },
                    { n: "04", title: "HR review & finalisation", detail: "HR monitors progress and closes the appraisal", icon: ShieldCheck },
                  ].map((step, index, list) => {
                    const Icon = step.icon;
                    return <div key={step.n} className="flex gap-3"><div className="flex flex-col items-center"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${index === 0 ? "bg-[#fff5cf] text-[#806100]" : "bg-[#f3f3f5] text-[#666670]"}`}><Icon size={17} /></div>{index < list.length - 1 && <div className="my-1 min-h-6 w-px flex-1 bg-[#e7e7ea]" />}</div><div className="pb-5"><p className="text-sm font-semibold">{step.title}</p><p className="mt-1 text-xs leading-5 text-[#777780]">{step.detail}</p></div></div>;
                  })}
                </div>
                <div className="rounded-xl border border-[#eee2b5] bg-[#fffbeb] p-3 text-xs leading-5 text-[#725a08]">Review routing will use each employee’s assigned manager and the manager’s own reporting line once connected to the backend.</div>
              </section>
            </div>

            <section className="mt-6 rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
              <div className="mb-5 flex items-center justify-between gap-3"><div><h2 className="text-base font-semibold">Needs attention</h2><p className="mt-1 text-sm text-[#777780]">Appraisals waiting for a reviewer to take action.</p></div><button onClick={() => setTab("reviews")} className="text-sm font-medium text-[#806100] hover:text-[#5e4800]">Open review queue <ArrowRight size={14} className="ml-1 inline" /></button></div>
              <div className="divide-y divide-[#f0f0f2]">
                {pendingReviews.slice(0, 4).map((item) => <div key={item.id} className="flex flex-col gap-3 py-3 first:pt-0 sm:flex-row sm:items-center"><Avatar name={item.employee} /><div className="min-w-0 flex-1"><p className="text-sm font-medium">{item.employee}</p><p className="mt-1 text-xs text-[#777780]">{item.role} · {item.department}</p></div><div className="sm:w-48"><p className="text-xs text-[#777780]">Current reviewer stage</p><p className="mt-1 text-sm font-medium">{item.status}</p></div><button onClick={() => setSelectedAppraisal(item)} className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-[#e5e5e8] px-3 text-xs font-medium hover:bg-[#fafafa]">Review details <ChevronRight size={14} /></button></div>)}
                {pendingReviews.length === 0 && <p className="py-5 text-sm text-[#777780]">No pending reviews right now.</p>}
              </div>
            </section>
          </>
        )}

        {tab === "cycles" && (
          <section className="rounded-2xl border border-[#e8e8eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#ededf0] p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="font-semibold">Appraisal cycles</h2><p className="mt-1 text-sm text-[#777780]">Create and manage quarterly reviews and their deadlines.</p></div><button onClick={() => setShowCycleModal(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold"><Plus size={16} /> New cycle</button></div>
            <div className="divide-y divide-[#ededf0]">
              {cycles.map((cycle) => {
                const completion = cycle.total ? Math.round((cycle.completed / cycle.total) * 100) : 0;
                return <div key={cycle.id} className="p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div className="flex gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#fff6d7] text-[#806100]"><CalendarDays size={20} /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{cycle.name}</h3><span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cycle.status === "Active" ? "bg-[#e5f6ed] text-[#24784d]" : cycle.status === "Draft" ? "bg-[#f2f2f4] text-[#666670]" : "bg-[#eaf1ff] text-[#315da8]"}`}>{cycle.status}</span></div><p className="mt-1 text-sm text-[#777780]">{cycle.period} · {cycle.audience}</p><p className="mt-2 text-xs text-[#777780]">Created cycle starts {cycle.startDate} · Self-appraisal deadline {cycle.dueDate}</p></div></div><div className="flex items-center gap-2 self-start"><button onClick={() => { setTab("objectives"); }} className="rounded-lg border border-[#e5e5e8] px-3 py-2 text-xs font-medium hover:bg-[#fafafa]">View template</button>{cycle.status !== "Completed" && <button onClick={() => activateCycle(cycle.id)} className="rounded-lg bg-[#19191e] px-3 py-2 text-xs font-medium text-white hover:bg-[#33333a]">{cycle.status === "Active" ? "Set as active" : "Activate cycle"}</button>}<button aria-label="More cycle options" className="rounded-lg p-2 text-[#777780] hover:bg-[#f4f4f5]"><MoreHorizontal size={18} /></button></div></div><div className="mt-5 grid gap-3 sm:grid-cols-4"><div className="rounded-xl bg-[#fafafa] p-3"><p className="text-xs text-[#777780]">Employees</p><p className="mt-1 text-lg font-semibold">{cycle.total}</p></div><div className="rounded-xl bg-[#fafafa] p-3"><p className="text-xs text-[#777780]">Self-submitted</p><p className="mt-1 text-lg font-semibold">{cycle.submitted}</p></div><div className="rounded-xl bg-[#fafafa] p-3"><p className="text-xs text-[#777780]">Manager reviews</p><p className="mt-1 text-lg font-semibold">{cycle.managerReviews}</p></div><div className="rounded-xl bg-[#fafafa] p-3"><p className="text-xs text-[#777780]">Finalised</p><p className="mt-1 text-lg font-semibold">{cycle.completed}<span className="ml-1 text-xs font-normal text-[#777780]">({completion}%)</span></p></div></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#f0f0f2]"><div className="h-full rounded-full bg-[#FDC517]" style={{ width: `${completion}%` }} /></div></div>;
              })}
            </div>
          </section>
        )}

        {tab === "reviews" && (
          <section className="rounded-2xl border border-[#e8e8eb] bg-white">
            <div className="border-b border-[#ededf0] p-5 sm:p-6"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><h2 className="font-semibold">Appraisal review queue</h2><p className="mt-1 text-sm text-[#777780]">Track who has submitted and where each appraisal is in the approval chain.</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#92929a]"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." className="h-10 w-full rounded-xl border border-[#e5e5e8] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#c7a000] sm:w-56" /></label><label className="relative"><Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#92929a]"/><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 w-full appearance-none rounded-xl border border-[#e5e5e8] bg-white pl-9 pr-8 text-sm outline-none focus:border-[#c7a000] sm:w-48"><option>All statuses</option>{Object.keys(statusStyles).map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#92929a]"/></label></div></div></div>
            <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[980px] text-left"><thead className="bg-[#fafafa] text-[11px] uppercase tracking-wide text-[#85858d]"><tr><th className="px-6 py-3 font-medium">Employee</th><th className="px-4 py-3 font-medium">Reporting manager</th><th className="px-4 py-3 font-medium">Next-level reviewer</th><th className="px-4 py-3 font-medium">Status</th><th className="px-4 py-3 font-medium">Progress</th><th className="px-4 py-3 font-medium">Due date</th><th className="px-4 py-3"></th></tr></thead><tbody className="divide-y divide-[#f0f0f2]">{filteredAppraisals.map((item) => <tr key={item.id} className="hover:bg-[#fdfdfd]"><td className="px-6 py-4"><div className="flex items-center gap-3"><Avatar name={item.employee} size="sm"/><div><p className="text-sm font-medium">{item.employee}</p><p className="mt-1 text-xs text-[#777780]">{item.role}</p></div></div></td><td className="px-4 py-4 text-sm text-[#55555e]">{item.manager}</td><td className="px-4 py-4 text-sm text-[#55555e]">{item.secondLevelManager}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[item.status]}`}>{item.status}</span></td><td className="px-4 py-4"><div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#ededf0]"><div className="h-full rounded-full bg-[#FDC517]" style={{ width: `${item.progress}%` }} /></div><span className="text-xs text-[#777780]">{item.progress}%</span></div></td><td className="px-4 py-4 text-sm text-[#55555e]">{item.dueDate}</td><td className="px-4 py-4"><button onClick={() => setSelectedAppraisal(item)} className="rounded-lg p-2 text-[#777780] hover:bg-[#f1f1f3]" aria-label={`Open ${item.employee} appraisal`}><ChevronRight size={17}/></button></td></tr>)}</tbody></table></div>
            <div className="divide-y divide-[#f0f0f2] md:hidden">{filteredAppraisals.map((item) => <button key={item.id} onClick={() => setSelectedAppraisal(item)} className="flex w-full items-start gap-3 p-4 text-left"><Avatar name={item.employee}/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.employee}</p><span className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusStyles[item.status]}`}>{item.status}</span></div><p className="mt-1 text-xs text-[#777780]">{item.role} · {item.department}</p><p className="mt-2 text-xs text-[#777780]">Manager: {item.manager}</p><div className="mt-3 flex items-center gap-2"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ededf0]"><div className="h-full rounded-full bg-[#FDC517]" style={{ width: `${item.progress}%` }} /></div><span className="text-xs text-[#777780]">{item.progress}%</span></div></div><ChevronRight size={17} className="mt-2 shrink-0 text-[#9999a1]"/></button>)}</div>
            {filteredAppraisals.length === 0 && <p className="p-8 text-center text-sm text-[#777780]">No appraisals match your search.</p>}
            <div className="border-t border-[#ededf0] px-5 py-3 text-xs text-[#777780]">Showing {filteredAppraisals.length} of {appraisals.length} appraisals · Demo data</div>
          </section>
        )}

        {tab === "objectives" && (
          <section className="rounded-2xl border border-[#e8e8eb] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#ededf0] p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="font-semibold">KRA &amp; appraisal objectives</h2><p className="mt-1 text-sm text-[#777780]">Manage the objectives and weightages used in an appraisal template.</p></div><button onClick={() => setShowKraModal(true)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold"><Plus size={16}/> Add objective</button></div>
            <div className="flex flex-col gap-2 border-b border-[#ededf0] bg-[#fafafa] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div className="flex items-center gap-2 text-sm font-medium"><Settings2 size={16} className="text-[#806100]"/> Q4 2026 appraisal template</div><div className={`text-xs font-medium ${totalWeight === 100 ? "text-[#24784d]" : "text-[#a45b25]"}`}>Total weightage: {totalWeight}% {totalWeight === 100 ? "· Balanced" : "· Should total 100%"}</div></div>
            <div className="divide-y divide-[#ededf0]">{kras.map((kra, index) => <div key={kra.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:px-6"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f4f5] text-xs font-semibold text-[#65656d]">{String(index + 1).padStart(2, "0")}</div><div className="min-w-0 flex-1"><h3 className="text-sm font-semibold leading-6">{kra.title} {index + 1}</h3><p className="mt-2 text-sm leading-6 text-[#65656d]">{kra.description}</p><div className="mt-3 flex items-center gap-2 text-xs text-[#85858d]"><Target size={14}/> Key result area</div></div><div className="flex items-center justify-between gap-3 sm:w-36 sm:justify-end"><div className="sm:text-right"><p className="text-xs text-[#85858d]">Weightage</p><p className="mt-1 text-lg font-semibold">{kra.weight}%</p></div><button onClick={() => setKras((current) => current.filter((item) => item.id !== kra.id))} className="rounded-lg p-2 text-[#8a8a92] hover:bg-[#fff0f0] hover:text-[#a63e3e]" title="Remove objective"><X size={16}/></button></div></div>)}</div>
            <div className="flex flex-col justify-between gap-3 border-t border-[#ededf0] bg-[#fafafa] p-5 sm:flex-row sm:items-center sm:px-6"><p className="text-xs leading-5 text-[#777780]">Objectives are mock template data for now. In the live app, HR can create templates by role, department or appraisal cycle.</p><button onClick={() => setNotice(totalWeight === 100 ? "Objective template saved in this demo." : `Template weightage is currently ${totalWeight}%. Adjust objectives so the total equals 100%.`)} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#19191e] px-4 text-sm font-medium text-white hover:bg-[#33333a]"><Check size={16}/> Save template</button></div>
          </section>
        )}

        <p className="mt-6 text-center text-[11px] text-[#92929a]">Neukleos People · Performance &amp; Appraisals · Demo data</p>
      </div>

      {showCycleModal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"><div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#ededf0] p-5 sm:p-6"><div><h2 className="text-lg font-semibold">Create appraisal cycle</h2><p className="mt-1 text-sm text-[#777780]">Set the period, audience and deadline. You can activate the cycle after reviewing it.</p></div><button onClick={() => setShowCycleModal(false)} className="rounded-lg p-2 text-[#777780] hover:bg-[#f4f4f5]"><X size={18}/></button></div><div className="space-y-4 p-5 sm:p-6"><label className="block"><span className="mb-1.5 block text-sm font-medium">Cycle name</span><input value={cycleName} onChange={(event) => setCycleName(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] px-3 text-sm outline-none focus:border-[#c7a000]" placeholder="e.g. Q4 2026 Performance Appraisal"/></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Review period</span><input value={cyclePeriod} onChange={(event) => setCyclePeriod(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] px-3 text-sm outline-none focus:border-[#c7a000]" placeholder="e.g. October – December 2026"/></label><div className="grid gap-4 sm:grid-cols-2"><label className="block"><span className="mb-1.5 block text-sm font-medium">Self-appraisal deadline</span><input type="date" value={cycleDueDate} onChange={(event) => setCycleDueDate(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] px-3 text-sm outline-none focus:border-[#c7a000]"/></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Who is included?</span><select value={cycleAudience} onChange={(event) => setCycleAudience(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] bg-white px-3 text-sm outline-none focus:border-[#c7a000]"><option>All employees</option><option>Engineering</option><option>Marketing</option><option>Human Resources</option><option>Finance</option><option>Selected employees</option></select></label></div><div className="rounded-xl border border-[#eee2b5] bg-[#fffbeb] p-3 text-xs leading-5 text-[#725a08]">New cycles are saved as drafts in this frontend demo. Before going live, HR should assign the objective template, set each review-stage deadline, and choose the required approval levels.</div></div><div className="flex justify-end gap-2 border-t border-[#ededf0] p-5 sm:px-6"><button onClick={() => setShowCycleModal(false)} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Cancel</button><button onClick={createCycle} disabled={!cycleName.trim() || !cycleDueDate} className="h-10 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50">Create draft cycle</button></div></div></div>}

      {showKraModal && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"><div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-[#ededf0] p-5 sm:p-6"><div><h2 className="text-lg font-semibold">Add appraisal objective</h2><p className="mt-1 text-sm text-[#777780]">Add a KRA title, measurable expectation and weightage.</p></div><button onClick={() => setShowKraModal(false)} className="rounded-lg p-2 text-[#777780] hover:bg-[#f4f4f5]"><X size={18}/></button></div><div className="space-y-4 p-5 sm:p-6"><label className="block"><span className="mb-1.5 block text-sm font-medium">KRA / objective title</span><input value={kraTitle} onChange={(event) => setKraTitle(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] px-3 text-sm outline-none focus:border-[#c7a000]" placeholder="e.g. Improve delivery quality"/></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Description / expected result</span><textarea value={kraDescription} onChange={(event) => setKraDescription(event.target.value)} rows={4} className="w-full resize-y rounded-xl border border-[#e2e2e6] px-3 py-2.5 text-sm outline-none focus:border-[#c7a000]" placeholder="Describe how this objective will be measured..."/></label><label className="block"><span className="mb-1.5 block text-sm font-medium">Weightage (%)</span><input type="number" min="0" max="100" value={kraWeight} onChange={(event) => setKraWeight(event.target.value)} className="h-11 w-full rounded-xl border border-[#e2e2e6] px-3 text-sm outline-none focus:border-[#c7a000]"/></label></div><div className="flex justify-end gap-2 border-t border-[#ededf0] p-5 sm:px-6"><button onClick={() => setShowKraModal(false)} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Cancel</button><button onClick={addKra} disabled={!kraTitle.trim() || !kraDescription.trim()} className="h-10 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50">Add objective</button></div></div></div>}

      {selectedAppraisal && <div className="fixed inset-0 z-50 flex justify-end bg-black/40"><button className="absolute inset-0 cursor-default" onClick={() => setSelectedAppraisal(null)} aria-label="Close appraisal details"/><aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl"><div className="sticky top-0 flex items-center justify-between border-b border-[#ededf0] bg-white p-5"><div><p className="text-xs text-[#777780]">Q4 2026 appraisal</p><h2 className="mt-1 text-lg font-semibold">Appraisal details</h2></div><button onClick={() => setSelectedAppraisal(null)} className="rounded-lg p-2 hover:bg-[#f4f4f5]"><X size={18}/></button></div><div className="p-5 sm:p-6"><div className="flex items-center gap-3"><Avatar name={selectedAppraisal.employee} size="lg"/><div><h3 className="font-semibold">{selectedAppraisal.employee}</h3><p className="mt-1 text-sm text-[#777780]">{selectedAppraisal.role} · {selectedAppraisal.department}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${statusStyles[selectedAppraisal.status]}`}>{selectedAppraisal.status}</span></div></div><div className="mt-6 rounded-xl border border-[#e8e8eb] p-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="text-[#777780]">Overall progress</span><span className="font-semibold">{selectedAppraisal.progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-[#f0f0f2]"><div className="h-full rounded-full bg-[#FDC517]" style={{ width: `${selectedAppraisal.progress}%` }}/></div></div><h3 className="mb-3 mt-7 text-sm font-semibold">Reporting &amp; review route</h3><div className="space-y-3">{[{ title: "Employee", name: selectedAppraisal.employee, detail: "Self-appraisal" },{ title: "Line manager", name: selectedAppraisal.manager, detail: "First review" },{ title: "Next-level reviewer", name: selectedAppraisal.secondLevelManager, detail: "Manager’s line manager" },{ title: "HR", name: "HR Admin", detail: "Final review and closure" }].map((step, index) => <div key={`${step.title}-${index}`} className="flex gap-3 rounded-xl border border-[#ededf0] p-3"><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${index === 0 ? "bg-[#fff5cf] text-[#806100]" : "bg-[#f4f4f5] text-[#666670]"}`}>{index === 0 ? <FileText size={16}/> : index === 3 ? <ShieldCheck size={16}/> : <UsersRound size={16}/>}</div><div className="min-w-0 flex-1"><p className="text-xs text-[#777780]">{step.title}</p><p className="mt-1 text-sm font-medium">{step.name}</p><p className="mt-1 text-xs text-[#777780]">{step.detail}</p></div>{index === 0 && selectedAppraisal.progress > 0 && <CheckCircle2 size={17} className="text-[#278153]"/>}</div>)}</div><div className="mt-6 rounded-xl bg-[#fafafa] p-4"><div className="flex items-center gap-2"><MessageSquareText size={16} className="text-[#806100]"/><h3 className="text-sm font-semibold">Reviewer notes</h3></div><p className="mt-2 text-sm leading-6 text-[#777780]">Feedback and ratings will appear here as each reviewer completes their stage. The full review history will be stored by the backend.</p></div><div className="mt-6 flex flex-col gap-2 sm:flex-row">{selectedAppraisal.status !== "Completed" && <button onClick={() => advanceReview(selectedAppraisal)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold text-[#191919]">Demo: advance to next stage <ArrowRight size={16}/></button>}<button onClick={() => { setSelectedAppraisal(null); setTab("objectives"); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#e5e5e8] px-4 text-sm font-medium"><ListChecks size={16}/> View objectives</button></div><p className="mt-3 text-[11px] leading-5 text-[#92929a]">The advance button is for UI testing only. Live review permissions and routing will be controlled by the backend.</p></div></aside></div>}
    </main>
  );
}
