export interface Credit {
    id: string;
    amount: number;
    remainingAmount: number;
    monthlyPayment: number;
    rate: number;
    term: number;
    startDate: string;
    status: "active" | "closed";
}
