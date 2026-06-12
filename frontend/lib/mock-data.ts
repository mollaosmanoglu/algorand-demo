import type { Call } from "@/types/call"

const demoNow = "2026-06-06T18:00:00.000Z"

export const mockCalls: Call[] = [
  {
    id: "call-1",
    room_name: "demo-room-1",
    room_sid: "RM_DEMO_1",
    created_at: demoNow,
    finished_at: demoNow,
    duration_seconds: 213,
    caller_name: "Sophie de Vries",
    contact_number: "0612345678",
    case_qualified: true,
    case_priority: 8,
    qualification_reasoning: "The request is specific and needs prompt follow-up.",
    summary: "Caller wants advice about damage after a traffic accident and asks for an intake call.",
    lawyer_email: "demo@example.com",
    lawyer_name: "Demo advisor",
    recording_url: null,
    appointment_date: "2026-06-07T18:00:00.000Z",
    appointment_url: null,
    accident_type: "traffic accident",
    transcript: null,
  },
  {
    id: "call-2",
    room_name: "demo-room-2",
    room_sid: "RM_DEMO_2",
    created_at: "2026-06-05T18:00:00.000Z",
    finished_at: "2026-06-05T18:00:00.000Z",
    duration_seconds: 146,
    caller_name: "Milan Jansen",
    contact_number: "0687654321",
    case_qualified: false,
    case_priority: 4,
    qualification_reasoning: "Additional information is needed for an assessment.",
    summary: "Caller has a general question and receives information about next steps.",
    lawyer_email: "demo@example.com",
    lawyer_name: "Demo advisor",
    recording_url: null,
    appointment_date: null,
    appointment_url: null,
    accident_type: "other",
    transcript: null,
  },
  {
    id: "call-3",
    room_name: "demo-room-3",
    room_sid: "RM_DEMO_3",
    created_at: "2026-06-04T18:00:00.000Z",
    finished_at: "2026-06-04T18:00:00.000Z",
    duration_seconds: 284,
    caller_name: "Noah Bakker",
    contact_number: "0624681357",
    case_qualified: true,
    case_priority: 7,
    qualification_reasoning: "The situation contains enough detail for an intake.",
    summary: "Caller discusses a workplace accident and wants to know which documents are needed.",
    lawyer_email: "demo@example.com",
    lawyer_name: "Demo advisor",
    recording_url: null,
    appointment_date: "2026-06-08T18:00:00.000Z",
    appointment_url: null,
    accident_type: "workplace accident",
    transcript: null,
  },
]

export const weeklyChartData = [
  { day: "2026-06-01", calls: 8, rate: 62, avgMinutes: 3.1 },
  { day: "2026-06-02", calls: 12, rate: 68, avgMinutes: 3.4 },
  { day: "2026-06-03", calls: 9, rate: 71, avgMinutes: 3.2 },
  { day: "2026-06-04", calls: 15, rate: 73, avgMinutes: 3.8 },
  { day: "2026-06-05", calls: 13, rate: 76, avgMinutes: 3.6 },
  { day: "2026-06-06", calls: 18, rate: 78, avgMinutes: 4.1 },
  { day: "2026-06-07", calls: 11, rate: 74, avgMinutes: 3.7 },
]

export const hourlyChartData = [
  { hour: "08:00", calls: 1 },
  { hour: "10:00", calls: 3 },
  { hour: "12:00", calls: 5 },
  { hour: "14:00", calls: 4 },
  { hour: "16:00", calls: 6 },
  { hour: "18:00", calls: 2 },
]

export type InsuranceMetric = {
  id: string
  label: string
  value: string
  suffix: string
  description: string
  chartKey: "actions" | "value" | "premium" | "settlements"
}

export type InsuranceAction = {
  id: string
  agent: string
  action: string
  decision: "Allowed" | "Quoted" | "Covered" | "Denied" | "Recorded"
  risk: "Low" | "Medium" | "High"
  premium: string
  coverage: string
  settlement: string
  lastEvent: string
}

export const insuranceMetrics: InsuranceMetric[] = [
  {
    id: "active_agents",
    label: "Active agents",
    value: "6",
    suffix: "",
    description: "Agents currently streaming activity into the control room",
    chartKey: "actions",
  },
  {
    id: "actions_evaluated",
    label: "Actions evaluated",
    value: "14",
    suffix: "",
    description: "Tool calls priced, allowed, denied, or recorded today",
    chartKey: "actions",
  },
  {
    id: "covered_value",
    label: "Covered value",
    value: "$4.8",
    suffix: "k",
    description: "Economic action value protected by issued receipts",
    chartKey: "value",
  },
  {
    id: "premiums_collected",
    label: "Premiums collected",
    value: "$3.00",
    suffix: "",
    description: "x402 TestNet USDC premiums settled through Defter",
    chartKey: "premium",
  },
]

export const insuranceChartData = [
  { day: "2026-06-01", actions: 3, value: 850, premium: 0.46, settlements: 1 },
  { day: "2026-06-02", actions: 5, value: 1220, premium: 0.69, settlements: 2 },
  { day: "2026-06-03", actions: 4, value: 980, premium: 0.52, settlements: 2 },
  { day: "2026-06-04", actions: 7, value: 1860, premium: 1.05, settlements: 3 },
  { day: "2026-06-05", actions: 8, value: 2310, premium: 1.31, settlements: 4 },
  { day: "2026-06-06", actions: 10, value: 3700, premium: 2.09, settlements: 5 },
  { day: "2026-06-07", actions: 14, value: 5300, premium: 3.00, settlements: 7 },
]

export const insuranceActions: InsuranceAction[] = [
  {
    id: "act-1",
    agent: "Procurement Agent",
    action: "Buy API credits from new vendor",
    decision: "Covered",
    risk: "High",
    premium: "$0.91",
    coverage: "$1,500",
    settlement: "Settled",
    lastEvent: "x402 settled 2 min ago",
  },
  {
    id: "act-2",
    agent: "Research Agent",
    action: "Read vendor terms and pricing page",
    decision: "Allowed",
    risk: "Low",
    premium: "-",
    coverage: "-",
    settlement: "Not required",
    lastEvent: "Allowed 4 min ago",
  },
  {
    id: "act-3",
    agent: "Insurance Agent",
    action: "Evaluate purchase request",
    decision: "Quoted",
    risk: "Medium",
    premium: "$0.42",
    coverage: "$800",
    settlement: "Awaiting payment",
    lastEvent: "Quote issued 6 min ago",
  },
  {
    id: "act-4",
    agent: "E-commerce Agent",
    action: "Submit checkout form with payment scope",
    decision: "Covered",
    risk: "Medium",
    premium: "$0.38",
    coverage: "$650",
    settlement: "Settled",
    lastEvent: "Receipt issued 9 min ago",
  },
  {
    id: "act-5",
    agent: "Procurement Agent",
    action: "Attempt vendor transfer above policy limit",
    decision: "Denied",
    risk: "High",
    premium: "-",
    coverage: "-",
    settlement: "Blocked",
    lastEvent: "Denied 12 min ago",
  },
  {
    id: "act-6",
    agent: "Risk Analyst Agent",
    action: "Score vendor reputation and model confidence",
    decision: "Recorded",
    risk: "Medium",
    premium: "-",
    coverage: "-",
    settlement: "Not required",
    lastEvent: "Risk score updated 15 min ago",
  },
  {
    id: "act-7",
    agent: "Settlement Agent",
    action: "Verify Defter receipt and LORA reference",
    decision: "Covered",
    risk: "Low",
    premium: "$0.27",
    coverage: "$500",
    settlement: "Settled",
    lastEvent: "Settlement confirmed 18 min ago",
  },
]
