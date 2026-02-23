import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { AsyncPipe, NgClass, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, resource, signal, Type, untracked } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import { SelectFieldItemMetaSchema } from '@app/model/form';
import { createImporterInjector } from '@app/pages/importers';
import { DatasetService } from '@app/services/dataset';
import { SelectFieldMeta } from '@civilio/sdk/models';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideDatabase, lucideFile, lucideGrip, lucideLink, lucidePlus, lucideUnlink, lucideX } from '@ng-icons/lucide';
import { BrnDialogContent, BrnDialogState } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmButtonGroup } from '@spartan-ng/helm/button-group';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldGroup, HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTabsImports } from '@spartan-ng/helm/tabs';
import { produce } from 'immer';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';

@Component({
	selector: 'cv-select-meta',
	viewProviders: [
		provideIcons({
			lucidePlus,
			lucideLink,
			lucideUnlink,
			lucideGrip,
			lucideX,
			lucideFile,
			lucideDatabase,
		})
	],
	imports: [
		HlmFieldImports,
		HlmDialogImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmTabsImports,
		HlmButtonGroup,
		BrnDialogContent,
		CdkDropList,
		CdkDrag,
		CdkDragHandle,
		CdkDragPlaceholder,
		HlmButton,
		HlmInput,
		HlmSpinner,
		NgTemplateOutlet,
		NgComponentOutlet,
		AsyncPipe,
		HlmIcon,
		FormField,
		NgClass,
		NgIcon
	],
	hostDirectives: [
		HlmFieldGroup
	],
	templateUrl: './select-meta.component.html',
	styleUrl: './select-meta.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectMetaComponent extends BaseMetaConfigComponent<SelectFieldMeta> {
	private readonly datasetService = inject(DatasetService);
	protected readonly activeImportTab = signal<string>('dataset');
	protected readonly importDialogState = signal<BrnDialogState>('closed');
	protected readonly importSources = [
		{ value: 'dataset', icon: 'lucideDatabase', label: 'Dataset' },
		{ value: 'file', icon: 'lucideFile', label: 'File' }
	];
	protected readonly importerInjector = createImporterInjector((result: string) => {
		this.meta()().value.update(v => produce(v, draft => {
			draft.itemSourceRef = result;
			setTimeout(() => this.importDialogState.set('closed'));
		}));
	});
	protected readonly importPageComponents = {
		dataset: import('@app/pages/importers/dataset/dataset-import.page').then(m => m.DatasetImportPage),
		file: import('@app/pages/importers/file/file-importer.page').then(m => m.FileImportPage)
	} as Record<string, Promise<Type<any>>>;
	protected readonly sourceLinked = computed(() => {
		return !!untracked(this.meta).itemSourceRef().value();
	});
	protected readonly linkedItems = resource({
		defaultValue: [],
		params: () => ({ ref: untracked(this.meta).itemSourceRef().value() }),
		loader: async ({ params }) => {
			if (!params.ref) return [];
			return await this.datasetService.getDatasetRefItems(params.ref) ?? [];
		}
	})


	protected onHardItemsReordered(event: CdkDragDrop<any>) {
		this.meta().hardItems().value.update(v => produce(v, draft => {
			moveItemInArray(draft, event.previousIndex, event.currentIndex);
		}))
	}
	protected onAddHardItemButtonClicked() {
		const newItem = SelectFieldItemMetaSchema.shape.hardItems.unwrap().unwrap().parse({});
		this.meta().hardItems().value.update(v => produce(v, draft => {
			draft.unshift(newItem as any);
		}))
	}
	protected onLinkItemSourceButtonClicked() {
		const linked = this.sourceLinked();
		if (linked) {
			const linkedItems = untracked(this.linkedItems.value);
			const defaultValue = untracked(this.meta).defaultValue().value();

			this.meta()().value.update(v => produce(v, draft => {
				if (linkedItems.some(i => i.value === defaultValue)) {
					draft.defaultValue = null as any;
				}
				draft.itemSourceRef = null as any;
			}))
		} else {
			this.importDialogState.set('open');
		}
	}
	protected onRemoveHardItemButtonClicked(index: number) {
		this.meta().hardItems().value.update(v => produce(v, draft => {
			draft.splice(index, 1);
		}))
	}
	protected onClearDefaultValueButtonClicked() {
		this.meta().defaultValue().value.set(null as any);
	}
}
