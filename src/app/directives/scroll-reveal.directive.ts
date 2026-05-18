import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appScrollReveal]',
  standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
  @Input() srDelay = 0;
  @Input() srThreshold = 0.15;

  private observer?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    const native = this.el.nativeElement;
    native.classList.add('scroll-reveal');
    if (this.srDelay) {
      native.style.transitionDelay = `${this.srDelay}ms`;
    }

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          native.classList.add('is-visible');
          this.observer?.disconnect();
        }
      },
      { threshold: this.srThreshold }
    );
    this.observer.observe(native);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
