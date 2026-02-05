import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from './document.service';
import { AuthService } from '../auth/auth.service';
import {
  TemplateDocument,
  Role
} from './template-document.model';
import * as Rules from './document.rules';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./document.component.css']
})
export class DocumentsComponent implements OnInit {

  documents: TemplateDocument[] = [];
  role!: Role;
  loading = true;
  returnDoc?: TemplateDocument;
  returnComment = '';

  canUpload = Rules.canUpload;
  canAdminSign = Rules.canAdminSign;
  canSuperSign = Rules.canSuperSign;
  canReturnForFix = Rules.canReturnForFix;

  constructor(
    private docs: DocumentService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.role = this.auth.getRole();
    this.loadDocuments();
    this.load();
  }

  load() {
    this.loading = true;
    this.docs.myDocs().subscribe(docs => {
      this.documents = docs;
      this.loading = false;
      this.calculateCounters();
    });
  }

  // upload(file: File | null) {
  //   if (!file) return;
  //   this.docs.upload(file).subscribe(() => this.load());
  // }

  adminSign(id: number) {
    this.docs.adminSign(id).subscribe(() => this.load());
  }

  superSign(id: number) {
    this.docs.superSign(id).subscribe(() => this.load());
  }

  returnFix(id: number) {
    const comment = prompt('Комментарий');
    if (!comment) return;
    this.docs.returnForFix(id, comment).subscribe(() => this.load());
  }


  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];

    const category = prompt('Введите категорию документа');
    if (!category) return;

    this.docs.upload(file, category).subscribe(() => {
      this.loadDocuments();
    });
  }


  previewUrl: string | null = null;

  openFile(d: TemplateDocument) {
    this.docs.getPdf(d.id).subscribe(blob => {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl);
      }

      this.previewUrl = URL.createObjectURL(blob);
    });
  }

  downloadFile(d: TemplateDocument) {
    this.docs.getPdf(d.id).subscribe(blob => {
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = d.filename;
      a.click();

      URL.revokeObjectURL(url);
    });
  }

  closePreview() {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }
    this.previewUrl = null;
  }

  viewPdf(id: number) {
    this.router.navigate(['/documents', id, 'view']);
  }

  statusLabel: Record<string, string> = {
    NEW: 'Новый',
    SENT_TO_ADMIN: 'Ожидает администратора',
    RETURNED: 'Возвращён на доработку',
    SENT_TO_SUPERADMIN: 'Ожидает финальной подписи',
    COMPLETED: 'Завершён'
  };

  userHint: Record<string, string> = {
    NEW: 'Документ отправлен администратору',
    RETURNED: 'Документ возвращён. Загрузите исправленную версию',
    SENT_TO_ADMIN: '',
    SENT_TO_SUPERADMIN: '',
    COMPLETED: 'Документ полностью подписан'
  };

  roleLabel: Record<string, string> = {
    ADMIN: 'Администратор',
    SUPERADMIN: 'Суперадминистратор'
  };

  counters = {
    inWork: 0,
    toAdmin: 0,
    toSuper: 0,
    completed: 0
  };

  calculateCounters() {
    this.counters = {
      inWork: 0,
      toAdmin: 0,
      toSuper: 0,
      completed: 0
    };

    for (const d of this.documents) {
      switch (d.status) {
        case 'NEW':
          this.counters.inWork++;
          break;
        case 'SENT_TO_ADMIN':
          this.counters.toAdmin++;
          break;
        case 'SENT_TO_SUPERADMIN':
          this.counters.toSuper++;
          break;
        case 'COMPLETED':
          this.counters.completed++;
          break;
      }
    }
  }
  openReturn(doc: TemplateDocument) {
    this.returnDoc = doc;
    this.returnComment = '';
  }

  reupload(docId: number, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    this.docs.reupload(docId, file).subscribe(() => {
      this.loadDocuments();
    });
  }

  loadDocuments() {
    this.loading = true;

    this.docs.getDocumentsByRole(this.role)
      .subscribe(res => {
        this.documents = res;
        this.loading = false;
      });
  }

  closeReturn() {
    this.returnDoc = undefined;
  }

  confirmReturn() {
    if (!this.returnDoc) return;

    this.docs.returnForFix(
      this.returnDoc.id,
      this.returnComment
    ).subscribe(() => {
      this.loadDocuments();
      this.closeReturn();
    });
  }


}


