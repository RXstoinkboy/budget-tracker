import { CategoryDto } from '@/features/categories/api/types';
import { DateTime } from 'luxon';

export type BudgetDto = {
    id: string;
    amount: number;
    description: string;
    category_id: string | null;
    category: Pick<CategoryDto, 'name' | 'icon' | 'icon_color'> | null;
    start_date: string;
    end_date: string;
};

export type CreateBudgetDto = Omit<BudgetDto, 'id' | 'category'>;
export type UpdateBudgetDto = Omit<BudgetDto, 'category'>;

export type BudgetFilters = {
    start_date: DateTime;
    end_date: DateTime;
};

// TRANSACTIONS SUMMARY
// Basic interfaces for raw data
export interface TransactionSummary {
    category_id: string;
    total_amount: number;
}

export interface ExtendedTransactionSummary extends TransactionSummary {
    name: CategoryDto['name'];
    icon: CategoryDto['icon'];
    icon_color: CategoryDto['icon_color'];
}

// Interface for enriched budget with spent amount
export type EnrichedBudget = BudgetDto & {
    spent: number;
};

// Interface for not planned categories
export interface UnplannedCategory {
    category_id: string;
    name: CategoryDto['name'];
    icon: CategoryDto['icon'];
    icon_color: CategoryDto['icon_color'];
    spent: number;
}

// Interface for totals
export interface BudgetTotals {
    planned: number;
    spentInPlanned: number;
    spentAll: number;
}

// Interface for not planned data
export interface NotPlannedData {
    planned: number;
    budget: EnrichedBudget | null;
    totalSpent: number;
    categories: UnplannedCategory[];
}

// Main result interface
export interface ProcessedBudgetData {
    budgets: EnrichedBudget[];
    total: BudgetTotals;
    uncategorized: NotPlannedData;
}

// Query result interface
export interface BudgetQueryResult {
    data: ProcessedBudgetData | null;
    // Add other query properties like isLoading, error, etc.
    isLoading: boolean;
    isError: boolean;
    error: unknown;
}
