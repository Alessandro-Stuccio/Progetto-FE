import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.css',
})
export class SkeletonComponent {
  @Input() shape: 'rect' | 'circle' | 'text' = 'rect';
  @Input() lines = 1;
  @Input() width = '100%';
  @Input() height = '1rem';

  get lineArray(): number[] {
    return Array.from({ length: this.lines }, (_, i) => i);
  }
}
