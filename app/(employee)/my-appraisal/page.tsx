"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  MessageSquareText,
  Save,
  Send,
  ShieldCheck,
  Target,
  UserRound,
} from "lucide-react";

type Rating = "" | "1" | "2" | "3" | "4" | "5";
type KRA = {
  id: number;
  title: string;
  description: string;
  weight: number;
};

type Response = { rating: Rating; comment: string };
type Tab = "kra" | "values" | "feedback" | "summary";

const kras: KRA[] = [
  {
    id: 1,
    title: "Reliable delivery and clear communication",
    description: "Attend 100% of company-wide meetings, internal sessions and client meetings, with no more than 2 late office arrivals in the quarter.",
    weight: 10,
  },
  {
    id: 2,
    title: "Deliver frontend tasks on time",
    description: "Deliver at least 80% of assigned frontend tasks by agreed deadlines.",
    weight: 15,
  },
  {
    id: 3,
    title: "Reduce avoidable revisions",
    description: "Record no more than 2 revisions per task due to avoidable errors.",
    weight: 10,
  },
  {
    id: 4,
    title: "Build accurate user interfaces",
    description: "Implement UI components that match approved designs with no more than 2 visual correction requests per task.",
    weight: 15,
  },
  {
    id: 5,
    title: "Resolve production bugs",
    description: "Resolve at least 5 assigned frontend bugs that are merged into production during the quarter.",
    weight: 10,
  },
  {
    id: 6,
    title: "Communicate blockers early",
    description: "Proactively communicate blockers within 24 hours of discovery on 100% of tasks.",
    weight: 10,
  },
  {
    id: 7,
    title: "Build skills and apply learning",
    description: "Complete at least one relevant learning course and apply the learning to a production task.",
    weight: 15,
  },
  {
    id: 8,
    title: "Show initiative and a growth mindset",
    description: "Improve delivery accuracy and confidence, and review at least one relevant full-stack trend or best practice.",
    weight: 15,
  },
];

const values = [
  { id: "teamwork", title: "Teamwork", description: "I work respectfully with colleagues, share information and contribute to shared goals." },
  { id: "ownership", title: "Ownership", description: "I take responsibility for my tasks, communicate progress and follow through on commitments." },
  { id: "learning", title: "Learning and adaptability", description: "I seek feedback, learn from mistakes and apply new knowledge to my work." },
  { id: "integrity", title: "Integrity", description: "I communicate honestly and handle responsibilities with care." },
];

const ratingOptions = [
  { value: "1", label: "1 · Needs improvement" },
  { value: "2", label: "2 · Developing" },
  { value: "3", label: "3 · Meets expectations" },
  { value: "4", label: "4 · Exceeds expectations" },
  { value: "5", label: "5 · Outstanding" },
];

const tabs: { id: Tab; label: string; icon: typeof Target }[] = [
  { id: "kra", label: "KRA & Objectives", icon: Target },
  { id: "values", label: "Core Values", icon: ShieldCheck },
  { id: "feedback", label: "Feedback", icon: MessageSquareText },
  { id: "summary", label: "Appraisal Summary", icon: FileText },
];

export default function EmployeeSelfAppraisalPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kra");
  const [responses, setResponses] = useState<Record<number, Response>>(
    Object.fromEntries(kras.map((kra) => [kra.id, { rating: "", comment: "" }])) as Record<number, Response>,
  );
  const [valueRatings, setValueRatings] = useState<Record<string, Rating>>({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [support, setSupport] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const completedKras = kras.filter((kra) => responses[kra.id]?.rating && responses[kra.id]?.comment.trim()).length;
  const ratedValues = values.filter((value) => valueRatings[value.id]).length;
  const totalWeight = kras.reduce((sum, kra) => sum + kra.weight, 0);
  const weightedScore = useMemo(() => {
    const scored = kras.filter((kra) => responses[kra.id]?.rating);
    if (!scored.length) return null;
    const score = scored.reduce((sum, kra) => sum + Number(responses[kra.id].rating) * kra.weight, 0);
    const weight = scored.reduce((sum, kra) => sum + kra.weight, 0);
    return weight ? (score / weight).toFixed(1) : null;
  }, [responses]);

  function updateResponse(id: number, field: keyof Response, value: string) {
    setResponses((current) => ({
      ...current,
      [id]: { ...current[id], [field]: value },
    }));
    setSavedAt(null);
  }

  function saveDraft() {
    setSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    setNotice("Your progress has been saved in this demo.");
    window.setTimeout(() => setNotice(""), 3500);
  }

  function submitAppraisal() {
    setSubmitted(true);
    setShowSubmitConfirm(false);
    setNotice("Self-appraisal submitted. It is now awaiting your line manager’s review in this demo.");
  }

  const canSubmit = completedKras === kras.length && ratedValues === values.length && strengths.trim().length > 0 && improvements.trim().length > 0;

  return (
    <main className="min-h-screen bg-[#f8f8fa] px-4 pb-10 pt-6 text-[#19191e] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8a6900]">Employee self-appraisal</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Q4 2026 Performance Appraisal</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#777780]">Review your objectives for the quarter, rate your performance and add comments before sending it to your line manager.</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button onClick={saveDraft} disabled={submitted} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-[#e2e2e6] bg-white px-4 text-sm font-medium hover:bg-[#f4f4f5] disabled:opacity-50"><Save size={16} /> Save draft</button>
            <button onClick={() => setShowSubmitConfirm(true)} disabled={submitted || !canSubmit} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold text-[#191919] hover:bg-[#efbd13] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16} /> Submit appraisal</button>
          </div>
        </div>

        {notice && <div role="status" className="mb-5 flex items-start gap-2 rounded-xl border border-[#e8dfb9] bg-[#fffbeb] p-3 text-sm leading-5 text-[#725a08]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{notice}</div>}

        <section className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff3c4] text-lg font-semibold text-[#806100]">OA</div>
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Oluwatosin Akinbobola</h2>
                <p className="mt-1 text-sm text-[#777780]">Junior Front End Engineer · Engineering</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#777780]"><span className="inline-flex items-center gap-1.5"><UserRound size={14} /> Reports to Daniel Adeyemi</span><span className="inline-flex items-center gap-1.5"><CalendarDays size={14} /> Oct 1 – Dec 31, 2026</span></div>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${submitted ? "bg-[#e5f6ed] text-[#24784d]" : "bg-[#fff5cf] text-[#816100]"}`}>{submitted ? "Submitted" : "In progress"}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm text-[#777780]">Self-appraisal progress</p><p className="mt-1 text-2xl font-semibold">{Math.round(((completedKras + ratedValues) / (kras.length + values.length)) * 100)}%</p></div><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff6d7] text-[#806100]"><Clock3 size={19} /></div></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f0f0f2]"><div className="h-full rounded-full bg-[#FDC517] transition-all" style={{ width: `${((completedKras + ratedValues) / (kras.length + values.length)) * 100}%` }} /></div>
            <div className="mt-3 flex items-center justify-between text-xs text-[#777780]"><span>{completedKras} of {kras.length} objectives completed</span><span>Due Nov 6, 2026</span></div>
            {savedAt && <p className="mt-2 text-[11px] text-[#278153]">Draft saved at {savedAt}</p>}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-[#e8e8eb] bg-white p-4 sm:p-5">
          <div className="mb-3 flex items-center gap-2"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f4f4f5]"><ShieldCheck size={16} /></div><div><h2 className="text-sm font-semibold">Your review route</h2><p className="text-xs text-[#777780]">Your appraisal moves through the reporting line after you submit it.</p></div></div>
          <div className="grid gap-3 sm:grid-cols-4">
            {[{ title: "You", name: "Self-appraisal", state: submitted ? "Submitted" : "Current step", active: !submitted, done: submitted }, { title: "Daniel Adeyemi", name: "Line manager review", state: submitted ? "Next" : "Waiting for submission", active: submitted, done: false }, { title: "Next-level manager", name: "Second-level review", state: "Upcoming", active: false, done: false }, { title: "HR", name: "Final review", state: "Upcoming", active: false, done: false }].map((step, index) => <div key={step.title} className={`flex gap-3 rounded-xl border p-3 ${step.active ? "border-[#e8d477] bg-[#fffbeb]" : step.done ? "border-[#bfe5ce] bg-[#f0faf4]" : "border-[#ededf0] bg-white"}`}><div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.done ? "bg-[#d8f2e2] text-[#24784d]" : step.active ? "bg-[#FDC517] text-[#191919]" : "bg-[#f1f1f3] text-[#777780]"}`}>{step.done ? <Check size={16} /> : index === 3 ? <ShieldCheck size={16} /> : <UserRound size={16} />}</div><div className="min-w-0"><p className="text-xs font-semibold">{step.title}</p><p className="mt-1 text-xs text-[#777780]">{step.name}</p><p className={`mt-2 text-[10px] font-medium ${step.active ? "text-[#806100]" : step.done ? "text-[#24784d]" : "text-[#92929a]"}`}>{step.state}</p></div></div>)}
          </div>
        </section>

        <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-[#e8e8eb] bg-white p-1.5">
          {tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setActiveTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition sm:px-4 ${activeTab === id ? "bg-[#19191e] text-white" : "text-[#777780] hover:bg-[#f5f5f6] hover:text-[#19191e]"}`}><Icon size={15} />{label}</button>)}
        </div>

        {activeTab === "kra" && <section className="space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><h2 className="text-lg font-semibold">KRA &amp; Objectives</h2><p className="mt-1 text-sm text-[#777780]">Rate each objective and explain what you achieved during the quarter.</p></div><p className={`text-sm font-semibold ${totalWeight === 100 ? "text-[#278153]" : "text-[#b56a35]"}`}>Total weightage: {totalWeight}%</p></div>
          {kras.map((kra, index) => <article key={kra.id} className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#fff6d7] text-sm font-semibold text-[#806100]">{String(index + 1).padStart(2, "0")}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="max-w-3xl font-semibold leading-6">{kra.title}</h3><span className="shrink-0 rounded-lg bg-[#f5f5f6] px-2.5 py-1.5 text-xs font-semibold">{kra.weight}% weight</span></div><p className="mt-2 text-sm leading-6 text-[#777780]">{kra.description}</p>
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]"><label className="block"><span className="mb-1.5 block text-xs font-semibold">Your rating <span className="text-[#b42318]">*</span></span><select value={responses[kra.id].rating} onChange={(event) => updateResponse(kra.id, "rating", event.target.value)} disabled={submitted} className="h-11 w-full rounded-xl border border-[#e2e2e6] bg-white px-3 text-sm outline-none focus:border-[#c7a000] disabled:bg-[#f5f5f6]"><option value="">Select a rating</option>{ratingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-xs font-semibold">Comments / evidence <span className="text-[#b42318]">*</span></span><textarea value={responses[kra.id].comment} onChange={(event) => updateResponse(kra.id, "comment", event.target.value)} disabled={submitted} rows={3} placeholder="What did you deliver? Add examples, results or relevant context..." className="w-full resize-y rounded-xl border border-[#e2e2e6] px-3 py-2.5 text-sm leading-5 outline-none placeholder:text-[#a0a0a7] focus:border-[#c7a000] disabled:bg-[#f5f5f6]" /></label></div>
            </div></div>
          </article>)}
          <div className="flex justify-end"><button onClick={() => setActiveTab("values")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#19191e] px-4 text-sm font-medium text-white hover:bg-[#33333a]">Continue to Core Values <ArrowRight size={16} /></button></div>
        </section>}

        {activeTab === "values" && <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6"><div className="mb-5"><h2 className="text-lg font-semibold">Core Values</h2><p className="mt-1 text-sm text-[#777780]">Reflect on how you worked with others and approached your responsibilities.</p></div><div className="space-y-4">{values.map((value, index) => <div key={value.id} className="rounded-xl border border-[#ededf0] p-4 sm:p-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f4f5] text-xs font-semibold">{index + 1}</div><div><h3 className="text-sm font-semibold">{value.title}</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-[#777780]">{value.description}</p></div></div><label className="block w-full sm:w-64"><span className="mb-1.5 block text-xs font-semibold">Your rating <span className="text-[#b42318]">*</span></span><select value={valueRatings[value.id] || ""} onChange={(event) => { setValueRatings((current) => ({ ...current, [value.id]: event.target.value as Rating })); setSavedAt(null); }} disabled={submitted} className="h-10 w-full rounded-lg border border-[#e2e2e6] bg-white px-3 text-sm outline-none focus:border-[#c7a000] disabled:bg-[#f5f5f6]"><option value="">Select a rating</option>{ratingOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div></div>)}</div><div className="mt-5 flex justify-between gap-2"><button onClick={() => setActiveTab("kra")} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Back to objectives</button><button onClick={() => setActiveTab("feedback")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#19191e] px-4 text-sm font-medium text-white">Continue to Feedback <ArrowRight size={16} /></button></div></section>}

        {activeTab === "feedback" && <section className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6"><div className="mb-5"><h2 className="text-lg font-semibold">Feedback &amp; Reflection</h2><p className="mt-1 text-sm text-[#777780]">Use this section to give context to your ratings and identify where you want to grow.</p></div><div className="space-y-5"><label className="block"><span className="mb-1.5 block text-sm font-semibold">What are you most proud of this quarter? <span className="text-[#b42318]">*</span></span><textarea value={strengths} onChange={(event) => { setStrengths(event.target.value); setSavedAt(null); }} disabled={submitted} rows={4} placeholder="Mention key wins, projects, contributions or skills you improved..." className="w-full rounded-xl border border-[#e2e2e6] px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#a0a0a7] focus:border-[#c7a000] disabled:bg-[#f5f5f6]" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">What would you like to improve? <span className="text-[#b42318]">*</span></span><textarea value={improvements} onChange={(event) => { setImprovements(event.target.value); setSavedAt(null); }} disabled={submitted} rows={4} placeholder="Share skills, habits or areas where you want to make progress..." className="w-full rounded-xl border border-[#e2e2e6] px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#a0a0a7] focus:border-[#c7a000] disabled:bg-[#f5f5f6]" /></label><label className="block"><span className="mb-1.5 block text-sm font-semibold">What support would help you do your best work? <span className="text-xs font-normal text-[#92929a]">Optional</span></span><textarea value={support} onChange={(event) => { setSupport(event.target.value); setSavedAt(null); }} disabled={submitted} rows={3} placeholder="For example, feedback, training, clearer priorities or access to tools..." className="w-full rounded-xl border border-[#e2e2e6] px-3 py-3 text-sm leading-6 outline-none placeholder:text-[#a0a0a7] focus:border-[#c7a000] disabled:bg-[#f5f5f6]" /></label></div><div className="mt-5 flex justify-between gap-2"><button onClick={() => setActiveTab("values")} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Back to Core Values</button><button onClick={() => setActiveTab("summary")} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#19191e] px-4 text-sm font-medium text-white">Review summary <ArrowRight size={16} /></button></div></section>}

        {activeTab === "summary" && <section className="space-y-4"><div className="rounded-2xl border border-[#e8e8eb] bg-white p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start"><div><h2 className="text-lg font-semibold">Review your appraisal</h2><p className="mt-1 text-sm text-[#777780]">Check your responses before sending them to your line manager.</p></div><div className="rounded-xl bg-[#fafafa] px-4 py-3"><p className="text-xs text-[#777780]">Current self-rating average</p><p className="mt-1 text-2xl font-semibold">{weightedScore ? `${weightedScore} / 5` : "—"}</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-[#ededf0] p-4"><p className="text-xs text-[#777780]">Objectives with rating &amp; comments</p><p className="mt-1 text-xl font-semibold">{completedKras}/{kras.length}</p></div><div className="rounded-xl border border-[#ededf0] p-4"><p className="text-xs text-[#777780]">Core values rated</p><p className="mt-1 text-xl font-semibold">{ratedValues}/{values.length}</p></div><div className="rounded-xl border border-[#ededf0] p-4"><p className="text-xs text-[#777780]">Feedback sections completed</p><p className="mt-1 text-xl font-semibold">{Number(!!strengths.trim()) + Number(!!improvements.trim())}/2</p></div></div><div className="mt-5 divide-y divide-[#ededf0]">{kras.map((kra) => <div key={kra.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-start"><div className="min-w-0 flex-1"><p className="text-sm font-medium">{kra.id}. {kra.title}</p><p className="mt-1 text-xs leading-5 text-[#777780]">{responses[kra.id].comment || "No comment added yet."}</p></div><div className="shrink-0 text-sm font-semibold">{responses[kra.id].rating ? `${responses[kra.id].rating}/5` : "Not rated"} <span className="text-xs font-normal text-[#777780]">· {kra.weight}%</span></div></div>)}</div><div className="mt-5 rounded-xl border border-[#eee2b5] bg-[#fffbeb] p-4"><div className="flex gap-2"><CircleHelp size={17} className="mt-0.5 shrink-0 text-[#806100]"/><div><p className="text-sm font-semibold text-[#725a08]">What happens after submission?</p><p className="mt-1 text-sm leading-6 text-[#725a08]">Your self-appraisal will be sent to your line manager first. It then moves to the next-level manager and HR according to the review route configured for your organisation.</p></div></div></div><div className="mt-5 flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center"><button onClick={() => setActiveTab("feedback")} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Back to feedback</button><button onClick={() => setShowSubmitConfirm(true)} disabled={submitted || !canSubmit} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-5 text-sm font-semibold text-[#191919] disabled:cursor-not-allowed disabled:opacity-50"><Send size={16}/> Submit to line manager</button></div>{!canSubmit && !submitted && <p className="mt-3 text-xs text-[#777780]">To submit, add a rating and comment for all objectives, rate each core value, and complete both required feedback questions.</p>}</div></section>}

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-[#e8e8eb] pt-4 text-xs text-[#92929a] sm:flex-row"><span>Neukleos People · Performance &amp; Appraisals</span><span className="inline-flex items-center gap-1"><ShieldCheck size={13}/> Your responses are visible to authorised reviewers.</span></div>
      </div>

      {showSubmitConfirm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><div role="dialog" aria-modal="true" aria-labelledby="submit-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#fff6d7] text-[#806100]"><Send size={19}/></div><h2 id="submit-title" className="mt-4 text-lg font-semibold">Submit your self-appraisal?</h2><p className="mt-2 text-sm leading-6 text-[#777780]">Once submitted, you won’t be able to edit these answers in this demo. Your appraisal will move to your line manager for review.</p><div className="mt-5 flex justify-end gap-2"><button onClick={() => setShowSubmitConfirm(false)} className="h-10 rounded-xl border border-[#e2e2e6] px-4 text-sm font-medium">Keep editing</button><button onClick={submitAppraisal} disabled={!canSubmit} className="h-10 rounded-xl bg-[#FDC517] px-4 text-sm font-semibold disabled:opacity-50">Confirm submission</button></div></div></div>}
    </main>
  );
}
