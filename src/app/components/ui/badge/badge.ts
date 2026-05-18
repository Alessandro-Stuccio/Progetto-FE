import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';
export type BadgeSize = 'sm' | 'md';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
  @Input() size: BadgeSize = 'md';
  @Input() dot = false;
}
