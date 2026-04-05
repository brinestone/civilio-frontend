import { AsyncPipe, NgClass, NgComponentOutlet, NgTemplateOutlet } from "@angular/common";
import { Component, computed, inject, signal, Type, untracked } from "@angular/core";
import { DatasetItem, MultiSelectFieldConfig } from "@civilio/sdk/models";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideGrip, lucideLink, lucidePlus, lucideUnlink, lucideX } from "@ng-icons/lucide";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { BaseFieldConfig } from "../../base-meta-config/base-meta-config.component";
import { HlmTabsImports } from "@spartan-ng/helm/tabs";
import { FormField } from "@angular/forms/signals";
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray, } from "@angular/cdk/drag-drop";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmButton } from "@spartan-ng/helm/button";
import { rxResource } from "@angular/core/rxjs-interop";
import { SelectFieldItemConfigSchema } from "@app/model/form";
import { createImporterInjector } from "@app/pages/importers";
import { DatasetsService } from "@civilio/sdk/services/datasets/datasets.service";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { produce } from "immer";
import { of } from "rxjs";

@Component({
	selector: "cv-multi-select-meta",
	templateUrl: './multi-select-meta.html',
	viewProviders: [
		provideIcons({
			lucideLink,
			lucideUnlink,
			lucideGrip,
			lucidePlus,
			lucideX
		})
	],
	imports: [
		HlmFieldImports,
		HlmDialogImports,
		HlmSelectImports,
		HlmTabsImports,
		CdkDragHandle,
		CdkDrag,
		CdkDragPlaceholder,
		CdkDropList,
		HlmInput,
		HlmButton,
		NgComponentOutlet,
		FormField,
		HlmSpinner,
		NgIcon,
		NgTemplateOutlet,
		AsyncPipe,
		NgClass,
	],

})
export class MultiSelectMeta extends BaseFieldConfig<MultiSelectFieldConfig> {
	private readonly datasetService = inject(DatasetsService);
	protected readonly activeImportTab = signal<string>("dataset");
	protected readonly importDialogState = signal<BrnDialogState>("closed");
	protected readonly importSources = [
		{ value: "dataset", icon: "lucideDatabase", label: "Dataset" },
		{ value: "file", icon: "lucideFile", label: "File" },
	];
	protected readonly importerInjector = createImporterInjector(
		(result: string) => {
			this.meta()().value.update((v) =>
				produce(v, (draft) => {
					draft.itemSourceRef = result;
					// setTimeout(() => this.importDialogState.set('closed'));
				}),
			);
			this.importDialogState.set("closed");
		},
	);
	protected readonly importPageComponents = {
		dataset: import("@app/pages/importers/dataset/dataset-import.page").then(
			(m) => m.DatasetImportPage,
		),
		file: import("@app/pages/importers/file/file-importer.page").then(
			(m) => m.FileImportPage,
		),
	} as Record<string, Promise<Type<any>>>;
	protected readonly sourceLinked = computed(() => {
		return !!untracked(this.meta).itemSourceRef().value();
	});
	protected readonly linkedItems = rxResource({
		defaultValue: [],
		params: () => ({ ref: untracked(this.meta).itemSourceRef().value() }),
		stream: ({ params }) => {
			if (!params.ref) return of(Array<DatasetItem>());
			return this.datasetService.findDatasetRefItems(params.ref);
		},
	});

	protected onHardItemsReordered(event: CdkDragDrop<any>) {
		this.meta()
			.hardItems()
			.value.update((v) =>
				produce(v, (draft) => {
					moveItemInArray(draft, event.previousIndex, event.currentIndex);
				}),
			);
	}
	protected onAddHardItemButtonClicked() {
		const newItem = SelectFieldItemConfigSchema.shape.hardItems
			.unwrap()
			.unwrap()
			.parse({});
		this.meta()
			.hardItems()
			.value.update((v) =>
				produce(v, (draft) => {
					draft.unshift(newItem as any);
				}),
			);
	}
	protected onLinkItemSourceButtonClicked() {
		const linked = this.sourceLinked();
		if (linked) {
			const linkedItems = untracked(this.linkedItems.value);
			const defaultValue = untracked(this.meta).defaultValue().value();

			this.meta()().value.update((v) =>
				produce(v, (draft) => {
					draft.defaultValue = [];
					draft.itemSourceRef = null as any;
				}),
			);
		} else {
			this.importDialogState.set("open");
		}
	}
	protected onRemoveHardItemButtonClicked(index: number) {
		this.meta()
			.hardItems()
			.value.update((v) =>
				produce(v, (draft) => {
					draft.splice(index, 1);
				}),
			);
	}
	protected onClearDefaultValueButtonClicked() {
		this.meta()
			.defaultValue()
			.value.set(null as any);
	}
}
