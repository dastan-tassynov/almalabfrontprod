import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { DocumentService } from './document.service';

@Component({
  standalone: true,
  selector: 'app-pdf-viewer',
  imports: [CommonModule, NgxExtendedPdfViewerModule],
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.css']
})
export class PdfViewerComponent {

  pdfSrc?: Blob;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private docs: DocumentService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.docs.getPdf(id).subscribe(blob => {
      this.pdfSrc = blob;   // ✅ ВАЖНО
      this.loading = false;
    });
  }
}
