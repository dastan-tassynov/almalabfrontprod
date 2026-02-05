import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TemplateDocument } from './template-document.model';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private api = 'http://localhost:9090/templates';

  constructor(private http: HttpClient) {}

  myDocs() {
    return this.http.get<TemplateDocument[]>(`${this.api}/my`);
  }

  // upload(file: File) {
  //   const form = new FormData();
  //   form.append('file', file);
  //   return this.http.post(`${this.api}/upload`, form);
  // }

  upload(file: File, category: string) {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);

    return this.http.post(`${this.api}/upload`, form);
  }

  adminSign(id: number) {
    return this.http.post(`${this.api}/${id}/admin-sign`, {});
  }

  superSign(id: number) {
    return this.http.post(`${this.api}/${id}/super-sign`, {});
  }

  returnForFix(id: number, comment: string) {
    return this.http.post(
      `/${id}/return`,
      { comment }
    );
  }

  getPdf(id: number) {
    return this.http.get(
      `${this.api}/${id}/file`,
      { responseType: 'blob' }
    );
  }

  reupload(id: number, file: File) {
    const form = new FormData();
    form.append('file', file);

    return this.http.post<TemplateDocument>(
      `${this.api}/${id}/return`,
      form
    );
  }

  getDocumentsByRole(role: 'USER' | 'ADMIN' | 'SUPERADMIN') {
    if (role === 'ADMIN') {
      return this.http.get<TemplateDocument[]>(
        `${this.api}/inbox-admin`
      );
    }

    if (role === 'SUPERADMIN') {
      return this.http.get<TemplateDocument[]>(
        `${this.api}/inbox-super`
      );
    }

    return this.http.get<TemplateDocument[]>(
      `${this.api}/my`
    );
  }

}
