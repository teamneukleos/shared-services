
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  ClipboardCheck,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ArrowLeft,
  CalendarDays,
  UsersRound,
  FileText,
  MessageSquare,
  X,
  Save,
  Send,
  Filter,
  Eye,
  Star,
  CircleUserRound,
  Check,
} from "lucide-react";

type ReviewStatus =
  | "Pending review"
  | "In progress"
  | "Completed"
  | "Awaiting employee";

type Objective = {
  id: number;
  title: string;
  description: string;
  employeeRating: number;
  employeeComment: string;
  managerRating: number;
  managerComment: string;
};

type TeamAppraisal = {
  id: number;
  name: string;
  role: string;
  department: string;
  initials: string;
  avatarColor: string;
  cycle: string;
  submittedAt: string;
  status: ReviewStatus;
  overallRating: number;
  objectives: Objective[];
  managerSummary: string;
};

const initialAppraisals: TeamAppraisal[] = [
  {
    id: 1,
    name: "Amara Okafor",
    role: "Frontend Developer",
    department: "Engineering",
    initials: "AO",
    avatarColor: "bg-violet-100 text-violet-700",
    cycle: "Q4 2026",
    submittedAt: "Oct 22, 2026",
    status: "Pending review",
    overallRating: 0,
    managerSummary: "",
    objectives: [
      {
        id: 1,
        title: "Deliver assigned frontend tasks",
        description:
          "Complete assigned tasks within agreed timelines while maintaining code quality.",
        employeeRating: 4,
        employeeComment:
          "I completed most assigned tasks on schedule and communicated when I needed clarification.",
        managerRating: 0,
        managerComment: "",
      },
      {
        id: 2,
        title: "Improve UI accuracy",
        description:
          "Implement designs accurately and reduce avoidable visual corrections.",
        employeeRating: 4,
        employeeComment:
          "I paid more attention to spacing, responsiveness and design consistency.",
        managerRating: 0,
        managerComment: "",
      },
      {
        id: 3,
        title: "Communication and teamwork",
        description:
          "Share progress, communicate blockers early and collaborate with teammates.",
        employeeRating: 3,
        employeeComment:
          "I kept the team updated on my tasks and asked for help when necessary.",
        managerRating: 0,
        managerComment: "",
      },
    ],
  },
  {
    id: 2,
    name: "Daniel Adeyemi",
    role: "Backend Developer",
    department: "Engineering",
    initials: "DA",
    avatarColor: "bg-blue-100 text-blue-700",
    cycle: "Q4 2026",
    submittedAt: "Oct 24, 2026",
    status: "Pending review",
    overallRating: 0,
    managerSummary: "",
    objectives: [
      {
        id: 1,
        title: "Deliver backend features",
        description:
          "Implement assigned backend features and maintain reliable API behaviour.",
        employeeRating: 4,
        employeeComment:
          "I delivered the main features assigned to me and tested the affected endpoints.",
        managerRating: 0,
        managerComment: "",
      },
      {
        id: 2,
        title: "Code quality and testing",
        description:
          "Write maintainable code and test changes before merging.",
        employeeRating: 3,
        employeeComment:
          "I improved my testing process and made changes based on code reviews.",
        managerRating: 0,
        managerComment: "",
      },
    ],
  },
  {
    id: 3,
    name: "Grace Eze",
    role: "Product Designer",
    department: "Design",
    initials: "GE",
    avatarColor: "bg-amber-100 text-amber-800",
    cycle: "Q4 2026",
    submittedAt: "Oct 20, 2026",
    status: "In progress",
    overallRating: 0,
    managerSummary: "",
    objectives: [
      {
        id: 1,
        title: "Design delivery",
        description:
          "Deliver design work on schedule and communicate changes to stakeholders.",
        employeeRating: 4,
        employeeComment:
          "I delivered the key screens and incorporated feedback from product discussions.",
        managerRating: 4,
        managerComment:
          "Good delivery overall. Continue to flag changing requirements early.",
      },
      {
        id: 2,
        title: "Design consistency",
        description:
          "Maintain consistent patterns, typography and spacing across products.",
        employeeRating: 5,
        employeeComment:
          "I reused our design patterns and updated the shared component library.",
        managerRating: 0,
        managerComment: "",
      },
    ],
  },
  {
    id: 4,
    name: "Sarah Williams",
    role: "Marketing Executive",
    department: "Marketing",
    initials: "SW",
    avatarColor: "bg-pink-100 text-pink-700",
    cycle: "Q4 2026",
    submittedAt: "Oct 18, 2026",
    status: "Completed",
    overallRating: 4,
    managerSummary:
      "Sarah has shown good ownership of assigned campaigns and communicates well with the team.",
    objectives: [
      {
        id: 1,
        title: "Campaign delivery",
        description: "Deliver campaign activities according to agreed timelines.",
        employeeRating: 4,
        employeeComment: "I completed the campaigns assigned to me.",
        managerRating: 4,
        managerComment: "Campaigns were delivered well and on time.",
      },
      {
        id: 2,
        title: "Reporting and insights",
        description: "Share campaign performance and actionable insights.",
        employeeRating: 4,
        employeeComment: "I prepared regular reports and tracked campaign performance.",
        managerRating: 4,
        managerComment: "Reports were clear and useful.",
      },
    ],
  },
  {
    id: 5,
    name: "Tunde Bakare",
    role: "HR Associate",
    department: "Human Resources",
    initials: "TB",
    avatarColor: "bg-emerald-100 text-emerald-700",
    cycle: "Q4 2026",
    submittedAt: "Not submitted",
    status: "Awaiting employee",
    overallRating: 0,
    managerSummary: "",
    objectives: [],
  },
];

const ratingLabels: Record<number, string> = {
  1: "Needs improvement",
  2: "Developing",
  3: "Meets expectations",
  4: "Exceeds expectations",
  5: "Outstanding",
};

const statusStyles: Record<ReviewStatus, string> = {
  "Pending review": "bg-amber-50 text-amber-700 border-amber-200",
  "In progress": "bg-blue-50 text-blue-700 border-blue-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Awaiting employee": "bg-gray-100 text-gray-600 border-gray-200",
};

function StatusBadge({ status }: { status: ReviewStatus }) {
  const Icon =
    status === "Completed"
      ? CheckCircle2
      : status === "Awaiting employee"
        ? Clock3
        : status === "In progress"
          ? ClipboardCheck
          : AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}
    >
      <Icon size={13} />
      {status}
    </span>
  );
}

function RatingSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            disabled={disabled}
            onClick={() => onChange(rating)}
            aria-label={`Rate ${rating}: ${ratingLabels[rating]}`}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition ${
              value === rating
                ? "border-[#FDC517] bg-[#FDC517] text-[#111115]"
                : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
            } disabled:cursor-not-allowed disabled:opacity-70`}
          >
            {rating}
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className="text-xs font-medium text-gray-500">
          {ratingLabels[value]}
        </p>
      )}
    </div>
  );
}

export default function TeamAppraisalsPage() {
  const [appraisals, setAppraisals] =
    useState<TeamAppraisal[]>(initialAppraisals);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState("");

  const selectedAppraisal =
    appraisals.find((item) => item.id === selectedId) ?? null;

  const departments = useMemo(
    () => [...new Set(appraisals.map((item) => item.department))].sort(),
    [appraisals]
  );

  const filteredAppraisals = useMemo(() => {
    const query = search.trim().toLowerCase();

    return appraisals.filter((item) => {
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.department.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All statuses" || item.status === statusFilter;

      const matchesDepartment =
        departmentFilter === "All departments" ||
        item.department === departmentFilter;

      return matchesSearch && matchesStatus && matchesDepartment;
    });
  }, [appraisals, search, statusFilter, departmentFilter]);

  const pendingCount = appraisals.filter(
    (item) =>
      item.status === "Pending review" || item.status === "In progress"
  ).length;

  const completedCount = appraisals.filter(
    (item) => item.status === "Completed"
  ).length;

  const awaitingCount = appraisals.filter(
    (item) => item.status === "Awaiting employee"
  ).length;

  function updateSelected(
    updater: (appraisal: TeamAppraisal) => TeamAppraisal
  ) {
    if (selectedId === null) return;

    setAppraisals((current) =>
      current.map((item) =>
        item.id === selectedId ? updater(item) : item
      )
    );
  }

  function updateObjective(
    objectiveId: number,
    changes: Partial<Objective>
  ) {
    updateSelected((appraisal) => ({
      ...appraisal,
      objectives: appraisal.objectives.map((objective) =>
        objective.id === objectiveId
          ? { ...objective, ...changes }
          : objective
      ),
    }));
  }

  function openReview(appraisal: TeamAppraisal) {
    if (
      appraisal.status === "Awaiting employee" ||
      appraisal.status === "Completed"
    ) {
      return;
    }

    setNotice("");
    setSelectedId(appraisal.id);
  }

  function saveReview(submit: boolean) {
    if (!selectedAppraisal) return;

    const hasMissingRatings = selectedAppraisal.objectives.some(
      (objective) => objective.managerRating === 0
    );

    if (submit && hasMissingRatings) {
      setNotice("Please rate every objective before submitting the review.");
      return;
    }

    if (
      submit &&
      selectedAppraisal.managerSummary.trim().length === 0
    ) {
      setNotice("Please add an overall manager comment before submitting.");
      return;
    }

    setAppraisals((current) =>
      current.map((item) => {
        if (item.id !== selectedId) return item;

        const ratedObjectives = item.objectives.filter(
          (objective) => objective.managerRating > 0
        );

        const overallRating =
          ratedObjectives.length > 0
            ? Math.round(
                ratedObjectives.reduce(
                  (sum, objective) => sum + objective.managerRating,
                  0
                ) / ratedObjectives.length
              )
            : 0;

        return {
          ...item,
          overallRating,
          status: submit ? "Completed" : "In progress",
        };
      })
    );

    setNotice(
      submit
        ? "Review submitted successfully in this demo."
        : "Draft saved in this demo."
    );
  }

  const reviewProgress = selectedAppraisal
    ? selectedAppraisal.objectives.length > 0
      ? Math.round(
          (selectedAppraisal.objectives.filter(
            (objective) => objective.managerRating > 0
          ).length /
            selectedAppraisal.objectives.length) *
            100
        )
      : 0
    : 0;

  return (
    <div className="min-h-full bg-[#F7F7F8] text-[#222226]">
      <div className="mx-auto max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-gray-500">
              <span>Workspace</span>
              <ChevronRight size={13} />
              <span className="text-gray-800">Team Appraisals</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-[#17171B] sm:text-3xl">
              Team Appraisals
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-gray-500">
              Review your team&apos;s performance, provide feedback and
              complete appraisal assessments.
            </p>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5">
            <CalendarDays size={17} className="text-gray-500" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                Appraisal cycle
              </p>
              <p className="text-sm font-semibold">Q4 2026</p>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Team members"
            value={appraisals.length}
            description="In your review list"
            icon={UsersRound}
            iconClass="bg-gray-100 text-gray-700"
          />
          <SummaryCard
            label="Awaiting your review"
            value={pendingCount}
            description="Submitted by employees"
            icon={ClipboardCheck}
            iconClass="bg-amber-50 text-amber-700"
          />
          <SummaryCard
            label="Reviews completed"
            value={completedCount}
            description="Completed this cycle"
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-700"
          />
          <SummaryCard
            label="Awaiting employees"
            value={awaitingCount}
            description="Self-appraisal not submitted"
            icon={Clock3}
            iconClass="bg-blue-50 text-blue-700"
          />
        </div>

        {/* Review queue */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-[#19191D]">
                Review queue
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Track and review appraisals for your team.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="h-2 w-2 rounded-full bg-[#FDC517]" />
              Q4 appraisal cycle
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees, roles or departments..."
                className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#D6A900] focus:ring-2 focus:ring-[#FDC517]/20"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-gray-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-[#D6A900] sm:w-48"
                >
                  <option>All statuses</option>
                  <option>Pending review</option>
                  <option>In progress</option>
                  <option>Completed</option>
                  <option>Awaiting employee</option>
                </select>
              </div>

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#D6A900] sm:w-48"
              >
                <option>All departments</option>
                {departments.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  <th className="px-5 py-3.5 text-xs font-medium text-gray-500">
                    Employee
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Department
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Submitted
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-xs font-medium text-gray-500">
                    Manager rating
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-medium text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredAppraisals.map((appraisal) => (
                  <tr
                    key={appraisal.id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${appraisal.avatarColor}`}
                        >
                          {appraisal.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            {appraisal.name}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {appraisal.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {appraisal.department}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {appraisal.submittedAt}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={appraisal.status} />
                    </td>

                    <td className="px-4 py-4">
                      {appraisal.overallRating > 0 ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium">
                          <Star
                            size={15}
                            className="fill-[#FDC517] text-[#D5A500]"
                          />
                          {appraisal.overallRating}/5
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {appraisal.status === "Awaiting employee" ? (
                        <span className="text-xs text-gray-400">
                          Awaiting submission
                        </span>
                      ) : appraisal.status === "Completed" ? (
                        <button
                          onClick={() => openReview(appraisal)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          <Eye size={14} />
                          View status
                        </button>
                      ) : (
                        <button
                          onClick={() => openReview(appraisal)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#FDC517] px-3.5 py-2 text-xs font-semibold text-[#171717] transition hover:bg-[#edb900]"
                        >
                          Review
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {filteredAppraisals.map((appraisal) => (
              <div key={appraisal.id} className="space-y-3 p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${appraisal.avatarColor}`}
                  >
                    {appraisal.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{appraisal.name}</p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {appraisal.role} · {appraisal.department}
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={appraisal.status} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 text-xs text-gray-500">
                  <span>Submitted: {appraisal.submittedAt}</span>
                  {appraisal.overallRating > 0 && (
                    <span className="font-medium text-gray-700">
                      {appraisal.overallRating}/5
                    </span>
                  )}
                </div>

                {appraisal.status === "Awaiting employee" ? (
                  <p className="text-xs text-gray-400">
                    Waiting for employee submission
                  </p>
                ) : (
                  <button
                    onClick={() => openReview(appraisal)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717]"
                  >
                    {appraisal.status === "Completed"
                      ? "View status"
                      : "Review appraisal"}
                    <ChevronRight size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {filteredAppraisals.length === 0 && (
            <div className="flex flex-col items-center px-5 py-14 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <Search size={20} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-800">
                No appraisals found
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or filters.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All statuses");
                  setDepartmentFilter("All departments");
                }}
                className="mt-3 text-sm font-medium text-gray-800 underline underline-offset-4"
              >
                Clear filters
              </button>
            </div>
          )}

          <div className="border-t border-gray-100 px-5 py-3.5">
            <p className="text-xs text-gray-500">
              Showing {filteredAppraisals.length} of {appraisals.length} team
              members
            </p>
          </div>
        </section>

        {/* Informational note */}
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
          <div className="mt-0.5 text-gray-500">
            <AlertCircle size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">
              About team reviews
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              You can review an appraisal after an employee submits their
              self-assessment. In the live system, you&apos;ll only see
              employees assigned to you, based on your manager permissions.
            </p>
          </div>
        </div>
      </div>

      {/* Appraisal review panel */}
      {selectedAppraisal && (
        <div
          className="fixed inset-0 z-[100] flex justify-end bg-black/40"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedId(null);
              setNotice("");
            }
          }}
        >
          <section className="flex h-full w-full max-w-3xl flex-col bg-[#F7F7F8] shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <button
                onClick={() => {
                  setSelectedId(null);
                  setNotice("");
                }}
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={17} />
                Back to team
              </button>

              <button
                onClick={() => {
                  setSelectedId(null);
                  setNotice("");
                }}
                aria-label="Close review"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-7">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-gray-500">
                  <span>Team Appraisals</span>
                  <ChevronRight size={13} />
                  <span>Review</span>
                </div>

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${selectedAppraisal.avatarColor}`}
                    >
                      {selectedAppraisal.initials}
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#17171B]">
                        {selectedAppraisal.name}
                      </h2>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedAppraisal.role} ·{" "}
                        {selectedAppraisal.department}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Appraisal cycle: {selectedAppraisal.cycle}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={selectedAppraisal.status} />
                </div>
              </div>

              {/* Employee submission summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Employee rating</p>
                  <p className="mt-2 text-xl font-semibold">
                    {selectedAppraisal.objectives.length > 0
                      ? (
                          selectedAppraisal.objectives.reduce(
                            (sum, objective) =>
                              sum + objective.employeeRating,
                            0
                          ) / selectedAppraisal.objectives.length
                        ).toFixed(1)
                      : "—"}
                    <span className="ml-1 text-sm font-normal text-gray-400">
                      / 5
                    </span>
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <p className="text-xs text-gray-500">Your review progress</p>
                  <p className="mt-2 text-xl font-semibold">
                    {reviewProgress}%
                  </p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-[#FDC517] transition-all"
                      style={{ width: `${reviewProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Objectives */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Performance objectives
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Review the employee&apos;s assessment, then add your
                    rating and comments for each objective.
                  </p>
                </div>

                {selectedAppraisal.objectives.map((objective, index) => (
                  <div
                    key={objective.id}
                    className="space-y-5 rounded-xl border border-gray-200 bg-white p-4 sm:p-5"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-600">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-gray-900">
                          {objective.title}
                        </h4>
                        <p className="mt-1.5 text-sm leading-6 text-gray-500">
                          {objective.description}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3.5">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Employee self-assessment
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-800">
                          <Star
                            size={14}
                            className="fill-[#FDC517] text-[#D5A500]"
                          />
                          {objective.employeeRating}/5
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {ratingLabels[objective.employeeRating]}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-gray-700">
                        {objective.employeeComment ||
                          "No employee comment provided."}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="mb-2 text-sm font-semibold text-gray-800">
                          Your rating
                        </p>
                        <RatingSelector
                          value={objective.managerRating}
                          onChange={(rating) =>
                            updateObjective(objective.id, {
                              managerRating: rating,
                            })
                          }
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={`manager-comment-${objective.id}`}
                          className="mb-2 block text-sm font-medium text-gray-700"
                        >
                          Manager comments
                        </label>
                        <textarea
                          id={`manager-comment-${objective.id}`}
                          value={objective.managerComment}
                          onChange={(event) =>
                            updateObjective(objective.id, {
                              managerComment: event.target.value,
                            })
                          }
                          rows={3}
                          placeholder="Add feedback on this objective..."
                          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-gray-400 focus:border-[#D6A900] focus:ring-2 focus:ring-[#FDC517]/20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Overall assessment */}
              {selectedAppraisal.objectives.length > 0 && (
                <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Overall assessment
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Summarise the employee&apos;s performance for this cycle.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="overall-rating"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Overall manager rating
                    </label>
                    <RatingSelector
                      value={selectedAppraisal.overallRating}
                      onChange={(rating) =>
                        updateSelected((appraisal) => ({
                          ...appraisal,
                          overallRating: rating,
                        }))
                      }
                    />
                    <p className="mt-2 text-xs leading-5 text-gray-400">
                      The final average is calculated when you save or submit.
                      You can select an overall rating here as well.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="overall-manager-comment"
                      className="mb-2 block text-sm font-medium text-gray-700"
                    >
                      Overall manager comments
                    </label>
                    <textarea
                      id="overall-manager-comment"
                      value={selectedAppraisal.managerSummary}
                      onChange={(event) =>
                        updateSelected((appraisal) => ({
                          ...appraisal,
                          managerSummary: event.target.value,
                        }))
                      }
                      rows={4}
                      placeholder="Summarise strengths, areas for improvement and development goals..."
                      className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none placeholder:text-gray-400 focus:border-[#D6A900] focus:ring-2 focus:ring-[#FDC517]/20"
                    />
                  </div>
                </div>
              )}

              {/* Notification */}
              {notice && (
                <div
                  className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${
                    notice.startsWith("Please")
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {notice.startsWith("Please") ? (
                    <AlertCircle size={17} className="mt-0.5 shrink-0" />
                  ) : (
                    <Check size={17} className="mt-0.5 shrink-0" />
                  )}
                  {notice}
                </div>
              )}

              {selectedAppraisal.objectives.length === 0 && (
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-10 text-center">
                  <FileText
                    size={30}
                    className="mx-auto mb-3 text-gray-400"
                  />
                  <h3 className="font-semibold text-gray-900">
                    No self-assessment submitted
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    This employee needs to complete their self-appraisal
                    before you can review their objectives.
                  </p>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <MessageSquare size={14} />
                Changes stay in this demo session.
              </p>

              {selectedAppraisal.status === "Completed" ? (
                <button
                  onClick={() => {
                    setSelectedId(null);
                    setNotice("");
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <CheckCircle2 size={16} />
                  Close review
                </button>
              ) : (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={() => saveReview(false)}
                    disabled={selectedAppraisal.objectives.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Save size={15} />
                    Save draft
                  </button>

                  <button
                    onClick={() => saveReview(true)}
                    disabled={selectedAppraisal.objectives.length === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#171717] transition hover:bg-[#edb900] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send size={15} />
                    Submit review
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  iconClass: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-[#19191D]">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={19} />
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-400">{description}</p>
    </div>
  );
}
