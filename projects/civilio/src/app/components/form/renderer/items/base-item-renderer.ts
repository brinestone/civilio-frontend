import { Component, computed, input } from "@angular/core";
import { NewFormItemDefinition } from "@civilio/sdk/models";

@Component({
  selector: "cv-base-item-renderer",
  template: "",
})
export class BaseItemRenderer<T extends NewFormItemDefinition> {
  readonly item = input.required<T>();
  readonly index = input.required<number>();

  protected readonly path = computed(() => this.item().path);
}
