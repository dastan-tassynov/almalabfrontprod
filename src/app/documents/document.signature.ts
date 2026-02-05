export interface DocumentSignature {
  signerFullName: string;
  signerRole: 'ADMIN' | 'SUPERADMIN';
  signedAt: string;
}
