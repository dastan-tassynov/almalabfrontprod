import { Role, TemplateStatus } from './template-document.model';

export function canUpload(role: Role) {
  return role === 'USER';
}

export function canAdminSign(role: Role, status: TemplateStatus) {
  return role === 'ADMIN' && status === 'SENT_TO_ADMIN';
}

export function canSuperSign(role: Role, status: TemplateStatus) {
  return role === 'SUPERADMIN' && status === 'SENT_TO_SUPERADMIN';
}

export function canReturnForFix(role: Role, status: TemplateStatus) {
  return role === 'ADMIN' && status === 'SENT_TO_ADMIN';
}

export function isReadonly(status: TemplateStatus) {
  return status === 'COMPLETED';
}
