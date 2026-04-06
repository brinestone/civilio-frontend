import { HttpErrorResponse } from "@angular/common/http";
import {
	ChangeDetectionStrategy,
	Component,
	effect,
	inject,
	input,
	linkedSignal,
	signal,
	viewChild
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { FormRenderer } from "@app/components/form/renderer";
import { FormDesigner, FormDesignerHeader } from "@app/components/form/schema";
import { HasPendingChanges } from "@app/model/form";
import { defaultFormDefinitionSchemaValue, domainToStrictFormDefinition, FormItemType } from '@app/components/form/schema/form-designer-config';
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { toast } from "ngx-sonner";
import { Observable, of } from "rxjs";

@Component({
	selector: "cv-forms",
	viewProviders: [
	],
	imports: [
		HlmAlertDialogImports,
		FormDesignerHeader,
		FormRenderer,
		FormDesigner
	],
	templateUrl: "./schema-design.page.html",
	styleUrl: "./schema-design.page.scss",
	host: {
		"[class.editing]": "!renderForm()",
		"[class.scrollbar-thin]": "true",
		"[class.scrollbar-thumb-primary/50]": "true",
		"[class.scrollbar-track-transparent]": "true",
	},
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SchemaDesignPage implements HasPendingChanges {
	readonly slug = input.required<string>();
	readonly formVersion = input.required<string>({ alias: "version" });
	private readonly formService = inject(FormsService);
	private readonly designer = viewChild(FormDesigner);
	protected readonly formDefinition = rxResource({
		params: () => ({ slug: this.slug(), version: this.formVersion() }),
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
	// protected readonly formModel = form(
	//   this.formData,
	//   defineFormDesignerFormSchema(),
	// );
	protected readonly pendingChangesDialogState =
		signal<BrnDialogState>("closed");
	protected pendingChangesActionCallback?: (
		action: "save" | "stay" | "discard",
	) => void;


	protected async onFormSubmit(event?: SubmitEvent) {
		// event?.preventDefault();
		// if (!this.formModel().valid()) {
		//   toast.warning("Invalid form state", {
		//     description:
		//       "The current state of the form designer is invalid. Pleace update the form's state and try again",
		//   });
		//   return;
		// }
		// this.computeItemPaths();
		// await submit(this.formModel, async (tree) => {
		//   const addedItems = this.findNewItems().map((p) =>
		//     (get(tree.items, p) as FieldTree<any>)?.().value(),
		//   ) as any;
		//   const removedItems = this.findDeletedItems();
		//   const updatedItems = this.findUpdatedItems().map((p) =>
		//     (get(tree.items, p) as FieldTree<any>)?.().value(),
		//   ) as any;
		//   try {
		//     await lastValueFrom(
		//       this.formService.updateFormVersionDefinition(
		//         this.slug(),
		//         this.formVersion(),
		//         {
		//           addedItems,
		//           updatedItems,
		//           removedItems,
		//         },
		//       ),
		//     );
		//     this.formDefinition.reload();
		//     tree().reset(this.formData());
		//   } catch (e) {
		//     console.error(e);
		//     toast.error("Could not save changes", {
		//       description: (e as Error).message,
		//     });
		//   }
		// });
	}

	protected onFormDiscard(event?: Event) {
		// event?.preventDefault();
		// const value = this.formDefinition.value();
		// if (value) {
		//   this.formModel().reset(domainToStrictFormDefinition(value));
		// }
	}

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
		// if (!this.formModel().dirty()) return false;
		// this.pendingChangesDialogState.set("open");
		// return new Observable<boolean>((subscriber) => {
		//   subscriber.add(() => {
		//     this.pendingChangesActionCallback = undefined;
		//     this.pendingChangesDialogState.set("closed");
		//   });
		//   this.pendingChangesActionCallback = async (action) => {
		//     switch (action) {
		//       case "discard":
		//         subscriber.next(false);
		//         break;
		//       case "stay":
		//         subscriber.next(true);
		//         break;
		//       case "save":
		//         await this.onFormSubmit();
		//         subscriber.next(this.formModel().dirty());
		//         break;
		//     }
		//     subscriber.complete();
		//   };
		// });
	}

	protected onItemAdd(type: FormItemType) {
		this.designer()?.addFormItem(type);
	}

	constructor(router: Router) {
		effect(() => {
			const formData = this.formData();
			console.log('form-data' , formData);
		})
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
