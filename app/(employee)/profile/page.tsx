
"use client";

import { useRef, useState } from "react";
import {
  Camera,
  UserRound,
  BriefcaseBusiness,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Save,
  Pencil,
  CheckCircle2,
  Upload,
  X,
  Info,
} from "lucide-react";

type Profile = {
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  phone: string;
  location: string;
  jobTitle: string;
  department: string;
  employeeId: string;
  manager: string;
  employmentType: string;
  startDate: string;
};

const initialProfile: Profile = {
  firstName: "Oluwatosin",
  lastName: "Akinbobola",
  preferredName: "Tosin",
  email: "tosin@neukleos.com",
  phone: "",
  location: "Lagos, Nigeria",
  jobTitle: "Junior Frontend Engineer",
  department: "Engineering",
  employeeId: "NK54",
  manager: "",
  employmentType: "Full-time",
  startDate: "",
};

type SectionProps = {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
};

function Section({ icon: Icon, title, description, children }: SectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="flex items-start gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
          <Icon size={19} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm leading-5 text-gray-500">{description}</p>
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
  onChange,
  placeholder,
  type = "text",
  readOnly = false,
  helpText,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
  helpText?: string;
}) {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`h-11 w-full rounded-lg border px-3.5 text-sm outline-none transition ${
          readOnly
            ? "cursor-default border-gray-200 bg-gray-50 text-gray-500"
            : "border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-[#D6A900] focus:ring-2 focus:ring-[#FDC517]/20"
        }`}
      />
      {helpText && (
        <p className="mt-1.5 text-xs leading-5 text-gray-400">{helpText}</p>
      )}
    </div>
  );
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [savedProfile, setSavedProfile] = useState<Profile>(initialProfile);
  const [photo, setPhoto] = useState<string | null>(null);
  const [savedPhoto, setSavedPhoto] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const initials =
    `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setProfile((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  }

  function handlePhotoChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Your profile photo must be 5 MB or smaller.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setMessage("");
        setError("");
      }
    };

    reader.onerror = () => setError("We couldn't read that image. Try again.");
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setSavedProfile({ ...profile });
    setSavedPhoto(photo);
    setEditing(false);
    setError("");
    setMessage("Your profile changes have been saved in this demo.");
  }

  function cancelEditing() {
    setProfile({ ...savedProfile });
    setPhoto(savedPhoto);
    setEditing(false);
    setError("");
    setMessage("");
  }

  return (
    <div className="min-h-full bg-[#F7F7F8] text-[#222226]">
      <div className="mx-auto max-w-[1200px] space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-medium text-gray-500">
              Workspace / My Profile
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#17171B] sm:text-3xl">
              My Profile
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">
              Manage your personal details and view your employment information.
            </p>
          </div>

          {!editing ? (
            <button
              onClick={() => {
                setEditing(true);
                setMessage("");
                setError("");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FDC517] px-4 text-sm font-semibold text-[#171717] transition hover:bg-[#edb900]"
            >
              <Pencil size={15} />
              Edit profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={cancelEditing}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#FDC517] px-4 text-sm font-semibold text-[#171717] hover:bg-[#edb900]"
              >
                <Save size={15} />
                Save changes
              </button>
            </div>
          )}
        </div>

        {message && (
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
            <Info size={18} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* Profile identity card */}
        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="h-24 bg-[#17171B] sm:h-32">
            <div className="h-full bg-[radial-gradient(ellipse_at_top_right,rgba(253,197,23,0.2),transparent_55%)]" />
          </div>

          <div className="px-5 pb-5 sm:px-7 sm:pb-6">
            <div className="-mt-11 flex flex-col gap-4 sm:-mt-12 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <div className="relative shrink-0">
                  {photo ? (
                    <img
                      src={photo}
                      alt={`${fullName}'s profile`}
                      className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-sm sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-[#FDC517] text-2xl font-semibold text-[#171717] shadow-sm sm:h-28 sm:w-28">
                      {initials || "U"}
                    </div>
                  )}

                  {editing && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload profile photo"
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#17171B] text-white hover:bg-gray-700"
                    >
                      <Camera size={16} />
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) =>
                      handlePhotoChange(event.target.files?.[0])
                    }
                  />
                </div>

                <div className="min-w-0 pb-1">
                  <h2 className="break-words text-xl font-semibold text-gray-900 sm:text-2xl">
                    {fullName || "Your name"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {profile.jobTitle || "Job title not set"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      {profile.employeeId}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                      Active employee
                    </span>
                  </div>
                </div>
              </div>

              {editing && photo && (
                <button
                  onClick={() => {
                    setPhoto(null);
                    setMessage("");
                  }}
                  className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-gray-500 hover:text-red-600 sm:mb-1"
                >
                  <X size={14} />
                  Remove photo
                </button>
              )}
            </div>

            {editing && (
              <div className="mt-5 flex items-start gap-2 rounded-lg bg-gray-50 p-3 text-xs leading-5 text-gray-500">
                <Upload size={15} className="mt-0.5 shrink-0" />
                Upload a JPG, PNG or other supported image up to 5 MB. Your
                photo is only previewed locally in this demo.
              </div>
            )}
          </div>
        </section>

        {/* Personal information */}
        <Section
          icon={UserRound}
          title="Personal information"
          description="Your name and personal contact details."
        >
          <Field
            label="First name"
            value={profile.firstName}
            onChange={(value) => update("firstName", value)}
            readOnly={!editing}
            placeholder="Enter first name"
          />
          <Field
            label="Last name"
            value={profile.lastName}
            onChange={(value) => update("lastName", value)}
            readOnly={!editing}
            placeholder="Enter last name"
          />
          <Field
            label="Preferred name"
            value={profile.preferredName}
            onChange={(value) => update("preferredName", value)}
            readOnly={!editing}
            placeholder="What should we call you?"
          />
          <Field
            label="Work email"
            value={profile.email}
            type="email"
            readOnly
            helpText="Contact HR if your work email needs to be changed."
          />
          <Field
            label="Phone number"
            value={profile.phone}
            onChange={(value) => update("phone", value)}
            readOnly={!editing}
            placeholder="Enter phone number"
          />
          <Field
            label="Location"
            value={profile.location}
            onChange={(value) => update("location", value)}
            readOnly={!editing}
            placeholder="City or work location"
          />
        </Section>

        {/* Employment information */}
        <Section
          icon={BriefcaseBusiness}
          title="Employment information"
          description="Your role and position within the organisation."
        >
          <Field
            label="Employee ID"
            value={profile.employeeId}
            readOnly
            helpText="Assigned by HR."
          />
          <Field
            label="Job title"
            value={profile.jobTitle}
            readOnly
          />
          <Field
            label="Department"
            value={profile.department}
            readOnly
          />
          <Field
            label="Line manager"
            value={profile.manager}
            readOnly
            placeholder="Not assigned"
            helpText="Your reporting manager is managed by HR."
          />
          <Field
            label="Employment type"
            value={profile.employmentType}
            readOnly
          />
          <Field
            label="Start date"
            value={profile.startDate}
            readOnly
            placeholder="Not provided"
          />
        </Section>

        {/* Account information */}
        <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
              <ShieldCheck size={19} />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-gray-900">
                Account and security
              </h2>
              <p className="mt-1 text-sm leading-5 text-gray-500">
                Your account access and security settings.
              </p>

              <div className="mt-4 flex flex-col justify-between gap-3 rounded-xl border border-gray-100 p-4 sm:flex-row sm:items-center">
                <div className="flex items-start gap-3">
                  <Mail size={17} className="mt-0.5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      Work account
                    </p>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      {profile.email}
                    </p>
                  </div>
                </div>
                <span className="w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                  Active
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-gray-400">
                Password changes and account security actions will be connected
                when authentication is implemented.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom note */}
        <div className="flex items-start gap-2.5 rounded-xl border border-gray-200 bg-white p-4">
          <Phone size={17} className="mt-0.5 shrink-0 text-gray-400" />
          <p className="text-xs leading-5 text-gray-500">
            Keep your contact details up to date so the right people can reach
            you when needed. Employment details are managed through the
            organisation&apos;s HR process.
          </p>
        </div>
      </div>
    </div>
  );
}
