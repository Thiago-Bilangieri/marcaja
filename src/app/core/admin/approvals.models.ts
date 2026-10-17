// Espelham os DTOs da Agendamento API (professional.dto e user.entity.ApprovalStatus)

export const APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

// O que a API faz a cada pedido: PATCH /api/admin/professionals/{id}/approve ou /reject
export type ApprovalAction = 'approve' | 'reject';

export interface ProfessionalAccount {
  id: number;
  name: string;
  email: string;
  approvalStatus: ApprovalStatus;
  active: boolean;
  createdAt: string;
}
