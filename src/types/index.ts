export type UserRole = 'ADMIN'|'CHAIRMAN'|'MINISTER'|'MP'|'PUBLIC';
export type VoteChoice = 'YES'|'NO'|'ABSTAIN';
export type ProposalStatus = 'OPEN'|'CLOSED'|'PASSED'|'REJECTED';
export type ComplaintStatus = 'PENDING'|'UNDER_REVIEW'|'RESOLVED'|'REJECTED';
export type RumorStatus = 'REPORTED'|'UNDER_REVIEW'|'VERIFIED_TRUE'|'VERIFIED_FALSE'|'PUBLISHED';
export type FundType = 'DONATION'|'EXPENSE';
export interface AuthUser { id: string; email: string; name: string; role: UserRole; }
export interface ApiResponse<T=unknown> { success: boolean; data?: T; error?: string; message?: string; }
