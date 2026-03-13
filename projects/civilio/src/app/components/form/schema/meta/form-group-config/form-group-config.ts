import { Component } from "@angular/core";
import { injectFormItemDesignerContext } from "../../items";
import { FormItemGroup, NewFormItemGroup } from "@civilio/sdk/models";

@Component({
	selector: 'cv-form-group-config',
	templateUrl: './form-group-config.html',
	styleUrl: './form-group-config.scss'
})
export class FormGroupConfig {
protected readonly ctx = injectFormItemDesignerContext<FormItemGroup | NewFormItemGroup>();
}
