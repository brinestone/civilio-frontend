import { flatten } from "flat";
import { CdkDropList } from "@angular/cdk/drag-drop";
import {
  AsyncPipe,
  NgComponentOutlet,
  NgTemplateOutlet,
} from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  signal,
  Type,
} from "@angular/core";
import { rxResource } from "@angular/core/rxjs-interop";
import { FieldTree, form, submit } from "@angular/forms/signals";
import { Router } from "@angular/router";
import { FormDesignerHeader } from "@app/components/form/schema";
import { createFormSchemaContextInjector } from "@app/components/form/schema/items";
import { HasPendingChanges } from "@app/model/form";
import {
  FormItemDefinition,
  FormItemField,
  FormItemGroup,
  NewFormItemDefinition,
  NewFormItemField,
  NewFormItemGroup,
} from "@civilio/sdk/models";
import { FormsService } from "@civilio/sdk/services/forms/forms.service";
import { Strict } from "@civilio/shared";
import { BrnDialogState } from "@spartan-ng/brain/dialog";
import { HlmAlertDialogImports } from "@spartan-ng/helm/alert-dialog";
import { HlmFieldGroup } from "@spartan-ng/helm/field";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { current, produce } from "immer";
import get from "lodash/get";
import isEqual from "lodash/isEqual";
import omit from "lodash/omit";
import difference from 'lodash/difference';
import remove from "lodash/remove";
import { toast } from "ngx-sonner";
import { lastValueFrom, Observable, of } from "rxjs";
import {
  defaultFormDefinitionSchemaValue,
  defaultFormItemDefinitionSchemaValue,
  defineFormDefinitionFormSchema,
  domainToStrictFormDefinition,
  FormItem,
  formItemPathSeparator,
  FormItemType,
  FormModel,
  isExistingFormItem,
  isFieldTree,
  isGroup,
  walkFormItemTree,
} from "../form-designer-config";
import { stripSymbols } from "@app/util";
type FormItemAddTarget = FieldTree<FormModel> | FieldTree<FormItemGroup>;

@Component({
  selector: "cv-forms",
  imports: [
    HlmFieldGroup,
    HlmAlertDialogImports,
    NgTemplateOutlet,
    CdkDropList,
    HlmSpinner,
    FormDesignerHeader,
    AsyncPipe,
    NgComponentOutlet,
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
  // private readonly itemDesigners = viewChildren(BaseFormItemSchemaDesigner);
  protected readonly formItemComponents = {
    field:
      import("../../../../components/form/schema/items/field-item-schema-designer/field-item-schema-designer").then(
        (m) => m.FieldItemSchemaDesigner,
      ),
    group:
      import("../../../../components/form/schema/items/group-schema-designer/group-schema-designer").then(
        (m) => m.GroupSchemaDesigner,
      ),
  } as Record<string, Promise<Type<any>>>;
  private readonly formService = inject(FormsService);
  private readonly formDefinition = rxResource({
    params: () => ({ slug: this.slug(), version: this.formVersion() }),
    stream: ({ params }) => {
      return !params.slug
        ? of(undefined)
        : this.formService.findFormDefinitionByVersion(params.slug, {
            version: params.version,
          });
    },
  });
  private readonly formData = linkedSignal(() => {
    const v = this.formDefinition.value();
    if (v) return domainToStrictFormDefinition(v);
    return defaultFormDefinitionSchemaValue();
  });
  protected readonly renderForm = linkedSignal(() => !!this.slug());
  protected readonly formModel = form(
    this.formData,
    defineFormDefinitionFormSchema(),
  );
  protected readonly fieldItems = computed(() => {
    const { items } = this.formData();
    const reg = {} as Record<
      string,
      FieldTree<Strict<FormItemField | NewFormItemField>>
    >;
    for (const i of items) {
      walkFormItemTree(i, (item) => {
        const tree = get(
          this.formModel.items,
          item.path.split(formItemPathSeparator),
        ) as FieldTree<Strict<FormItemDefinition>>;
        if (isFieldTree(tree) && tree().valid()) {
          reg[item.path] = tree;
        }
      });
    }
    return reg;
  });
  // protected readonly allSelected = signal(false);
  // private readonly selectedItems = signal<Record<string, boolean>>({});
  // protected readonly someItemsSelected = computed(() => {
  // 	return values(this.selectedItems()).reduce((a, b) => a || b, false);
  // })
  protected readonly itemComponentInjector = createFormSchemaContextInjector({
    itemDeleteHandler: this.onRemoveFormItem.bind(this),
    allFields: this.fieldItems,
    // 	// allItemsSelected: this.allSelected.asReadonly(),
    // 	// selectionToggledHandler: this.onItemSelectionToggled.bind(this)
  });
  protected readonly pendingChangesDialogState =
    signal<BrnDialogState>("closed");
  protected pendingChangesActionCallback?: (
    action: "save" | "stay" | "discard",
  ) => void;

  protected addFormItem(target: FormItemAddTarget, type: FormItemType) {
    const isGroup = (
      t: FormItemAddTarget,
    ): t is FieldTree<Strict<FormItemGroup>> => "children" in t().value();
    const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> =>
      "items" in t().value();
    if (isGroup(target)) {
      target().value.update((state) =>
        produce(state, (draft) => {
          const {
            path: parentPath,
            config: { fields },
          } = current(draft);
          const path = [parentPath, "config", "fields", fields.length].join(
            formItemPathSeparator,
          );
          const item = defaultFormItemDefinitionSchemaValue(
            path,
            "field",
          ) as Strict<NewFormItemField>;

          draft.config.fields.push(item as any);
        }),
      );
    } else if (isRoot(target)) {
      target().value.update((state) =>
        produce(state, (draft) => {
          const path = `${current(draft).items.length}`;
          const item = defaultFormItemDefinitionSchemaValue(
            path,
            type,
          ) as Strict<NewFormItemDefinition>;
          draft.items.push(item as any);
        }),
      );
    }
    this.computeItemPaths();
    this.formModel().markAsDirty();
  }

  protected onRemoveFormItem(path: string, index: number) {
    const segments = path.split(formItemPathSeparator);
    const target = (
      segments.length == 1
        ? this.formModel.items
        : get(this.formModel.items, segments.slice(0, -1))
    ) as FieldTree<FieldTree<Strict<FormItemDefinition>>[]>;
    if (!target) return;
    target().value.update((state) =>
      produce(state, (draft) => {
        draft.splice(index, 1);
      }),
    );
    this.removeDependentRelevanceExpressionsFor(path);
    this.computeItemPaths();
    this.formModel().markAsDirty();
  }

  private computeItemPaths() {
    for (let i = 0; i < this.formModel.items.length; i++) {
      const item = this.formModel.items[i];
      const newPath = String(i);
      if (item.type().value() == "group") {
        const config = item.config as unknown as FieldTree<
          Strict<FormItemGroup | NewFormItemGroup>["config"]
        >;
        for (let j = 0; j < config.fields.length; j++) {
          const field = config.fields[j];
          field
            .path()
            .value.set(
              [newPath, "config", "fields", String(j)].join(
                formItemPathSeparator,
              ),
            );
        }
      }
      item.path().value.set(newPath);
    }
  }

  private removeDependentRelevanceExpressionsFor(path: string) {
    for (const item of this.formModel.items) {
      if (item.type().value() == "group") {
        const config = item.config as unknown as FieldTree<
          Strict<FormItemGroup | NewFormItemGroup>["config"]
        >;
        for (const field of config.fields) {
          for (const logic of field.relevance.logic) {
            logic().value.update((v) =>
              produce(v, (draft) => {
                draft.expressions = remove(
                  current(draft).expressions,
                  (e) => e.field == path,
                );
              }),
            );
          }
        }
      }
      for (const logic of item.relevance.logic) {
        logic().value.update((v) =>
          produce(v, (draft) => {
            draft.expressions = remove(
              current(draft).expressions,
              (e) => e.field == path,
            );
          }),
        );
      }
    }
  }

  private findNewItems() {
    const newItems = Array<string>();
    for (const i of (this.formData()
      ?.items as Strict<FormItem>[]) ?? Array<Strict<FormItem>>()) {
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
            this.formDefinition.value()?.items ?? [],
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
    for (const i of (this.formDefinition.value()
      ?.items as Strict<FormItemDefinition>[]) ?? []) {
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
    this.computeItemPaths();
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
            this.formVersion(),
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

  constructor(router: Router) {
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

  // protected onselectAll(value: boolean) {
  // 	this.allSelected.set(value);
  // }
}
