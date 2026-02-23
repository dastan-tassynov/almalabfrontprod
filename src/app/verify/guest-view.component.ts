import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../documents/document.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-view.component.html',
  styleUrls: ['./guest-view.component.css']
})
export class GuestViewComponent implements OnInit {
  docs: any[] = [];
  orgName: string = '';

  constructor(
    private route: ActivatedRoute,
    private docService: DocumentService,
    public router: Router,
    private cdr: ChangeDetectorRef // Добавлено для обновления экрана
  ) {}

  ngOnInit() {
    // Декодируем название организации, чтобы убрать %20 и прочее
    const rawOrg = this.route.snapshot.paramMap.get('orgName') || '';
    this.orgName = decodeURIComponent(rawOrg);

    if (this.orgName) {
      this.loadDocs();
    }
  }

  loadDocs() {
    this.docService.getDocsByOrg(this.orgName).subscribe({
      next: (data) => {
        console.log('Полученные данные:', data);
        this.docs = data;
        // Принудительно уведомляем Angular, что данные изменились
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки документов организации', err);
      }
    });
  }

  viewDetails(id: number) {
    this.router.navigate(['/verify', id]);
  }

  downloadDoc(id: number, filename: string) {
    this.docService.downloadGuestFile(id, filename);
  }
}
