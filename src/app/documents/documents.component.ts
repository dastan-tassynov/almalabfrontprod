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
  targetOrgName: string = '';
  selectedCategory: string = ''; // Сюда попадет значение из фильтра
  selectedFileName: string = '';
  selectedFile: File | null = null;
  organization: string = '';
  showUploadModal: boolean = false; // Управляет видимостью окна

  currentFilter: string = 'Все';
  docCategories: string[] = [
    'Вода хим бутилированная', 'Вода хим водопроводная', 'Протокол бассейн бак',
    'Смывы пищевые', 'Смывы паразитология', 'Вода паразитология',
    'Почва паразитология', 'Бассейн паразитология', 'Воздух бак',
    'Смывы ЛПУ', 'Стерильность', 'ЭМП и ЭСП',
    'Микроклимат', 'Освещенность',
    'Вода бак', 'Пища', 'Контроль автоклава', 'Почва бак', 'Калорийность', 'Дез.средство',
    'Шум','Воздух рабочей зоны'
  ];

  // В начале класса


// Метод загрузки
  processUpload() {
    if (!this.selectedFile) return;

    // Если это USER, берем его организацию, если ADMIN - берем из ввода
    const orgToSave = this.role === 'ADMIN' ? this.targetOrgName : this.organization;

    this.docService.upload(this.selectedFile, orgToSave, this.selectedCategory).subscribe({
      next: () => {
        alert('Успешно загружено в категорию: ' + this.selectedCategory);
        this.resetForm();
        this.loadDocuments(this.role); // Обновляем список на странице
      },
      error: (err) => alert('Ошибка при загрузке')
    });
  }

  resetForm() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.targetOrgName = '';
    this.selectedCategory = '';
  }

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
    if (!file) return;

    // Сохраняем файл во временную переменную, чтобы использовать его после выбора параметров
    this.selectedFile = file;

    // Вместо prompt открываем наше красивое окно (логику окна см. ниже в HTML)
    this.showUploadModal = true;
  }

// Метод, который вызовется, когда админ нажмет "Опубликовать" в модальном окне
  confirmAndUpload() {
    if (!this.selectedFile || !this.selectedCategory || (this.role === 'ADMIN' && !this.targetOrgName)) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    this.docService.upload(this.selectedFile, this.selectedCategory, this.targetOrgName).subscribe({
      next: () => {
        alert('Файл успешно загружен!');
        this.showUploadModal = false; // Закрываем окно
        this.resetUploadForm();
        this.loadDocuments(this.role);
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        alert('Произошла ошибка при загрузке файла');
      }
    });
  }

  resetUploadForm() {
    this.selectedFile = null;
    this.selectedCategory = '';
    this.targetOrgName = '';
  }

  trackById(index: number, item: any) { return item.id; }

  logout() {
    this.auth.logout();
  }
}
