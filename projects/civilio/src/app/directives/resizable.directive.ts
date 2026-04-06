import { BooleanInput, NumberInput } from "@angular/cdk/coercion";
import { booleanAttribute, computed, DestroyRef, Directive, effect, ElementRef, inject, input, numberAttribute, output, Renderer2, signal } from "@angular/core";
import { pick } from "lodash";

export type Dimensions = { width: number, height: number };

@Directive({
	selector: '[cvResizable]',
	host: {
		'[style.width]': 'widthStyle()',
		'[style.height]': 'heightStyle()'
	}
})
export class Resizable {
	readonly resize = output<Dimensions>();
	readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
	readonly width = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });
	readonly height = input<number | undefined, NumberInput>(undefined, { transform: numberAttribute });

	protected readonly resizing = signal(false);
	protected resizeTimer?: number;
	protected ignoreObserver = false;

	protected readonly widthStyle = computed(() => this.width() ? `${this.width()}px` : 'auto');
	protected readonly heightStyle = computed(() => this.height() ? `${this.height()}px` : 'auto');

	constructor(viewRef: ElementRef<HTMLElement>, destroyRef: DestroyRef) {
		const observer = new ResizeObserver(([entry]) => {
			// Skip if we're the ones causing the resize
			if (this.ignoreObserver) {
				return;
			}

			const dimensions = pick(entry.contentRect, 'width', 'height');
			if (this.resizeTimer) {
				clearTimeout(this.resizeTimer);
			}
			this.resizing.set(true);
			this.resizeTimer = setTimeout(() => this.resizing.set(false), 150);
			this.resize.emit(dimensions);
		});

		effect(() => {
			const element = viewRef.nativeElement;
			if (this.disabled() || this.readonly()) {
				observer.unobserve(element);
			} else {
				observer.observe(element);
			}
		});

		destroyRef.onDestroy(() => observer.disconnect());
	}
}
