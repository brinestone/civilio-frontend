import { NgTemplateOutlet } from "@angular/common";
import {
	ChangeDetectionStrategy,
	Component,
	input,
	isDevMode,
	linkedSignal,
	signal
} from "@angular/core";
import { form } from "@angular/forms/signals";
import { RouterOutlet } from "@angular/router";
import { FormDesigner, FormDesignerHeader, ItemReorderedEvent } from "@app/components/form/schema";
import { defineFormDesignerFormSchema, FormItemEntity } from '@app/components/form/schema/form-designer-config';
import { HasPendingChanges } from "@app/model/form";
import { Strict } from "@civilio/shared";
import { formItemsCollection, formVersionsCollection } from "@db/collections";
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

import { addFormItem, removeFormItem } from "@db/actions";
import { FormItemType } from "@db/schemas";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { and, eq, injectLiveQuery } from "@tanstack/angular-db";
import { injectQueryParams } from "ngxtension/inject-query-params";
import { Observable } from "rxjs";

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
	readonly slug = input<string>();
	private readonly formVersionArg = injectQueryParams("version");
	protected readonly sidebarState = signal<BrnDialogState>(isDevMode() ? 'closed' : 'closed');
	protected readonly addFormItem = addFormItem();
	protected readonly removeFormItem = removeFormItem();

	protected readonly formDefinition = injectLiveQuery({
		params: () => ({ fv: this.formVersionArg(), form: this.slug() }),
		query: ({ params, q }) => {
			return q.from({
				fi: formItemsCollection,
			}).innerJoin({ fv: formVersionsCollection }, ({ fi, fv }) => eq(fi.formVersion, fv.id))
				.where(({ fv }) => and(
					eq(fv.form, params.form),
					params.fv ? eq(fv.id, params.fv) : eq(fv.isCurrent, true)
				))
				.orderBy(({ fi }) => fi.path, { direction: 'asc' })
				.select(({ fi }) => fi)
		}
	});
	protected readonly formVersion = injectLiveQuery({
		params: () => ({ form: this.slug(), fv: this.formVersionArg() }),
		query: ({ params, q }) => {
			return q.from({ fv: formVersionsCollection })
				.where(({ fv }) => and(
					eq(fv.form, params.form),
					params.fv ? eq(fv.id, params.fv) : eq(fv.isCurrent, true)
				))
				.findOne()
		}
	})

	protected readonly formData = linkedSignal(() => this.formDefinition.data() as unknown as Strict<FormItemEntity[]>);
	protected readonly renderForm = linkedSignal(() => !!this.slug());
	protected readonly pendingChangesDialogState =
		signal<BrnDialogState>("closed");
	protected pendingChangesActionCallback?: (
		action: "save" | "stay" | "discard",
	) => void;
	protected readonly formModel = form(
		this.formData,
		defineFormDesignerFormSchema()
	);

	protected async onRemoveItem(id: string) {
		const tx = this.removeFormItem({ id, formVersion: this.formVersion.data()!.id });
		await tx.commit();
	}

	protected async onReordered({ endIndex, startIndex }: ItemReorderedEvent) {

	}

	protected async onItemAdd(type: FormItemType) {
		const fvId = this.formVersion.data()?.id;
		if (fvId) {
			const tx = this.addFormItem({
				type,
				path: String(this.formData().length ?? 0),
				formVersion: fvId,
				id: crypto.randomUUID()
			});
			await tx.commit();
		}
	}

	private computeItemPaths() {
		let changed = false;
		for (let i = 0; i < this.formModel().value().length; i++) {
			const item = this.formModel[i];
			const newPath = String(i);
			const oldPath = item.path().value();
			const pathsEquals = newPath === oldPath;
			changed ||= !pathsEquals;
			// if (item.type().value() == "group") {
			// 	const config = item.config as unknown as FieldTree<
			// 		Strict<FormItemGroup | NewFormItemGroup>["config"]
			// 	>;
			// 	for (let j = 0; j < config.fields.length; j++) {
			// 		const field = config.fields[j];
			// 		const newChildPath = [newPath, "config", "fields", String(j)].join(
			// 			formItemPathSeparator,
			// 		);
			// 		const oldChildPath = field.path().value();
			// 		const pathsEquals = newChildPath === oldChildPath;
			// 		changed ||= !pathsEquals;
			// 		field.path().value.set(newChildPath);
			// 	}
			// }
			item.path().value.set(newPath);
		}
		if (changed) {
			this.formModel().markAsDirty();
		}
	}

	// private findNewItems() {
	// 	const newItems = Array<string>();
	// 	for (const i of (this.formData() as Strict<FormItem>[]) ??
	// 		Array<Strict<FormItem>>()) {
	// 		walkFormItemTree(i, (item) => {
	// 			if (!isExistingFormItem(item)) {
	// 				newItems.push(item.path);
	// 			}
	// 		});
	// 	}
	// 	return newItems;
	// }

	// private findUpdatedItems() {
	// 	const updatedItems = Array<string>();
	// 	for (const i of this.formData()) {
	// 		walkFormItemTree(i, (item) => {
	// 			if (isExistingFormItem(item)) {
	// 				const pristineItem = get(
	// 					this.formData()?.items ?? [],
	// 					item.path,
	// 				) as Strict<FormItemDefinition>;
	// 				if (!pristineItem) return;
	// 				const itemClone = stripSymbols(item);
	// 				const pristineClone = stripSymbols(pristineItem);
	// 				const flatClone = flatten(itemClone);
	// 				let flatPristine = flatten(pristineClone);
	// 				if (isGroup(pristineItem)) {
	// 					const stripped = omit(pristineItem, ["config.fields"]);
	// 					flatPristine = flatten(stripped);
	// 				}

	// 				const equals = isEqual(flatPristine, flatClone);
	// 				if (!equals) {
	// 					updatedItems.push(item.path);
	// 				}
	// 			}
	// 		});
	// 	}
	// 	return updatedItems;
	// }

	// private findDeletedItems() {
	// 	const existingItems = new Set<string>();
	// 	const originalItems = new Set<string>();
	// 	for (const i of (this.formData()?.items ??
	// 		[]) as unknown as Strict<FormItem>[]) {
	// 		walkFormItemTree(i, (item) => {
	// 			if (!isExistingFormItem(item)) return;
	// 			existingItems.add(item.id);
	// 		});
	// 	}
	// 	for (const i of (this.formData()?.items as Strict<FormItemDefinition>[]) ??
	// 		[]) {
	// 		walkFormItemTree(i, (item) => {
	// 			if (!isExistingFormItem(item)) return;
	// 			originalItems.add(item.id);
	// 		});
	// 	}

	// 	const deletedItems = difference([...originalItems], [...existingItems]);
	// 	return deletedItems;
	// }

	protected async onFormSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		// 	if (!this.formModel().valid()) {
		// 		toast.warning("Invalid form state", {
		// 			description:
		// 				"The current state of the form designer is invalid. Pleace update the form's state and try again",
		// 		});
		// 		return;
		// 	}
		// 	// this.computeItemPaths();
		// 	await submit(this.formModel, async (tree) => {
		// 		const addedItems = this.findNewItems().map((p) =>
		// 			(get(tree.items, p) as FieldTree<any>)?.().value(),
		// 		) as any;
		// 		const removedItems = this.findDeletedItems();
		// 		const updatedItems = this.findUpdatedItems().map((p) =>
		// 			(get(tree.items, p) as FieldTree<any>)?.().value(),
		// 		) as any;
		// 		try {
		// 			await lastValueFrom(
		// 				this.formService.updateFormVersionDefinition(
		// 					this.slug(),
		// 					this.formVersion() ?? "current",
		// 					{
		// 						addedItems,
		// 						updatedItems,
		// 						removedItems,
		// 					},
		// 				),
		// 			);
		// 			this.formDefinition.reload();
		// 			tree().reset(this.formData());
		// 		} catch (e) {
		// 			console.error(e);
		// 			toast.error("Could not save changes", {
		// 				description: (e as Error).message,
		// 			});
		// 		}
		// 	});
	}

	// protected onFormDiscard(event?: Event) {
	// 	event?.preventDefault();
	// 	const value = this.formDefinition.value();
	// 	if (value) {
	// 		this.formModel().reset(domainToStrictFormDefinition(value));
	// 	}
	// }

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

	// protected onItemAdd(type: FormItemType) {
	// 	this.designer()?.handleNewItemAdded(type);
	// }

	protected toggleSidebarState() {
		this.sidebarState.update(v => v == 'open' ? 'closed' : 'open');
	}

	// constructor(router: Router) {
	// 	effect(() => {
	// 		const formData = this.formData();
	// 		console.log("form-data", formData);
	// 	});
	// 	effect(() => {
	// 		const error = this.formDefinition.status();
	// 		const loadingFinished = !this.formDefinition.isLoading();
	// 		if (
	// 			loadingFinished &&
	// 			error instanceof HttpErrorResponse &&
	// 			error.status == 404
	// 		) {
	// 			router.navigate(["/schemas"]).then(() => {
	// 				toast.warning("Not found", {
	// 					description: "Could not find the specified form version",
	// 				});
	// 			});
	// 		}
	// 	});
	// }
}
