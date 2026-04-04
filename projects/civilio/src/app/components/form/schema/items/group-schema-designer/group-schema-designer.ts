import { CdkDragHandle, CdkDropList } from "@angular/cdk/drag-drop";
import {
  AsyncPipe,
  JsonPipe,
  NgComponentOutlet,
  NgTemplateOutlet,
} from "@angular/common";
import { Component, computed, signal, Type } from "@angular/core";
import { FormField } from "@angular/forms/signals";
import { DebugHeader, DebugPanel } from "@app/components/debug";
import {
  defaultFormItemDefinitionSchemaValue,
  formItemPathSeparator,
  HINT,
  PLACEHOLDER,
} from "@app/components/form/schema/form-designer-config";
import { FormItemGroup, NewFormItemField } from "@civilio/sdk/models";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
  lucideEye,
  lucideGrip,
  lucidePlus,
  lucideSliders,
  lucideTags,
} from "@ng-icons/lucide";
import { HlmAlertImports } from "@spartan-ng/helm/alert";
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmSeparator } from "@spartan-ng/helm/separator";
import { HlmSpinner } from "@spartan-ng/helm/spinner";
import { produce } from "immer";
import { FormItemActions } from "../../form-item-actions/form-item-actions.component";
import {
  ConfigTab,
  FormItemSettingsDesigner,
} from "../../form-item-settings/form-item-settings";
import { BaseFormItemSchemaDesigner } from "../base-item-schema-designer/base-form-item-schema-designer";
import { FieldItemSchemaDesigner } from "../field-item-schema-designer/field-item-schema-designer";

@Component({
  selector: "cv-group-schema-designer",
  providers: [
    provideIcons({
      lucideSliders,
      lucideEye,
      lucideTags,
    }),
  ],
  viewProviders: [
    provideIcons({
      lucideGrip,
      lucidePlus,
    }),
  ],
  imports: [
    HlmFieldImports,
    HlmAlertImports,
    CdkDropList,
    FormItemSettingsDesigner,
    FormItemActions,
    FormField,
    DebugPanel,
    DebugHeader,
    HlmButton,
    JsonPipe,
    HlmSpinner,
    CdkDragHandle,
    HlmSeparator,
    NgIcon,
    AsyncPipe,
    NgComponentOutlet,
    FieldItemSchemaDesigner,
    NgTemplateOutlet,
  ],
  host: {
    "[class.border-border]": "editing()",
  },
  templateUrl: "./group-schema-designer.html",
  styleUrl: "./group-schema-designer.scss",
})
export class GroupSchemaDesigner extends BaseFormItemSchemaDesigner<
  FormItemGroup | FormItemGroup
> {
  protected currentTab = signal("meta");
  protected tabContentComponents: Record<string, Promise<Type<any>>> = {
    meta: import("../../meta/group-config-designer/group-config-designer").then(
      (m) => m.GroupConfigDesigner,
    ),
    relevance:
      import("../../form-item-relevance-config/form-item-relevance-config.component").then(
        (m) => m.FormItemRelevanceConfig,
      ),
    tags: import("../../form-item-meta-config/form-item-meta-config").then(
      (m) => m.FormItemMetaConfig,
    ),
  };
  protected configTabs = [
    { label: "Group configuration", value: "meta", icon: "lucideSliders" },
    { label: "Relevance", value: "relevance", icon: "lucideEye" },
    { label: "Meta", value: "tags", icon: "lucideTags" },
  ] as ConfigTab[];
  protected readonly titlePlaceholder = computed(() => {
    return this.node().config.title().metadata(PLACEHOLDER)?.();
  });
  protected readonly titleHint = computed(() => {
    this.node().config.title().metadata(HINT)?.();
  });
  protected readonly descriptionPlaceholder = computed(() => {
    return this.node().config.description().metadata(PLACEHOLDER)?.();
  });
  protected onAddFieldButtonClicked() {
    const newPath = [
      this.node().path().value(),
      "config",
      "fields",
      this.node().config.fields().value().length,
    ].join(formItemPathSeparator);
    const newField = defaultFormItemDefinitionSchemaValue(
      newPath,
      "field",
    ) as NewFormItemField;
    newField.parentId = this.node().id?.().value() ?? undefined;
    this.node()
      .config.fields()
      .value.update((v) =>
        produce(v, (draft) => {
          draft.push(newField as any);
        }),
      );
  }
}
