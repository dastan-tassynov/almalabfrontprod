// template-document.model.ts
import {DocumentSignature} from './document.signature';

export type TemplateStatus =
  | 'NEW'
  | 'SENT_TO_ADMIN'
  | 'SENT_TO_SUPERADMIN'
  | 'RETURNED'
  | 'COMPLETED';

export type Role = 'USER' | 'ADMIN' | 'SUPERADMIN';
export interface TemplateDocument {
  id: number;
  filename: string;
  category: string;
  status:
    | 'NEW'
    | 'SENT_TO_ADMIN'
    | 'SENT_TO_SUPERADMIN'
    | 'COMPLETED'
    | 'RETURNED';

  createdAt: string;
  returnComment?: string;
  signatures?: DocumentSignature[];
}



