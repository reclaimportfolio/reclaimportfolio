import { apiRequest } from "../lib/apiClient.js";

export const getDashboardOverview = () => apiRequest("dashboard/overview/", { auth: true });
export const getDashboardCases = () => apiRequest("dashboard/cases/", { auth: true });
export const getDashboardActivity = () => apiRequest("dashboard/activity/", { auth: true });
export const getDashboardReports = () => apiRequest("dashboard/reports/", { auth: true });
export const getDashboardAssets = () => apiRequest("dashboard/assets/", { auth: true });
export const getDashboardTransactions = () => apiRequest("dashboard/transactions/", { auth: true });
export const createDashboardDepositReview = (payload) => apiRequest("dashboard/deposits/", { method: "POST", body: payload, auth: true });
export const createDashboardWithdrawalRequest = (payload) => apiRequest("dashboard/withdrawals/", { method: "POST", body: payload, auth: true });
export const createDashboardSwapRequest = (payload) => apiRequest("dashboard/swaps/", { method: "POST", body: payload, auth: true });
export const createDashboardStockBuyRequest = (payload) => apiRequest("dashboard/stock-buys/", { method: "POST", body: payload, auth: true });
export const createDashboardStockSellRequest = (payload) => apiRequest("dashboard/stock-sells/", { method: "POST", body: payload, auth: true });
