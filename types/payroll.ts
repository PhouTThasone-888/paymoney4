export interface Position {
  position_id: number;
  position_name: string;
  base_salary: number;
}

export interface Salary {
  salary_id: number;
  emp_id: number | null;
  title: string | null;
  base_salary: number | null;
  bank_name: string | null;
}

export interface LeaveRequest {
  leave_id: number;
  emp_id: number | null;
  leave_type: string | null;
  start_date: string | null;
  end_date: string | null;
}

export interface AllowanceDeduction {
  adjustment_id: number;
  description: string | null;
  emp_id: number | null;
  type: string | null; // "ALLOWANCE" | "DEDUCTION"
  amount: number;
  period_month: number | null;
  period_year: number | null;
}

export interface BankTransfer {
  transfer_id: number;
  payroll_id: number | null;
  bank_response_code: string | null;
  amount_transferred: number;
  transfer_date: string;
}

export interface Employee {
  emp_id: number;
  position_id: number | null;
  emp_name: string;
  email: string | null;
  bank_number: string | null;
  status: string | null;
  gender: string | null;
  position?: Position | null;
  salaries?: Salary[];
  leave_requests?: LeaveRequest[];
  allowances_deductions?: AllowanceDeduction[];
}

export interface Payroll {
  payroll_id: number;
  emp_id: number | null;
  pay_period_month: number | null;
  total_deductions: number | null;
  total_all: number | null;
  net_salary: number;
  calculated_at: string;
  employee?: Employee | null;
  bank_transfers?: BankTransfer[];
}