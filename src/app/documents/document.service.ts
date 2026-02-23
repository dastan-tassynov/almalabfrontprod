import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TemplateDocument } from './template-document.model';
import {Observable} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DocumentService {

  private api = 'https://tissue-story-illustrations-defined.trycloudflare.com/templates';

  constructor(private http: HttpClient) {}

  myDocs() {
    return this.http.get<TemplateDocument[]>(`${this.api}/my`);
  }

  // upload(file: File) {
  //   const form = new FormData();
  //   form.append('file', file);
  //   return this.http.post(`${this.api}/upload`, form);
  // }

  upload(file: File, category: string, organization: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    formData.append('organization', organization); // Добавляем в запрос

    return this.http.post(`${this.api}/upload`, formData);
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

  reupload(id: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    // Используем новый эндпоинт /reupload
    return this.http.post(`${this.api}/${id}/reupload`, formData);
  }

  getPublicVerifyInfo(id: string | number) {
    // Обрати внимание на путь, он должен совпадать с Java (VerifyController)
    return this.http.get(`https://tissue-story-illustrations-defined.trycloudflare.com/api/public/verify/${id}`);
  }

  getDocsByOrg(orgName: string): Observable<any[]> {
    // Вызываем наш новый эндпоинт
    return this.http.get<any[]>(`https://tissue-story-illustrations-defined.trycloudflare.com/api/public/verify/organization/${orgName}`);
  }

  downloadGuestFile(id: number, filename: string) {
    this.http.get(`https://tissue-story-illustrations-defined.trycloudflare.com/api/public/verify/download/${id}`, {
      responseType: 'blob'
    }).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
