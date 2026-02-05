import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from './document.service';

@Component({
  standalone: true,
  selector: 'app-upload',
  imports: [CommonModule],
  templateUrl: './upload.component.html'
})
export class UploadComponent {

  file!: File;

  constructor(private docs: DocumentService) {}

  onFile(e: any) {
    this.file = e.target.files[0];
  }

  // upload() {
  //   if (!this.file) return;
  //   this.docs.upload(this.file).subscribe(() => location.reload());
  // }
}
