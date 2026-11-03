"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  CalendarDays,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { ApiError } from "@/lib/api/types";
import { getEmployee } from "@/lib/hr/api";
import type { Employee } from "@/lib/hr/types";

export default function EmployeeProfilePage() {
  const { user, hasPermission } = useAuth();
  const employeeId = user?.employeeId ?? null;
  const canReadEmployee = hasPermission("employee.read");

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!employeeId || !canReadEmployee) return;
    setLoading(true);
    setError(null);
    try {
      setEmployee(await getEmployee(employeeId));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not load your employee profile.",
      );
    } finally {
      setLoading(false);
    }
  }, [employeeId, canReadEmployee]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My profile</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Account details from your login, plus the linked HR employee record
          when available.
        </p>
      </div>

      <Section
        icon={ShieldCheck}
        title="Account"
        description="Signed-in identity used for Google Workspace access."
      >
        <Field label="Email" value={user.email} />
        <Field label="User ID" value={user.id} mono />
        <Field
          label="Organisation ID"
          value={user.organisationId}
          mono
        />
        <Field
          label="Employee link"
          value={employeeId ?? "Not linked"}
          mono={!employeeId}
        />
      </Section>

      {!employeeId ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
          Your user account is not linked to an employee record yet. Ask HR to
          set <code className="text-xs">employeeId</code> on your user (or link
          it when creating/editing the employee).
        </div>
      ) : !canReadEmployee ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
          You need <code className="text-xs">employee.read</code> to view the
          linked employee profile.
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm text-[var(--muted)]">
          Loading employee profile…
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          {error}
        </div>
      ) : employee ? (
        <>
          <Section
            icon={UserRound}
            title="Personal"
            description="Name and contact details from your employee record."
          >
            <Field label="First name" value={employee.firstName} />
            <Field label="Last name" value={employee.lastName} />
            <Field
              label="Preferred name"
              value={employee.preferredName ?? "—"}
            />
            <Field label="Work email" value={employee.workEmail} />
            <Field label="Phone" value={employee.phone ?? "—"} />
            <Field label="Employee number" value={employee.employeeNumber} />
          </Section>

          <Section
            icon={BriefcaseBusiness}
            title="Role"
            description="Organisation placement and employment details."
          >
            <Field label="Job title" value={employee.jobTitle} />
            <Field label="Department" value={employee.departmentName} />
            <Field
              label="Employment type"
              value={formatEnum(employee.employmentType)}
            />
            <Field label="Status" value={formatEnum(employee.status)} />
            <Field
              label="Manager"
              value={employee.managerName ?? "—"}
            />
            <Field
              label="Hire date"
              value={formatDate(employee.hireDate)}
            />
          </Section>

          <Section
            icon={CalendarDays}
            title="Record"
            description="System timestamps for this employee."
          >
            <Field label="Created" value={formatDateTime(employee.createdAt)} />
            <Field label="Updated" value={formatDateTime(employee.updatedAt)} />
            <Field
              label="Login linked"
              value={employee.userAccountId ? "Yes" : "No"}
            />
            <Field
              label="Phone"
              value={employee.phone ? "On file" : "Not set"}
            />
          </Section>
        </>
      ) : null}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-start gap-3 border-b border-[var(--border)] px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface)] text-[var(--foreground)]">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 text-sm font-medium text-[var(--muted)]">{label}</p>
      <div
        className={`rounded-xl border border-[var(--border)] bg-[var(--surface)]/40 px-3 py-2.5 text-sm ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function formatEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString();
}
