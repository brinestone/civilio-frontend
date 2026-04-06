import { BooleanInput } from '@angular/cdk/coercion';
import {
	booleanAttribute,
	Component,
	computed,
	effect,
	inject,
	input,
	linkedSignal,
	output,
	signal
} from '@angular/core';
import { FormSchema } from '@app/model/form';
import { MaskPipe } from '@app/pipes';
import { facilityName } from '@app/store/selectors';
import { IndexRange } from '@civilio/sdk/models';
import { SubmissionsService } from '@civilio/sdk/services/submissions/submissions.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
	lucideChevronLeft,
	lucideChevronRight,
	lucideCopy,
	lucideRedo2,
	lucideSave,
	lucideTrash2,
	lucideUndo2,
	lucideUnlink2
} from '@ng-icons/lucide';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { select } from '@ngxs/store';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAutocompleteImports } from '@spartan-ng/helm/autocomplete';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmH4 } from '@spartan-ng/helm/typography';
import { toast } from 'ngx-sonner';
import { derivedFrom } from 'ngxtension/derived-from';
import { debounceTime, map, pipe } from 'rxjs';

@Component({
	selector: 'cv-form-header',
	viewProviders: [
		provideIcons({
			lucideChevronRight,
			lucideChevronLeft,
			lucideCopy,
			lucideUnlink2,
			lucideSave,
			lucideTrash2,
			lucideUndo2,
			lucideRedo2,
		})
	],
	imports: [
		HlmAutocompleteImports,
		HlmButton,
		NgIcon,
		TranslatePipe,
		MaskPipe,
		HlmH4,
	],
	templateUrl: './form-header.component.html',
	styleUrl: './form-header.component.scss'
})
export class FormHeaderComponent {
	readonly isNewSubmission = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
		alias: 'isNew'
	})
	readonly form = input<string>();
	readonly formSchema = input<FormSchema>();
	readonly index = input<number | string>(undefined, { alias: 'submissionIndex' });
	readonly canGoNextPage = input<boolean>();
	readonly canGoPrevPage = input<boolean>();
	readonly canUndo = input<boolean>();
	readonly canRedo = input<boolean>();
	readonly version = input<string | null>();
	readonly nextSubmission = output();
	readonly prevSubmission = output();
	readonly indexJump = output<number>();
	readonly undo = output();
	readonly redo = output();

	private readonly submissionService = inject(SubmissionsService);
	private readonly ts = inject(TranslateService);
	private readonly rangeGenerator = new IndexGenerator();

	protected readonly facilityName = select(facilityName);
	protected readonly mapperSheetState = signal<BrnDialogState>('closed');
	protected readonly submissionIndex = linkedSignal(() => {
		const index = this.index();
		return index === null ? null : Number(index);
	})
	protected readonly indexInputFilter = linkedSignal(() => String(this.index() ?? ''))
	protected readonly debouncedIndexFilter = derivedFrom([this.indexInputFilter], pipe(
		map(([v]) => v),
		debounceTime(500)
	), { initialValue: '' });
	protected readonly refSuggestions = computed(() => {
		const filter = this.debouncedIndexFilter();
		return this.rangeGenerator.search(filter, 5);
	})
	constructor() {
		effect(() => {
			const form = this.form();
			if (!form) this.rangeGenerator.ranges = [];
			else
				this.submissionService.findSparseIndexRanges(form, { limit: 99999 }).subscribe({
					next: ranges => {
						this.rangeGenerator.ranges = ranges;
					}
				})
		})
	}

	protected onAutoCompleteIndexValueChanged(index: number | null) {
		if (index === null) return;
		this.indexJump.emit(index);
	}

	protected async onCopyVersionButtonClicked() {
		await navigator.clipboard.writeText(this.version() as string);
		toast.info(this.ts.instant('msg.clipboard_copied_text', { value: 'Version' }));
	}
}

class IndexGenerator {
	#ranges: IndexRange[] = [];
	private currentRangeIndex = 0;
	private currentIndexInRange = 0;
	private totalGenerated = 0;

	set ranges(ranges: IndexRange[]) {
		this.#ranges = ranges;
		this.reset();
	}

	next(): null | number {
		if (this.currentRangeIndex >= this.#ranges.length) {
			return null;
		}

		const currentRange = this.#ranges[this.currentRangeIndex];
		const nextIndex = currentRange.start + this.currentIndexInRange;

		if (nextIndex <= currentRange.end) {
			this.currentIndexInRange++;
			this.totalGenerated++;
			return nextIndex;
		}

		this.currentRangeIndex++;
		this.currentIndexInRange = 0;

		return this.next()
	}

	peek(count: number): number[] {
		const indices = Array<number>();
		let rangeIdx = this.currentRangeIndex;
		let offset = this.currentIndexInRange;

		while (indices.length < count && rangeIdx < this.ranges.length) {
			const range = this.#ranges[rangeIdx];
			const availableInRange = range.end - range.start + 1 - offset;
			const toTake = Math.min(count - indices.length, availableInRange);

			for (let i = 0; i < toTake; i++) {
				indices.push(range.start + offset + i);
			}

			offset += toTake;
			if (offset >= range.end - range.start + 1) {
				rangeIdx++;
				offset = 0;
			}
		}
		return indices;
	}

	search(pattern: string, limit: number = 10): number[] {
		const results = Array<number>();

		if (/^\d+$/.test(pattern)) {
			const num = parseInt(pattern, 10);
			for (const range of this.#ranges) {
				if (num >= range.start && num <= range.end) {
					results.push(num);
					break;
				}
			}
		} else if (/^\d+-\d*$/.test(pattern)) {
			const [start] = pattern.split('-').map(n => parseInt(n, 10));
			for (const range of this.#ranges) {
				if (range.end >= start) {
					const rangeStart = Math.max(range.start, start);
					for (let i = 0; i < limit - results.length; i++) {
						if (rangeStart + i <= range.end)
							results.push(rangeStart + i);
					}
				}
				if (results.length >= limit) break;
			}
		} else if (/^\d+-\d+$/.test(pattern)) {
			const [start, end] = pattern.split('-').map(n => parseInt(n, 10));
			for (const range of this.#ranges) {
				const overlapStart = Math.max(range.start, start);
				const overlapEnd = Math.min(range.end, end);
				if (overlapStart <= overlapEnd) {
					for (let i = overlapStart; i <= overlapEnd && results.length < limit; i++) {
						results.push(i);
					}
				}
			}
		}
		return results;
	}

	reset() {
		this.currentRangeIndex = 0;
		this.currentIndexInRange = 0;
		this.totalGenerated = 0;
	}

	getProgress() {
		return {
			currentRange: this.currentRangeIndex + 1,
			totalRanges: this.ranges.length,
			generated: this.totalGenerated
		};
	}
}
