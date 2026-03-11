import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { ChangeDetectionStrategy, Component, computed, effect, inject, linkedSignal, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { applyWhenValue, disabled, form, FormField, hidden, submit, validate } from '@angular/forms/signals';
import { CompactNumberPipe } from '@app/pipes';
import { debounceSignal } from '@app/util';
import { DatasetsService } from '@civilio/sdk/services/datasets/datasets.service';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideChevronRight, lucideListCheck, lucideSearch } from '@ng-icons/lucide';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroup, HlmInputGroupAddon, HlmInputGroupInput } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmH4 } from "@spartan-ng/helm/typography";
import { lastValueFrom, of } from 'rxjs';
import { z } from 'zod';
import { Importer, injectImportContext } from '..';

const pagination = {
	page: 0,
	size: 99999
}
const debounceDuration = 200;

const FormModelSchema = z.object({
	dataset: z.uuid().array().default([]),
	selectedItems: z.uuid().array().default([]),
	selectAll: z.boolean().default(true),
	followDatasetUpdates: z.boolean().default(true),
});

@Component({
	selector: 'cv-dataset-import-page',
	viewProviders: [
		provideIcons({
			lucideSearch,
			lucideCheck,
			lucideChevronRight,
			lucideListCheck
		})
	],
	imports: [
		HlmEmptyImports,
		HlmSeparator,
		HlmH4,
		HlmInput,
		NgIcon,
		HlmInputGroup,
		HlmButton,
		HlmInputGroupInput,
		HlmCheckbox,
		HlmInputGroupAddon,
		FormsModule,
		HlmSpinner,
		HlmLabel,
		CompactNumberPipe,
		HlmSkeleton,
		CdkListbox,
		CdkOption,
		FormField
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './dataset-import.page.html',
	styleUrl: './dataset-import.page.scss',
})
export class DatasetImportPage implements Importer<string> {
	readonly finished = output<string>();
	private readonly ctx = injectImportContext<string>();
	private readonly datasetService = inject(DatasetsService);
	protected readonly datasetFilter = signal('');
	protected readonly datasetItemFilter = signal('')
	private readonly debouncedDatasetFilter = debounceSignal(this.datasetFilter, debounceDuration);
	private readonly debouncedDatasetItemFilter = debounceSignal(this.datasetItemFilter, debounceDuration)
	protected readonly datasetRefs = rxResource({
		defaultValue: { totalRecords: 0, data: [] },
		params: () => ({
			filter: this.debouncedDatasetFilter()
		}),
		stream: ({ params }) => {
			return this.datasetService.lookupDatasets({ filter: params.filter || undefined, ...pagination }, { transferCache: true });
		}
	});
	protected readonly formData = linkedSignal(() => {
		return FormModelSchema.parse({});
	});
	protected readonly selectedDataset = computed(() => {
		return this.formData().dataset[0];
	})
	protected readonly datasetItems = rxResource({
		defaultValue: { totalRecords: 0, data: [] },
		params: () => ({
			dataset: this.selectedDataset(),
			filter: this.debouncedDatasetItemFilter()
		}),
		stream: ({ params }) => {
			if (!params.dataset) return of({ totalRecords: 0, data: [] });
			return this.datasetService.lookupDatasetItems(params.dataset, {
				filter: params.filter,
				...pagination
			});
		}
	});

	protected readonly formModel = form(this.formData, schema => {
		validate(schema.dataset, ({ value }) => {
			if (value().length == 0) return { kind: 'required', message: 'A dataset must be selected' };
			return null;
		});
		disabled(schema.selectedItems, ({ valueOf }) => valueOf(schema.selectAll) === true);
		disabled(schema.selectAll, ({ valueOf }) => valueOf(schema.dataset).length == 0);
		applyWhenValue(schema, v => v.selectAll, paths => {
			validate(paths.selectedItems, ({ value }) => {
				if (value().length == 0) return { kind: 'required', message: 'At least one dataset item must be selected ' };
				return null;
			})
		});
		hidden(schema.followDatasetUpdates, ({ valueOf }) => !valueOf(schema.selectAll));
	});

	constructor() {
		effect(() => {
			this.selectedDataset();
			this.formModel.selectedItems().value.set([]);
			this.datasetItemFilter.set('');
		});
		effect(() => {
			const selectAll = this.formModel.selectAll().value();
			if (selectAll) {
				this.formModel.selectedItems().value.set([]);
			} else {
				this.formModel.followDatasetUpdates().value.set(false);
			}
		});
	}

	async onFinishButtonClicked() {
		await submit(this.formModel, async (t) => {
			const { dataset, followDatasetUpdates, selectAll, selectedItems } = t().value();
			const { ref } = await lastValueFrom(this.datasetService.createDatasetReference({
				dataset: dataset[0],
				followDatasetUpdates,
				selectAll,
				selectedItems
			}));
			t().reset({
				dataset: [],
				followDatasetUpdates: false,
				selectAll: false,
				selectedItems: []
			});
			this.finished.emit(ref);
			this.ctx?.onFinished(ref);
		})
	}
}
