import { Component, Input, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../../core/services/document.service';
import { AuthUser, Subscription, UserProfile } from '../../../../shared/models/dashboard.model';
import { PdfViewerComponent } from '../../../../shared/components/ui/pdf-viewer/pdf-viewer';
import { formatLongDate } from '../../../../shared/utils/date.util';
import { getInitials } from '../../../../shared/utils/user.util';
import { validatePdfFile } from '../../../../shared/utils/file.util';

@Component({
  selector: 'app-insurance-home-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerComponent],
  templateUrl: './insurance-home-tab.html'
})
export class InsuranceHomeTabComponent {
  private authService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);

  @Input() currentUser: AuthUser | null = null;
  @Input() allSubscriptions: Subscription[] = [];
  @Input() allUsers: UserProfile[] = [];

  @ViewChild('pdfViewer') pdfViewer!: PdfViewerComponent;

  searchQuery: string = '';
  selectedClient: any = null;
  clientDocs: any[] = [];
  docsLoading: boolean = false;
  isUploading: boolean = false;
  isDragOver: boolean = false;

  editingNotesDocId: number | null = null;
  editingNotes: string = '';
  savingNotes: boolean = false;

  get activePolicies(): number { return this.allSubscriptions.filter(s => s.active).length; }
  get expiredPolicies(): number { return this.allSubscriptions.filter(s => !s.active).length; }
  get coveredClients(): any[] {
    return this.allSubscriptions.map(s => ({
      ...s,
      user: this.allUsers.find(u => u.id === s.userId)
    })).filter(s => s.user);
  }
  get filteredClients(): any[] {
    if (!this.searchQuery.trim()) return this.coveredClients;
    const q = this.searchQuery.toLowerCase();
    return this.coveredClients.filter(c =>
      (c.user.firstName + ' ' + c.user.lastName).toLowerCase().includes(q) ||
      c.user.email?.toLowerCase().includes(q)
    );
  }

  getInitials(): string {
    return getInitials(this.currentUser);
  }

  openClientDocs(sub: any): void {
    this.selectedClient = sub;
    this.docsLoading = true;
    this.editingNotesDocId = null;
    this.authService.getClientPolicies(sub.userId).subscribe({
      next: (docs) => { this.clientDocs = docs; this.docsLoading = false; this.cdr.detectChanges(); },
      error: () => { this.clientDocs = []; this.docsLoading = false; this.cdr.detectChanges(); }
    });
  }

  closeClientDocs(): void { this.selectedClient = null; this.clientDocs = []; }

  viewPdf(doc: any): void {
    this.pdfViewer.view(doc.fileName, this.authService.downloadPolicy(doc.id));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const check = validatePdfFile(files[0]);
      if (check.valid) {
        this.uploadFile(files[0]);
      } else {
        alert(check.error);
      }
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const check = validatePdfFile(file);
      if (check.valid) {
        this.uploadFile(file);
      } else {
        alert(check.error);
      }
    }
    input.value = ''; // Reset input per permmettere il ricaricamento dello stesso file se necessario
  }

  private uploadFile(file: File): void {
    if (!this.selectedClient || !this.currentUser) return;
    this.isUploading = true;
    this.authService.uploadInsurancePolicy(file, this.selectedClient.userId).subscribe({
      next: () => {
        this.isUploading = false;
        this.openClientDocs(this.selectedClient);
      },
      error: () => { this.isUploading = false; }
    });
  }

  deleteDoc(doc: any): void {
    if (!confirm('Eliminare questo documento?')) return;
    this.authService.deletePolicy(doc.id).subscribe({
      next: () => { this.clientDocs = this.clientDocs.filter(d => d.id !== doc.id); this.cdr.detectChanges(); },
      error: () => { }
    });
  }

  startEditNotes(doc: any): void {
    this.editingNotesDocId = doc.id;
    this.editingNotes = doc.notes || '';
  }

  cancelEditNotes(): void {
    this.editingNotesDocId = null;
    this.editingNotes = '';
  }

  saveNotes(doc: any): void {
    if (this.savingNotes) return;
    this.savingNotes = true;
    this.authService.updatePolicyNotes(doc.id, this.editingNotes).subscribe({
      next: (res) => {
        doc.notes = this.editingNotes;
        this.editingNotesDocId = null;
        this.editingNotes = '';
        this.savingNotes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.savingNotes = false; }
    });
  }

  formatDate(d: string): string { return formatLongDate(d); }
}
