// Analytics and Reporting Types

export interface MonthlyDataPoint {
  date: string;
  value: number;
}

export interface MetricWithChange {
  total: number;
  change: number;
  monthly?: MonthlyDataPoint[];
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  profit: number;
  expenses: number;
}

export interface FinancialData {
  revenue: MetricWithChange;
  expenses: MetricWithChange;
  profit: MetricWithChange;
  profitMargin: {
    total: number;
    change: number;
  };
  revenueByCategory: CategoryRevenue[];
}

export interface JobDistribution {
  type: string;
  percentage: number;
}

export interface JobCompletionTime {
  type: string;
  days: number;
}

export interface OperationsData {
  totalJobs: MetricWithChange;
  completedJobs: {
    total: number;
    completionRate: number;
    monthly: MonthlyDataPoint[];
  };
  averageJobValue: MetricWithChange;
  customerSatisfaction: {
    total: number;
    reviews: number;
  };
  jobDistribution: JobDistribution[];
  jobCompletionTime: JobCompletionTime[];
}

export interface LowStockItem {
  name: string;
  quantity: number;
  threshold: number;
}

export interface MaterialUsageByType {
  type: string;
  usage: number;
}

export interface MaterialsData {
  totalMaterialCost: MetricWithChange;
  materialUsage: MetricWithChange;
  lowStockItems: {
    total: number;
    items: LowStockItem[];
  };
  materialWaste: MetricWithChange;
  materialUsageByType: MaterialUsageByType[];
}

export interface TopContractor {
  name: string;
  completedJobs: number;
}

export interface ContractorsData {
  activeContractors: MetricWithChange;
  contractorPayments: {
    total: number;
    monthly: MonthlyDataPoint[];
  };
  averageRating: {
    total: number;
    monthly: MonthlyDataPoint[];
  };
  jobsPerContractor: {
    total: number;
  };
  topContractors: TopContractor[];
}

// Report filters and parameters
export interface ReportDateRange {
  startDate: Date;
  endDate: Date;
}

export interface ReportFilter {
  dateRange?: ReportDateRange;
  category?: string;
  contractor?: string;
  status?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

// Export types
export type ExportFormat = "csv" | "pdf" | "xlsx";

export interface ExportOptions {
  format: ExportFormat;
  filename: string;
  includeCharts?: boolean;
  dateRange?: ReportDateRange;
}

// Dashboard metrics
export interface DashboardMetrics {
  financial: FinancialData;
  operations: OperationsData;
  materials: MaterialsData;
  contractors: ContractorsData;
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
  }>;
}

export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
  }>;
}

export interface PieChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    backgroundColor: string[];
  }>;
}