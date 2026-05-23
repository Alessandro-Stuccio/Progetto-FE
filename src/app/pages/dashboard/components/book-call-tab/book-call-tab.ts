import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfessionalSummary } from '../../../../shared/models/dashboard.model';

@Component({
  selector: 'app-book-call-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-call-tab.html',
  styleUrls: ['./book-call-tab.css']
})
export class BookCallTabComponent {
  @Input() professionals: ProfessionalSummary[] = [];
  @Output() bookProfessional = new EventEmitter<any>();
}

