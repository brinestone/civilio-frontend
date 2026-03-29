import { JsonPipe } from "@angular/common";
import { Component, input } from "@angular/core";
import { FormVersionDefinition } from "@civilio/sdk/models";

@Component({
  selector: "cv-form-renderer",
  templateUrl: "./form-renderer.html",
  imports: [JsonPipe],
})
export class FormRenderer {
  readonly formDefinition = input.required<FormVersionDefinition>();
}
