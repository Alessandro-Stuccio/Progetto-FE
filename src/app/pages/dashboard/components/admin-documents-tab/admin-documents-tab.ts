import { Component, Input, inject, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../../../core/services/document.service';
import { RoleService } from '../../../../core/services/role.service';
import { AuthUser, UserProfile } from '../../../../shared/models/dashboard.model';
import { PdfViewerComponent } from '../../../../shared/components/ui/pdf-viewer/pdf-viewer';
import { formatLongDate } from '../../../../shared/utils/date.util';
import { getInitials } from '../../../../shared/utils/user.util';
import { validatePdfFile } from '../../../../shared/utils/file.util';

@Component({
  selector: 'app-admin-documents-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, PdfViewerComponent],
  templateUrl: './admin-documents-tab.html',
  styleUrls: ['./admin-documents-tab.css']
})
export class AdminDocumentsTabComponent {
  private docService = inject(DocumentService);
  private cdr = inject(ChangeDetectorRef);
  private roleService = inject(RoleService);

  @Input() allUsers: UserProfile[] = [];
  @Input() currentUser: AuthUser | null = null;

  @ViewChild('pdfViewer') pdfViewer!: PdfViewerComponent;

  profSearch: string = '';
  selectedProfessional: UserProfile | null = null;

  expandedClients = new Set<number>();
  clientDocs = new Map<number, any[]>();
  loadingClients = new Set<number>();

  editingNotesDocId: number | null = null;
  editingNotes: string = '';
  savingNotes: boolean = false;

  // Usato dal template per il layout responsive (lista vs dettaglio), non più dal PDF viewer.
  get isMobile(): boolean { return window.innerWidth < 640; }

  get professionals(): UserProfile[] {
    const roles = ['PERSONAL_TRAINER', 'NUTRITIONIST', 'INSURANCE_MANAGER'];
    const q = this.profSearch.trim().toLowerCase();
    return this.allUsers
      .filter(u => roles.includes(u.role as string))
      .filter(u => !q || (u.firstName + ' ' + u.lastName).toLowerCase().includes(q) || u.email?.toLowerCase().includes(q));
  }

  get linkedClients(): UserProfile[] {
    if (!this.selectedProfessional) return [];
    const p = this.selectedProfessional;
    const profName = `${p.firstName} ${p.lastName}`;
    const clients = this.allUsers.filter(u => (u.role as string) === 'CLIENT');
    if ((p.role as string) === 'PERSONAL_TRAINER') {
      return clients.filter(u => u.assignedPtName === profName);
    }
    if ((p.role as string) === 'NUTRITIONIST') {
      return clients.filter(u => u.assignedNutritionistName === profName);
    }
    return clients;
  }

  selectProfessional(p: UserProfile): void {
    this.selectedProfessional = p;
    this.expandedClients.clear();
    this.clientDocs.clear();
    this.loadingClients.clear();
    this.editingNotesDocId = null;
    this.pdfViewer?.close();
  }

  backToProfessionals(): void {
    this.selectedProfessional = null;
    this.expandedClients.clear();
    this.clientDocs.clear();
    this.loadingClients.clear();
  }

  toggleClient(clientId: number): void {
    if (this.expandedClients.has(clientId)) {
      this.expandedClients.delete(clientId);
    } else {
      this.expandedClients.add(clientId);
      if (!this.clientDocs.has(clientId)) {
        this.loadClientDocs(clientId);
      }
    }
    this.cdr.detectChanges();
  }

  private loadClientDocs(clientId: number): void {
    if (!this.selectedProfessional) return;
    this.loadingClients.add(clientId);
    const profName = `${this.selectedProfessional.firstName} ${this.selectedProfessional.lastName}`;
    this.docService.getClientDocuments(clientId).subscribe({
      next: (docs) => {
        const filtered = (docs || []).filter((d: any) => d.uploadedByName === profName);
        this.clientDocs.set(clientId, filtered);
        this.loadingClients.delete(clientId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.clientDocs.set(clientId, []);
        this.loadingClients.delete(clientId);
        this.cdr.detectChanges();
      }
    });
  }

  getDocsForClient(clientId: number): any[] {
    return this.clientDocs.get(clientId) ?? [];
  }

  isClientLoading(clientId: number): boolean {
    return this.loadingClients.has(clientId);
  }

  isClientExpanded(clientId: number): boolean {
    return this.expandedClients.has(clientId);
  }

  getUploadType(): string {
    const role = this.selectedProfessional?.role as string;
    if (role === 'PERSONAL_TRAINER') return 'WORKOUT_PLAN';
    if (role === 'NUTRITIONIST') return 'DIET_PLAN';
    return 'INSURANCE_POLICE';
  }

  onFileSelectedForClient(event: Event, clientId: number): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.selectedProfessional) return;
    const check = validatePdfFile(file);
    if (!check.valid) { alert(check.error); return; }
    this.docService.uploadDocument(file, clientId, this.getUploadType()).subscribe({
      next: () => {
        this.clientDocs.delete(clientId);
        this.loadClientDocs(clientId);
      },
      error: () => {}
    });
  }

  viewDoc(doc: any): void {
    this.pdfViewer.view(doc.fileName, this.docService.downloadDocument(doc.id));
  }

  deleteDoc(doc: any, clientId: number): void {
    if (!confirm(`Eliminare "${doc.fileName}"?`)) return;
    this.docService.deleteDocument(doc.id).subscribe({
      next: () => {
        const current = this.clientDocs.get(clientId) ?? [];
        this.clientDocs.set(clientId, current.filter(d => d.id !== doc.id));
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  startEditNotes(doc: any): void { this.editingNotesDocId = doc.id; this.editingNotes = doc.notes || ''; }
  cancelEditNotes(): void { this.editingNotesDocId = null; this.editingNotes = ''; }

  saveNotes(doc: any, clientId: number): void {
    if (this.savingNotes) return;
    this.savingNotes = true;
    this.docService.updateDocumentNotes(doc.id, this.editingNotes).subscribe({
      next: () => {
        doc.notes = this.editingNotes;
        this.editingNotesDocId = null; this.editingNotes = ''; this.savingNotes = false;
        this.cdr.detectChanges();
      },
      error: () => { this.savingNotes = false; }
    });
  }

  getRoleLabel(role: string): string {
    return this.roleService.getRoleLabel(role);
  }

  getRoleIcon(role: string): string {
    switch (role) {
      case 'PERSONAL_TRAINER': return '💪';
      case 'NUTRITIONIST': return '🥗';
      case 'INSURANCE_MANAGER': return '🛡️';
      default: return '👤';
    }
  }

  getDocTypeIcon(type: string): string {
    switch (type) {
      case 'WORKOUT_PLAN': return '💪';
      case 'DIET_PLAN': return '🥗';
      case 'INSURANCE_POLICE': return '📋';
      default: return '📄';
    }
  }

  getDocTypeLabel(type: string): string {
    switch (type) {
      case 'WORKOUT_PLAN': return 'Scheda';
      case 'DIET_PLAN': return 'Dieta';
      case 'INSURANCE_POLICE': return 'Polizza';
      default: return type;
    }
  }

  getInitials(u: UserProfile): string {
    return getInitials(u);
  }

  formatDate(d: string): string {
    return formatLongDate(d);
  }
}
