import {ChangeDetectorRef, Component, ElementRef, HostListener, OnInit} from '@angular/core';
import { DocumentService } from './document.service';
import { AuthService } from '../auth/auth.service';
import {CommonModule, DatePipe} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-documents',
  standalone: true,
  templateUrl: './documents.component.html',
  imports: [
    DatePipe,
    CommonModule,
    FormsModule
  ],
  styleUrls: ['./document.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: any[] = [];
  filteredDocuments: any[] = [];
  role: string = '';
  loading: boolean = false;
  showFilters: boolean = false;

  currentFilter: string = 'Все';
  docCategories: string[] = [
    'Вода хим бутилированная', 'Вода хим водопроводная', 'Протокол бассейн бак',
    'Смывы пищевые', 'Смывы паразитология', 'Вода паразитология',
    'Почва паразитология', 'Бассейн паразитология', 'Воздух бак',
    'Смывы ЛПУ', 'Стерильность', '303.3.ЭМП',
    'Ф-ПР-AL-15-14 Микроклимат', 'Ф-ПР-AL-15-15 Освещенность',
    'Вода бак', 'Пища', 'Контроль автоклава', 'Почва бак'
  ];

  returnDoc: any = null;
  returnComment: string = '';

  counters = { inWork: 0, toAdmin: 0, toSuper: 0, completed: 0 };

  statusLabel: any = {
    'IN_WORK': 'В работе',
    'SENT_TO_ADMIN': 'У админа',
    'SENT_TO_SUPERADMIN': 'У супера',
    'COMPLETED': 'Завершен',
    'RETURNED': 'Возврат'
  };

  roleLabel: any = {
    'USER': 'Сотрудник',
    'ADMIN': 'Администратор',
    'SUPERADMIN': 'Директор'
  };

  constructor(private docService: DocumentService,
              private auth: AuthService,
              private cdr: ChangeDetectorRef,
              private eRef: ElementRef) {}

  ngOnInit() {
    this.auth.role$.subscribe(r => {
      this.role = r;
      if (r) this.loadDocuments(r);
    });
  }

  @HostListener('document:mousedown', ['$event'])
  onGlobalClick(event: MouseEvent): void {
    // Находим саму кнопку фильтра и выпадающее меню
    const filterBtn = this.eRef.nativeElement.querySelector('.filter-trigger-btn');
    const dropdown = this.eRef.nativeElement.querySelector('.dropdown-list');

    // Если кликнули НЕ по кнопке и НЕ по самому меню — закрываем
    if (
      this.showFilters &&
      filterBtn && !filterBtn.contains(event.target as Node) &&
      dropdown && !dropdown.contains(event.target as Node)
    ) {
      this.showFilters = false;
    }
  }

  // loadDocuments(role: string) {
  //   this.loading = true;
  //   console.log('Начинаю загрузку для роли:', role);
  //
  //   this.docService.getDocumentsByRole(role).subscribe({
  //     next: (data) => {
  //       console.log('Данные от сервера получены:', data);
  //
  //       // 1. Присваиваем данные ПЕРВЫМИ
  //       this.documents = data || [];
  //       this.filteredDocuments = [...this.documents];
  //
  //       // 2. Оборачиваем расчеты в try-catch, чтобы loading точно стал false
  //       try {
  //         this.calculateCounters();
  //       } catch (e) {
  //         console.error('Ошибка в calculateCounters:', e);
  //       }
  //
  //       // 3. Выключаем индикатор загрузки
  //       this.loading = false;
  //       this.cdr.detectChanges();
  //       console.log('Загрузка завершена успешно');
  //     },
  //     error: (err) => {
  //       console.error('Ошибка в подписке:', err);
  //       this.loading = false;
  //     }
  //   });
  // }


// В loadDocuments тоже вызываем правильный фильтр
  loadDocuments(role: string) {
    this.loading = true;
    this.docService.getDocumentsByRole(role).subscribe({
      next: (data) => {
        this.documents = data || [];
        this.applyFilter('Все'); // По умолчанию активные задачи
        this.calculateCounters();
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  applyFilter(category: string) {
    this.currentFilter = category;
    this.showFilters = false;

    if (category === 'Все' || category === 'All') {
      // Показываем всё, кроме завершенных
      this.filteredDocuments = this.documents.filter(d => d.status !== 'COMPLETED');
    } else {
      // Умный поиск: приводим всё к нижнему регистру и ищем вхождение слова
      const searchLow = category.toLowerCase();
      this.filteredDocuments = this.documents.filter(d => {
        const docCatLow = d.category.toLowerCase();
        // Условие: либо полное совпадение, либо категория документа содержит слово из фильтра
        return docCatLow.includes(searchLow) || searchLow.includes(docCatLow);
      });
    }
  }


  calculateCounters() {
    if (!this.documents) return;

    this.counters = {
      inWork: this.documents.filter(d => d && d.status === 'IN_WORK').length,
      toAdmin: this.documents.filter(d => d && d.status === 'SENT_TO_ADMIN').length,
      toSuper: this.documents.filter(d => d && d.status === 'SENT_TO_SUPERADMIN').length,
      completed: this.documents.filter(d => d && d.status === 'COMPLETED').length
    };
  }

  // Используем getDocx из твоего сервиса
  openDoc(id: number, filename: string) {
    this.docService.getDocx(id).subscribe((blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  // Метод для подписи админом
  adminSign(id: number) {
    this.docService.adminSign(id).subscribe(() => this.loadDocuments(this.role));
  }

  // Метод для подписи супером
  superSign(id: number) {
    this.docService.superSign(id).subscribe(() => this.loadDocuments(this.role));
  }

  // Загрузка нового файла (reupload)
  onReupload(id: number, event: any) {
    const file = event.target.files[0];
    if (file) {
      this.docService.reupload(id, file).subscribe(() => this.loadDocuments(this.role));
    }
  }

  // Модалка возврата
  openReturn(doc: any) {
    this.returnDoc = doc;
    this.returnComment = '';
  }

  closeReturn() {
    this.returnDoc = null;
  }

  confirmReturn() {
    if (this.returnDoc && this.returnComment) {
      this.docService.returnForFix(this.returnDoc.id, this.returnComment).subscribe(() => {
        this.closeReturn();
        this.loadDocuments(this.role);
      });
    }
  }

  // Загрузка нового документа
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const category = prompt('Введите категорию документа:', 'Общее') || 'Общее';
      this.docService.upload(file, category).subscribe(() => this.loadDocuments(this.role));
    }
  }

  trackById(index: number, item: any) { return item.id; }

  logout() {
    this.auth.logout();
  }
}
