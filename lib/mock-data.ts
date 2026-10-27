
export const employees = [
  {
    id: "NK001",
    name: "Amara Okafor",
    department: "Marketing",
    role: "Marketing Executive",
    manager: "David James",
    status: "Active",
  },
  {
    id: "NK002",
    name: "Daniel Adeyemi",
    department: "Engineering",
    role: "Frontend Engineer",
    manager: "Michael Peters",
    status: "Active",
  },
  {
    id: "NK003",
    name: "Sarah Williams",
    department: "Human Resources",
    role: "HR Officer",
    manager: "HR Admin",
    status: "Active",
  },
  {
    id: "NK004",
    name: "Tunde Bakare",
    department: "Finance",
    role: "Accountant",
    manager: "Sarah Johnson",
    status: "Active",
  },
  {
    id: "NK005",
    name: "Grace Eze",
    department: "Engineering",
    role: "Product Designer",
    manager: "Michael Peters",
    status: "Active",
  },
];

export const leaveRequests = [
  {
    id: "LR001",
    employee: "Amara Okafor",
    department: "Marketing",
    type: "Annual Leave",
    startDate: "2026-10-26",
    endDate: "2026-10-30",
    days: 5,
    status: "Pending",
  },
  {
    id: "LR002",
    employee: "Daniel Adeyemi",
    department: "Engineering",
    type: "Annual Leave",
    startDate: "2026-10-22",
    endDate: "2026-10-23",
    days: 2,
    status: "Approved",
  },
  {
    id: "LR003",
    employee: "Grace Eze",
    department: "Engineering",
    type: "Sick Leave",
    startDate: "2026-10-19",
    endDate: "2026-10-19",
    days: 1,
    status: "Approved",
  },
];

export const appraisalSummary = {
  reviewPeriod: "Q3 2026",
  employeesInReview: 24,
  selfAppraisalsSubmitted: 18,
  managerReviewsCompleted: 12,
  awaitingManagerReview: 6,
};
