import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../documents/document.service'; // Проверь путь к сервису
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  docInfo: any = null;
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private docService: DocumentService
  ) {}

  ngOnInit() {
    // Берем ID из ссылки: /verify/6
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      // Вызываем бэкенд ( VerifyController )
      this.docService.getPublicVerifyInfo(id).subscribe({
        next: (data) => {
          this.docInfo = data;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.error = true;
          this.loading = false;
        }
      });
    }
  }
}
