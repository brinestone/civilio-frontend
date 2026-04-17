import { NgTemplateOutlet } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	input,
	isDevMode,
	linkedSignal,
	signal,
	viewChild,
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { FieldTree, form, submit } from "@angular/forms/signals";
import { Router, RouterOutlet } from "@angular/router";
import { FormDesigner, FormDesignerHeader } from "@app/components/form/schema";
import {
	defaultFormDefinitionSchemaValue,
	defineFormDesignerFormSchema,
	domainToStrictFormDefinition,
	FormItem,
	FormItemType,
	isExistingFormItem,
	isGroup,
	walkFormItemTree,
} from "@app/components/form/schema/form-designer-config";
import { HasPendingChanges } from "@app/model/form";
import { stripSymbols } from "@app/util";
import { FormItemDefinition } from "@civilio/sdk/models";
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { Strict } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideChevronLeft,
	lucideChevronRight,
	lucideLibrary,
} from "@ng-icons/lucide";
import { TranslatePipe } from "@ngx-translate/core";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSkeleton } from "@spartan-ng/helm/skeleton";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { flatten } from "flat";
import { difference, get, isEqual, omit } from "lodash";
import { toast } from "ngx-sonner";
import { injectQueryParams } from "ngxtension/inject-query-params";
import { lastValueFrom, Observable, of } from "rxjs";

@Component({
	selector: "cv-forms",
	viewProviders: [
		provideIcons({
			lucideLibrary,
			lucideChevronLeft,
			lucideChevronRight,
		}),
	],
	imports: [
		HlmAlertDialogImports,
		HlmSpinner,
		HlmButton,
		HlmSkeleton,
		TranslatePipe,
		HlmInput,
		FormDesignerHeader,
		FormDesigner,
		RouterOutlet,
		NgTemplateOutlet,
		NgIcon,
	],
	templateUrl: "./schema-design.page.html",
	styleUrl: "./schema-design.page.scss",
	host: {
		"[class.scrollbar-thin]": "true",
		"[class.scrollbar-thumb-primary/50]": "true",
		"[class.scrollbar-track-transparent]": "true",
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaDesignPage implements HasPendingChanges {
	readonly slug = input.required<string>();
	private readonly formVersion = injectQueryParams("version", {
		defaultValue: "current",
	});
	private readonly formService = inject(FormsService);
	private readonly designer = viewChild(FormDesigner);
	protected readonly sidebarState = signal<BrnDialogState>(isDevMode() ? 'closed' : 'closed');
	protected readonly formDefinition = rxResource({
		params: () => ({
			slug: this.slug(),
			version: this.formVersion() ?? "current",
		}),
		stream: ({ params }) => {
			return !params.slug
				? of(undefined)
				: this.formService.findFormDefinitionByVersion(params.slug, {
					version: params.version,
				});
		},
	});
	protected readonly formData = linkedSignal(() => {
		const v = this.formDefinition.value();
		if (v) return domainToStrictFormDefinition(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly renderForm = linkedSignal(() => !!this.slug());
	protected readonly pendingChangesDialogState =
		signal<BrnDialogState>("closed");
	protected pendingChangesActionCallback?: (
		action: "save" | "stay" | "discard",
	) => void;
	protected readonly formModel = form(
		this.formData,
		defineFormDesignerFormSchema(),
	);

	private findNewItems() {
		const newItems = Array<string>();
		for (const i of (this.formData()?.items as Strict<FormItem>[]) ??
			Array<Strict<FormItem>>()) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) {
					newItems.push(item.path);
				}
			});
		}
		return newItems;
	}

	private findUpdatedItems() {
		const updatedItems = Array<string>();
		for (const i of this.formData().items) {
			walkFormItemTree(i, (item) => {
				if (isExistingFormItem(item)) {
					const pristineItem = get(
						this.formData()?.items ?? [],
						item.path,
					) as Strict<FormItemDefinition>;
					if (!pristineItem) return;
					const itemClone = stripSymbols(item);
					const pristineClone = stripSymbols(pristineItem);
					const flatClone = flatten(itemClone);
					let flatPristine = flatten(pristineClone);
					if (isGroup(pristineItem)) {
						const stripped = omit(pristineItem, ["config.fields"]);
						flatPristine = flatten(stripped);
					}

					const equals = isEqual(flatPristine, flatClone);
					if (!equals) {
						updatedItems.push(item.path);
					}
				}
			});
		}
		return updatedItems;
	}

	private findDeletedItems() {
		const existingItems = new Set<string>();
		const originalItems = new Set<string>();
		for (const i of (this.formData()?.items ??
			[]) as unknown as Strict<FormItem>[]) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) return;
				existingItems.add(item.id);
			});
		}
		for (const i of (this.formData()?.items as Strict<FormItemDefinition>[]) ??
			[]) {
			walkFormItemTree(i, (item) => {
				if (!isExistingFormItem(item)) return;
				originalItems.add(item.id);
			});
		}

		const deletedItems = difference([...originalItems], [...existingItems]);
		return deletedItems;
	}

	protected async onFormSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		if (!this.formModel().valid()) {
			toast.warning("Invalid form state", {
				description:
					"The current state of the form designer is invalid. Pleace update the form's state and try again",
			});
			return;
		}
		// this.computeItemPaths();
		await submit(this.formModel, async (tree) => {
			const addedItems = this.findNewItems().map((p) =>
				(get(tree.items, p) as FieldTree<any>)?.().value(),
			) as any;
			const removedItems = this.findDeletedItems();
			const updatedItems = this.findUpdatedItems().map((p) =>
				(get(tree.items, p) as FieldTree<any>)?.().value(),
			) as any;
			try {
				await lastValueFrom(
					this.formService.updateFormVersionDefinition(
						this.slug(),
						this.formVersion() ?? "current",
						{
							addedItems,
							updatedItems,
							removedItems,
						},
					),
				);
				this.formDefinition.reload();
				tree().reset(this.formData());
			} catch (e) {
				console.error(e);
				toast.error("Could not save changes", {
					description: (e as Error).message,
				});
			}
		});
	}

	protected onFormDiscard(event?: Event) {
		event?.preventDefault();
		const value = this.formDefinition.value();
		if (value) {
			this.formModel().reset(domainToStrictFormDefinition(value));
		}
	}

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		if (!this.formModel().dirty()) return false;
		this.pendingChangesDialogState.set("open");
		return new Observable<boolean>((subscriber) => {
			subscriber.add(() => {
				this.pendingChangesActionCallback = undefined;
				this.pendingChangesDialogState.set("closed");
			});
			this.pendingChangesActionCallback = async (action) => {
				switch (action) {
					case "discard":
						subscriber.next(false);
						break;
					case "stay":
						subscriber.next(true);
						break;
					case "save":
						await this.onFormSubmit();
						subscriber.next(this.formModel().dirty());
						break;
				}
				subscriber.complete();
			};
		});
	}

	protected onItemAdd(type: FormItemType) {
		this.designer()?.handleNewItemAdded(type);
	}

	protected toggleSidebarState() {
		this.sidebarState.update(v => v == 'open' ? 'closed' : 'open');
	}

	constructor(router: Router) {
		effect(() => {
			const formData = this.formData();
			console.log("form-data", formData);
		});
		effect(() => {
			const error = this.formDefinition.error();
			const loadingFinished = !this.formDefinition.isLoading();
			if (
				loadingFinished &&
				error instanceof HttpErrorResponse &&
				error.status == 404
			) {
				router.navigate(["/schemas"]).then(() => {
					toast.warning("Not found", {
						description: "Could not find the specified form version",
					});
				});
			}
		});
	}
}
