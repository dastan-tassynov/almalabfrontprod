import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DocumentService } from '../documents/document.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  docInfo: any = null;

  constructor(
    private route: ActivatedRoute,
    private docService: DocumentService,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.docService.getPublicVerifyInfo(id).subscribe({
        next: (data: any) => {
          this.docInfo = data; // Просто сохраняем всё как есть
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Ошибка загрузки:', err);
          this.docInfo = null;
          this.cdr.detectChanges();
        }
      });
    }
  }
}
