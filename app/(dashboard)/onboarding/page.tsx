
"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { EmployeeAvatar } from "@/components/employee-avatar";
import {
  ArrowDownToLine,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

type OnboardingStatus = "In Progress" | "Completed" | "Delayed";

type OnboardingRecord = {
  id: string;
  employee: string;
  avatar: string | null;
  position: string;
  department: string;
  joiningDate: string;
  dateOfBirth: string;
  lineManager: string;
  tasksDone: number;
  tasksTotal: number;
  buddy: string;
  notes: string;
  status: OnboardingStatus;
};

type OnboardingForm = {
  employee: string;
  position: string;
  department: string;
  joiningDate: string;
  dateOfBirth: string;
  lineManager: string;
  tasksDone: string;
  tasksTotal: string;
  buddy: string;
  notes: string;
};

const departments = [
  "Content Studio",
  "Andara Studio",
  "Creative Studio",
  "Finance",
  "Operations",
];

const initialRecords: OnboardingRecord[] = [
  {
    id: "OB-1001",
    avatar: "https://i.pravatar.cc/120?img=47",
    employee: "Amara Okafor",
    position: "Frontend Developer",
    department: "Creative Studio",
    joiningDate: "2026-10-20",
    dateOfBirth: "1998-11-02",
    lineManager: "Daniel Adeyemi",
    tasksDone: 3,
    tasksTotal: 8,
    buddy: "Daniel Adeyemi",
    notes: "Needs access to the development tools and project repositories.",
    status: "In Progress",
  },
  {
    id: "OB-1002",
    avatar: "https://i.pravatar.cc/120?img=12",
    employee: "Daniel Adebayo",
    position: "Marketing Executive",
    department: "Content Studio",
    joiningDate: "2026-10-14",
    dateOfBirth: "1995-10-29",
    lineManager: "Sarah Williams",
    tasksDone: 8,
    tasksTotal: 8,
    buddy: "Sarah Williams",
    notes: "All onboarding requirements completed.",
    status: "Completed",
  },
  {
    id: "OB-1003",
    avatar: "https://i.pravatar.cc/120?img=44",
    employee: "Grace Eze",
    position: "Operations Associate",
    department: "Operations",
    joiningDate: "2026-10-12",
    dateOfBirth: "1997-11-05",
    lineManager: "Daniel Adeyemi",
    tasksDone: 2,
    tasksTotal: 8,
    buddy: "Tunde Bello",
    notes: "Pending document submission and policy acknowledgement.",
    status: "Delayed",
  },
  {
    id: "OB-1004",
    avatar: "https://i.pravatar.cc/120?img=32",
    employee: "Sarah Williams",
    position: "Finance Officer",
    department: "Finance",
    joiningDate: "2026-10-26",
    dateOfBirth: "1994-12-12",
    lineManager: "Motola Olusoga",
    tasksDone: 4,
    tasksTotal: 8,
    buddy: "Amara Okafor",
    notes: "Orientation and remaining team introductions are pending.",
    status: "In Progress",
  },
  {
    id: "OB-1005",
    avatar: "https://i.pravatar.cc/120?img=13",
    employee: "Tunde Bello",
    position: "Project Coordinator",
    department: "Andara Studio",
    joiningDate: "2026-10-28",
    dateOfBirth: "1996-11-01",
    lineManager: "Motola Olusoga",
    tasksDone: 1,
    tasksTotal: 8,
    buddy: "Daniel Adebayo",
    notes: "",
    status: "In Progress",
  },
  {
    id: "OB-1006",
    avatar: "https://i.pravatar.cc/120?img=49",
    employee: "Kemi Johnson",
    position: "Content Strategist",
    department: "Content Studio",
    joiningDate: "2026-10-05",
    dateOfBirth: "1999-10-31",
    lineManager: "Sarah Williams",
    tasksDone: 8,
    tasksTotal: 8,
    buddy: "Grace Eze",
    notes: "Onboarding completed successfully.",
    status: "Completed",
  },
];

const emptyForm: OnboardingForm = {
  employee: "",
  position: "",
  department: "",
  joiningDate: "",
  dateOfBirth: "",
  lineManager: "",
  tasksDone: "0",
  tasksTotal: "8",
  buddy: "",
  notes: "",
};

function getProgress(record: OnboardingRecord) {
  if (record.tasksTotal <= 0) return 0;

  return Math.min(
    100,
    Math.round((record.tasksDone / record.tasksTotal) * 100),
  );
}


function formatDate(date: string) {
  if (!date) return "Not set";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatus(
  tasksDone: number,
  tasksTotal: number,
  joiningDate: string,
): OnboardingStatus {
  if (tasksTotal > 0 && tasksDone >= tasksTotal) return "Completed";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (joiningDate) {
    const joining = new Date(`${joiningDate}T00:00:00`);
    if (joining < today) return "Delayed";
  }

  return "In Progress";
}

function StatusBadge({ status }: { status: OnboardingStatus }) {
  const styles: Record<OnboardingStatus, string> = {
    "In Progress": "bg-[#eef0ff] text-[#535da0]",
    Completed: "bg-[#e8f5ec] text-[#287747]",
    Delayed: "bg-[#fff0e8] text-[#b45324]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export default function OnboardingPage() {
  const [records, setRecords] =
    useState<OnboardingRecord[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All departments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [modalMode, setModalMode] = useState<
    "add" | "edit" | "details" | null
  >(null);
  const [selectedRecord, setSelectedRecord] =
    useState<OnboardingRecord | null>(null);
  const [form, setForm] = useState<OnboardingForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !term ||
        [
          record.employee,
          record.id,
          record.position,
          record.department,
          record.lineManager,
          record.buddy,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesDepartment =
        departmentFilter === "All departments" ||
        record.department === departmentFilter;

      const matchesStatus =
        statusFilter === "All statuses" || record.status === statusFilter;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [records, search, departmentFilter, statusFilter]);

  const totalCount = records.length;
  const inProgressCount = records.filter(
    (record) => record.status === "In Progress",
  ).length;
  const completedCount = records.filter(
    (record) => record.status === "Completed",
  ).length;
  const delayedCount = records.filter(
    (record) => record.status === "Delayed",
  ).length;

  const averageProgress =
    totalCount > 0
      ? Math.round(
          records.reduce((total, record) => total + getProgress(record), 0) /
            totalCount,
        )
      : 0;

  function openAddModal() {
    setSelectedRecord(null);
    setForm(emptyForm);
    setFormError("");
    setModalMode("add");
  }

  function openEditModal(record: OnboardingRecord) {
    setSelectedRecord(record);
    setForm({
      employee: record.employee,
      position: record.position,
      department: record.department,
      joiningDate: record.joiningDate,
      dateOfBirth: record.dateOfBirth,
      lineManager: record.lineManager,
      tasksDone: String(record.tasksDone),
      tasksTotal: String(record.tasksTotal),
      buddy: record.buddy,
      notes: record.notes,
    });
    setFormError("");
    setModalMode("edit");
  }

  function openDetails(record: OnboardingRecord) {
    setSelectedRecord(record);
    setModalMode("details");
  }

  function closeModal() {
    setModalMode(null);
    setSelectedRecord(null);
    setFormError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const tasksDone = Number(form.tasksDone);
    const tasksTotal = Number(form.tasksTotal);

    if (
      !form.employee.trim() ||
      !form.position.trim() ||
      !form.department ||
      !form.joiningDate
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    if (
      !Number.isInteger(tasksDone) ||
      !Number.isInteger(tasksTotal) ||
      tasksTotal < 1 ||
      tasksDone < 0 ||
      tasksDone > tasksTotal
    ) {
      setFormError(
        "Tasks completed must be a whole number between zero and the total tasks.",
      );
      return;
    }

    if (form.dateOfBirth && form.dateOfBirth > new Date().toISOString().slice(0, 10)) {
      setFormError("Date of birth cannot be in the future.");
      return;
    }

    const recordData = {
      employee: form.employee.trim(),
      position: form.position.trim(),
      department: form.department,
      joiningDate: form.joiningDate,
      dateOfBirth: form.dateOfBirth,
      lineManager: form.lineManager.trim(),
      tasksDone,
      tasksTotal,
      buddy: form.buddy.trim(),
      notes: form.notes.trim(),
      status: getStatus(tasksDone, tasksTotal, form.joiningDate),
    };

    if (modalMode === "edit" && selectedRecord) {
      setRecords((current) =>
        current.map((record) =>
          record.id === selectedRecord.id
            ? { ...record, ...recordData }
            : record,
        ),
      );
    } else {
      const newRecord: OnboardingRecord = {
        id: `OB-${Date.now().toString().slice(-6)}`,
        avatar: null,
        ...recordData,
      };

      setRecords((current) => [newRecord, ...current]);
    }

    closeModal();
  }

  function deleteRecord(record: OnboardingRecord) {
    const confirmed = window.confirm(
      `Delete the onboarding record for ${record.employee}?`,
    );

    if (!confirmed) return;

    setRecords((current) =>
      current.filter((item) => item.id !== record.id),
    );

    if (selectedRecord?.id === record.id) {
      closeModal();
    }
  }

  function updateForm(field: keyof OnboardingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="min-w-0 space-y-6 pb-10 text-[#202024]">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-[#737373]">
            <span>HR Management</span>
            <ArrowRight size={12} />
            <span className="text-[#202024]">Onboarding</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-[#17171b] sm:text-[28px]">
            Employee onboarding
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#737373]">
            Manage new hires, track their onboarding tasks, and make sure
            everyone is ready to get started.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const header = [
                "ID",
                "Employee",
                "Position",
                "Department",
                "Joining Date",
                "Date of Birth",
                "Line Manager",
                "Tasks Completed",
                "Total Tasks",
                "Buddy",
                "Status",
              ];

              const rows = filteredRecords.map((record) => [
                record.id,
                record.employee,
                record.position,
                record.department,
                record.joiningDate,
                record.dateOfBirth,
                record.lineManager,
                record.tasksDone,
                record.tasksTotal,
                record.buddy,
                record.status,
              ]);

              const csv = [header, ...rows]
                .map((row) =>
                  row
                    .map(
                      (value) =>
                        `"${String(value).replace(/"/g, '""')}"`,
                    )
                    .join(","),
                )
                .join("\n");

              const blob = new Blob([csv], {
                type: "text/csv;charset=utf-8;",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");

              link.href = url;
              link.download = "neukleos-onboarding.csv";
              link.click();

              URL.revokeObjectURL(url);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e7e7e4] bg-white px-4 py-3 text-sm font-medium transition hover:bg-[#f8f8f6]"
          >
            <ArrowDownToLine size={16} />
            Export
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-3 text-sm font-semibold text-[#111115] shadow-sm transition hover:bg-[#e8b400]"
          >
            <Plus size={17} />
            Add onboarding
          </button>
        </div>
      </div>

      {/* Statistics */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Total onboarding"
          value={totalCount}
          detail="Employee records"
          icon={<UsersRound size={19} />}
        />

        <StatCard
          label="In progress"
          value={inProgressCount}
          detail="Currently onboarding"
          icon={<Clock3 size={19} />}
        />

        <StatCard
          label="Completed"
          value={completedCount}
          detail="All tasks completed"
          icon={<CheckCircle2 size={19} />}
        />

        <StatCard
          label="Delayed"
          value={delayedCount}
          detail="Needs follow-up"
          icon={<CalendarDays size={19} />}
          warning
        />

        <StatCard
          label="Average progress"
          value={`${averageProgress}%`}
          detail="Across all onboarding"
          icon={<Check size={19} />}
          progress={averageProgress}
        />
      </section>

      {/* Onboarding pipeline */}
      <section className="overflow-hidden rounded-2xl border border-[#e7e7e4] bg-white shadow-[0_4px_18px_rgba(17,17,21,0.025)]">
        <div className="flex flex-col justify-between gap-4 border-b border-[#e7e7e4] p-5 sm:p-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold">Onboarding pipeline</h2>
            <p className="mt-1 text-xs text-[#737373]">
              Track each new hire from their joining date through completion.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 sm:w-64">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#929292]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employees..."
                aria-label="Search onboarding records"
                className="h-10 w-full rounded-xl border border-[#e7e7e4] bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-[#a0a0a0] focus:border-[#d4ad20] focus:ring-2 focus:ring-[#FDC517]/20"
              />
            </div>

            <div className="relative">
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                aria-label="Filter by department"
                className="h-10 w-full appearance-none rounded-xl border border-[#e7e7e4] bg-white py-2 pl-3 pr-9 text-sm outline-none focus:border-[#d4ad20] sm:w-48"
              >
                <option>All departments</option>
                {departments.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]"
              />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by status"
                className="h-10 w-full appearance-none rounded-xl border border-[#e7e7e4] bg-white py-2 pl-3 pr-9 text-sm outline-none focus:border-[#d4ad20] sm:w-40"
              >
                <option>All statuses</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Delayed</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]"
              />
            </div>
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e7e7e4] bg-[#fafaf8]">
                {[
                  "EMPLOYEE",
                  "DEPARTMENT",
                  "JOINING DATE",
                  "LINE MANAGER",
                  "PROGRESS",
                  "TASKS",
                  "STATUS",
                  "",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="px-5 py-3.5 text-[10px] font-semibold tracking-[0.08em] text-[#737373]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="border-b border-[#f0f0ed] transition hover:bg-[#fcfcfa] last:border-0"
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => openDetails(record)}
                      className="flex items-center gap-3 text-left"
                    >
                      <EmployeeAvatar
                        name={record.employee}
                        src={record.avatar}
                        size="md"
                      />

                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-[#202024]">
                          {record.employee}
                        </span>
                        <span className="mt-1 block text-xs text-[#737373]">
                          {record.position}
                        </span>
                        <span className="mt-1 block text-[10px] text-[#999]">
                          {record.id}
                        </span>
                      </span>
                    </button>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#55555d]">
                    {record.department}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#55555d]">
                    {formatDate(record.joiningDate)}
                  </td>

                  <td className="px-5 py-4 text-sm text-[#55555d]">
                    {record.lineManager || "Not assigned"}
                  </td>

                  <td className="px-5 py-4">
                    <div className="w-32">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold">
                          {getProgress(record)}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#efefec]">
                        <div
                          className="h-full rounded-full bg-[#FDC517] transition-all"
                          style={{ width: `${getProgress(record)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-[#55555d]">
                    <span className="font-medium">{record.tasksDone}</span>
                    <span className="text-[#999]">
                      {" "}
                      / {record.tasksTotal}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <StatusBadge status={record.status} />
                  </td>

                  <td className="px-5 py-4">
                    <RecordActions
                      onDetails={() => openDetails(record)}
                      onEdit={() => openEditModal(record)}
                      onDelete={() => deleteRecord(record)}
                    />
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f4f2] text-[#737373]">
                      <Search size={20} />
                    </div>
                    <p className="mt-4 text-sm font-medium">
                      No onboarding records found
                    </p>
                    <p className="mt-1 text-xs text-[#737373]">
                      Try changing your search or filters, or add a new record.
                    </p>
                    <button
                      type="button"
                      onClick={openAddModal}
                      className="mt-4 text-sm font-semibold text-[#755800] hover:underline"
                    >
                      Add onboarding
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 p-4 md:hidden">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="rounded-xl border border-[#e7e7e4] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <button
                  type="button"
                  onClick={() => openDetails(record)}
                  className="flex min-w-0 items-center gap-3 text-left"
                >
                  <EmployeeAvatar
                    name={record.employee}
                    src={record.avatar}
                    size="md"
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {record.employee}
                    </span>
                    <span className="mt-1 block text-xs text-[#737373]">
                      {record.position}
                    </span>
                  </span>
                </button>

                <RecordActions
                  onDetails={() => openDetails(record)}
                  onEdit={() => openEditModal(record)}
                  onDelete={() => deleteRecord(record)}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-[#737373]">
                  {record.department}
                </span>
                <StatusBadge status={record.status} />
              </div>
              <p className="mt-2 text-xs text-[#737373]">
                Line manager: <span className="font-medium text-[#45454d]">{record.lineManager || "Not assigned"}</span>
              </p>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-[#737373]">Onboarding progress</span>
                  <span className="font-semibold">
                    {getProgress(record)}%
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#efefec]">
                  <div
                    className="h-full rounded-full bg-[#FDC517]"
                    style={{ width: `${getProgress(record)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-[#f0f0ed] pt-3 text-xs">
                <span className="text-[#737373]">
                  Joining {formatDate(record.joiningDate)}
                </span>
                <span className="font-medium">
                  {record.tasksDone}/{record.tasksTotal} tasks
                </span>
              </div>
            </div>
          ))}

          {filteredRecords.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-sm font-medium">
                No onboarding records found
              </p>
              <p className="mt-1 text-xs text-[#737373]">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-2 border-t border-[#e7e7e4] px-5 py-4 text-xs text-[#737373] sm:flex-row sm:items-center">
          <span>
            Showing {filteredRecords.length} of {records.length} records
          </span>

          {(search ||
            departmentFilter !== "All departments" ||
            statusFilter !== "All statuses") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setDepartmentFilter("All departments");
                setStatusFilter("All statuses");
              }}
              className="self-start font-medium text-[#755800] hover:underline sm:self-auto"
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      <p className="text-center text-[11px] text-[#737373]">
        Neukleos People · HR workspace · Demo data
      </p>

      {/* Add / Edit modal */}
      {(modalMode === "add" || modalMode === "edit") && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111115]/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e7e7e4] p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">
                  {modalMode === "add"
                    ? "Add onboarding"
                    : "Edit onboarding"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-[#737373]">
                  {modalMode === "add"
                    ? "Create an onboarding record and start tracking the new hire's progress."
                    : "Update the employee's onboarding details and progress."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
                className="rounded-lg p-2 text-[#737373] transition hover:bg-[#f4f4f2]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <FormField label="Employee name" required>
                  <input
                    value={form.employee}
                    onChange={(event) =>
                      updateForm("employee", event.target.value)
                    }
                    placeholder="e.g. Amara Okafor"
                    required
                    className={fieldClass}
                  />
                </FormField>

                <FormField label="Position" required>
                  <input
                    value={form.position}
                    onChange={(event) =>
                      updateForm("position", event.target.value)
                    }
                    placeholder="e.g. Frontend Developer"
                    required
                    className={fieldClass}
                  />
                </FormField>

                <FormField label="Department" required>
                  <select
                    value={form.department}
                    onChange={(event) =>
                      updateForm("department", event.target.value)
                    }
                    required
                    className={fieldClass}
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department}>{department}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Joining date" required>
                  <input
                    type="date"
                    value={form.joiningDate}
                    onChange={(event) =>
                      updateForm("joiningDate", event.target.value)
                    }
                    required
                    className={fieldClass}
                  />
                </FormField>

                <FormField label="Date of birth">
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) =>
                      updateForm("dateOfBirth", event.target.value)
                    }
                    className={fieldClass}
                  />
                  <span className="mt-1.5 block text-[11px] leading-4 text-[#888]">
                    Used for birthday reminders. Access to the full date should be restricted.
                  </span>
                </FormField>

                <FormField label="Line manager">
                  <select
                    value={form.lineManager}
                    onChange={(event) => updateForm("lineManager", event.target.value)}
                    className={fieldClass}
                  >
                    <option value="">Assign a line manager</option>
                    {["Daniel Adeyemi", "Sarah Williams", "Motola Olusoga", "Tunde Bello"].map((manager) => (
                      <option key={manager} value={manager}>{manager}</option>
                    ))}
                  </select>
                  <span className="mt-1.5 block text-[11px] leading-4 text-[#888]">
                    The employee will appear in this manager&apos;s team view.
                  </span>
                </FormField>

                <FormField label="Onboarding buddy">
                  <input
                    value={form.buddy}
                    onChange={(event) =>
                      updateForm("buddy", event.target.value)
                    }
                    placeholder="Assign a colleague"
                    className={fieldClass}
                  />
                </FormField>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Tasks completed" required>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.tasksDone}
                      onChange={(event) =>
                        updateForm("tasksDone", event.target.value)
                      }
                      required
                      className={fieldClass}
                    />
                  </FormField>

                  <FormField label="Total tasks" required>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.tasksTotal}
                      onChange={(event) =>
                        updateForm("tasksTotal", event.target.value)
                      }
                      required
                      className={fieldClass}
                    />
                  </FormField>
                </div>

                <div className="sm:col-span-2">
                  <FormField label="Notes">
                    <textarea
                      rows={3}
                      value={form.notes}
                      onChange={(event) =>
                        updateForm("notes", event.target.value)
                      }
                      placeholder="Add any notes or outstanding requirements..."
                      className={`${fieldClass} resize-y`}
                    />
                  </FormField>
                </div>

                {formError && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[#fff0e8] px-3 py-2 text-sm text-[#b45324] sm:col-span-2"
                  >
                    {formError}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[#e7e7e4] bg-[#fafaf8] p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-[#e7e7e4] bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-[#f4f4f2]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#111115] transition hover:bg-[#e8b400]"
                >
                  <Check size={16} />
                  {modalMode === "add"
                    ? "Save onboarding"
                    : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Onboarding details */}
      {modalMode === "details" && selectedRecord && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#111115]/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-[#e7e7e4] p-5 sm:p-6">
              <div className="flex min-w-0 items-center gap-3">
                <EmployeeAvatar
                  name={selectedRecord.employee}
                  src={selectedRecord.avatar}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-xs text-[#737373]">
                    Onboarding record · {selectedRecord.id}
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold">
                    {selectedRecord.employee}
                  </h2>
                  <p className="mt-1 text-sm text-[#737373]">
                    {selectedRecord.position}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                aria-label="Close details"
                className="rounded-lg p-2 text-[#737373] hover:bg-[#f4f4f2]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[#737373]">
                  Onboarding status
                </span>
                <StatusBadge status={selectedRecord.status} />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[#737373]">Overall progress</span>
                  <span className="font-semibold">
                    {getProgress(selectedRecord)}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-[#efefec]">
                  <div
                    className="h-full rounded-full bg-[#FDC517]"
                    style={{
                      width: `${getProgress(selectedRecord)}%`,
                    }}
                  />
                </div>

                <p className="mt-2 text-xs text-[#737373]">
                  {selectedRecord.tasksDone} of {selectedRecord.tasksTotal}{" "}
                  onboarding tasks completed
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <DetailItem
                  icon={<UsersRound size={16} />}
                  label="Department"
                  value={selectedRecord.department}
                />
                <DetailItem
                  icon={<CalendarDays size={16} />}
                  label="Joining date"
                  value={formatDate(selectedRecord.joiningDate)}
                />
                <DetailItem
                  icon={<CalendarDays size={16} />}
                  label="Date of birth"
                  value={selectedRecord.dateOfBirth ? formatDate(selectedRecord.dateOfBirth) : "Not provided"}
                />
                <DetailItem
                  icon={<UsersRound size={16} />}
                  label="Line manager"
                  value={selectedRecord.lineManager || "Not assigned"}
                />
                <DetailItem
                  icon={<UsersRound size={16} />}
                  label="Onboarding buddy"
                  value={selectedRecord.buddy || "Not assigned"}
                />
                <DetailItem
                  icon={<FileText size={16} />}
                  label="Tasks"
                  value={`${selectedRecord.tasksDone} / ${selectedRecord.tasksTotal}`}
                />
              </div>

              <div className="rounded-xl bg-[#fafaf8] p-4">
                <h3 className="text-sm font-medium">Notes</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#737373]">
                  {selectedRecord.notes || "No notes have been added yet."}
                </p>
              </div>

              <p className="text-xs leading-5 text-[#737373]">
                This page currently uses demo data. Individual task assignments
                and employee self-service completion will be connected when
                the onboarding backend and employee workflow are implemented.
              </p>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-[#e7e7e4] bg-[#fafaf8] p-5 sm:flex-row sm:justify-end sm:p-6">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-[#e7e7e4] bg-white px-4 py-2.5 text-sm font-medium hover:bg-[#f4f4f2]"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => openEditModal(selectedRecord)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#FDC517] px-4 py-2.5 text-sm font-semibold text-[#111115] hover:bg-[#e8b400]"
              >
                <Pencil size={15} />
                Edit record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl border border-[#e7e7e4] bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-[#a0a0a0] focus:border-[#d4ad20] focus:ring-2 focus:ring-[#FDC517]/20";

function StatCard({
  label,
  value,
  detail,
  icon,
  warning = false,
  progress,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  warning?: boolean;
  progress?: number;
}) {
  return (
    <div className="rounded-2xl border border-[#e7e7e4] bg-white p-4 shadow-[0_4px_18px_rgba(17,17,21,0.025)] transition-shadow hover:shadow-[0_8px_24px_rgba(17,17,21,0.05)] sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[#737373]">{label}</p>
        <div
          className={`rounded-lg p-2 ${
            warning
              ? "bg-[#fff0e8] text-[#b45324]"
              : "bg-[#fff6cf] text-[#755800]"
          }`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-3xl font-semibold tracking-tight text-[#202024]">
        {value}
      </p>

      <p className="mt-1 text-xs text-[#737373]">{detail}</p>

      {progress !== undefined && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#efefec]">
          <div
            className="h-full rounded-full bg-[#FDC517]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-medium text-[#45454d]">
        {label}
        {required && <span className="ml-1 text-[#b45324]">*</span>}
      </span>
      {children}
    </label>
  );
}

function RecordActions({
  onDetails,
  onEdit,
  onDelete,
}: {
  onDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onDetails}
        aria-label="View onboarding details"
        title="View details"
        className="rounded-lg p-2 text-[#737373] transition hover:bg-[#f4f4f2] hover:text-[#202024]"
      >
        <ArrowRight size={15} />
      </button>

      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="More onboarding actions"
        aria-expanded={open}
        className="rounded-lg p-2 text-[#737373] transition hover:bg-[#f4f4f2] hover:text-[#202024]"
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close actions menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-10 z-20 w-40 rounded-xl border border-[#e7e7e4] bg-white p-1.5 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition hover:bg-[#f7f7f5]"
            >
              <Pencil size={14} />
              Edit record
            </button>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onDelete();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-[#b42318] transition hover:bg-[#fff1ef]"
            >
              <Trash2 size={14} />
              Delete record
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-[#e7e7e4] p-3">
      <span className="mt-0.5 shrink-0 text-[#8a6900]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-[#737373]">{label}</p>
        <p className="mt-1 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
