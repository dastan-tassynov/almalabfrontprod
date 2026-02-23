import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentService } from '../documents/document.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './guest-view.component.html',
  styleUrls: ['./guest-view.component.css'] // Не забудь добавить стили
})
export class GuestViewComponent implements OnInit {
  docs: any[] = [];
  orgName: string = '';

  constructor(
    private route: ActivatedRoute,
    private docService: DocumentService,
    public router: Router
  ) {}

  ngOnInit() {
    // Получаем название организации из URL
    this.orgName = this.route.snapshot.paramMap.get('orgName') || '';
    if (this.orgName) {
      this.loadDocs();
    }
  }

  loadDocs() {
    this.docService.getDocsByOrg(this.orgName).subscribe({
      next: (data) => {
        this.docs = data;
      },
      error: (err) => console.error('Ошибка загрузки документов организации', err)
    });
  }

  // Переход на страницу верификации (ту, что мы делали раньше)
  viewDetails(id: number) {
    this.router.navigate(['/verify', id]);
  }
}
