import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TemplateDocument } from './template-document.model';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private api = 'http://bore.pub:8862/templates';

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
      `${this.api}/${id}/return`,
      { comment }
    );
  }

  getDocx(id: number) {
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

  // getDocumentsByRole(role: string) {
  //   const token = localStorage.getItem('token');
  //   const headers = { 'Authorization': `Bearer ${token}` };
  //   const url = role === 'USER' ? `${this.api}/my` : `${this.api}/inbox`;
  //
  //   return this.http.get<any[]>(url, { headers }); // Передаем хедеры напрямую
  // }

  getDocumentsByRole(role: string) {
    let endpoint = '';

    // Проверяем роль и выбираем правильный путь
    if (role === 'ADMIN') {
      endpoint = '/inbox-admin';
    } else if (role === 'SUPERADMIN') {
      endpoint = '/inbox-super';
    } else {
      endpoint = '/my'; // Для обычного юзера
    }

    return this.http.get<any[]>(`${this.api}${endpoint}`);
  }
}
