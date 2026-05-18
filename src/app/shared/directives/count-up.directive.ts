import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
  standalone: true,
})
export class CountUpDirective implements OnInit, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() countUpDuration = 1800;
  @Input() countUpPrefix = '';
  @Input() countUpSuffix = '';

  private observer?: IntersectionObserver;
  private frame?: number;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          this.animate();
          this.observer?.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    this.observer.observe(this.el.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  private animate(): void {
    const el = this.el.nativeElement;
    const start = performance.now();
    const end = this.target;

    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / this.countUpDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * end);
      el.textContent = `${this.countUpPrefix}${current.toLocaleString('it-IT')}${this.countUpSuffix}`;
      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      }
    };

    this.frame = requestAnimationFrame(step);
  }
}
