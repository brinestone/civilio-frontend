import { BooleanInput } from "@angular/cdk/coercion";
import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import {
	booleanAttribute,
	Component,
	computed,
	inject,
	input,
	TemplateRef,
	Type
} from "@angular/core";
import { JsonLogic } from "@app/adapters/json-logic";
import { SubmissionData } from "@civilio/sdk/models";
import { FormItemType } from "@db/schemas";
import { FormItemEntity } from "@db/types";
import { HlmFieldGroup } from "@spartan-ng/helm/field";
import { injectWithForm, TanStackWithForm } from '@tanstack/angular-form';

@Component({
	selector: "cv-form-renderer",
	templateUrl: "./section-renderer.html",
	styleUrl: "./section-renderer.scss",
	imports: [HlmFieldGroup, NgComponentOutlet, AsyncPipe],
	providers: [JsonLogic,],
	hostDirectives: [
		{
			directive: TanStackWithForm,
			inputs: ['form']
		}
	]
})
export class SectionRenderer<TData extends SubmissionData> {
	private readonly logic = inject(JsonLogic);
	readonly formItems = input<FormItemEntity[]>([]);
	readonly submissionData = input<TData>(undefined, { alias: 'formData' });
	protected readonly formAccessor = injectWithForm<TData, any, any, any, any, any, any, any, any, any, any, any>()
	readonly showMissingRendererMessages = input<boolean, BooleanInput>(false, { transform: booleanAttribute })
	readonly itemFallbackContent = input<TemplateRef<any>>();
	readonly preview = input<boolean, BooleanInput>(false, {
		transform: booleanAttribute,
	});

	protected readonly dataKeyItems = computed(() => {
		return this.formItems().filter(i => i.type == 'question' || i.type == 'section');
	});
	protected readonly renderers = {
		question: import("../items/field/wrapper/field-item-renderer-wrapper").then(
			(m) => m.FieldItemRendererWrapper,
		),
	} as Record<FormItemType, Promise<Type<any>>>;
	// protected readonly canMergeRemoteChanges = injectStore(this.formAccessor.form, state => !state.isDirty);
	// #mergeRemoteChanges = effect(() => {
	// 	const canProceed = untracked(this.canMergeRemoteChanges);
	// 	if (!canProceed) return;

	// 	this.formAccessor.form.reset(this.submissionData());
	// });
	private evaluateRelevance(data: SubmissionData, logic: any) {
		return this.logic.run(logic, data);
	}

	protected handleSubmit(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		this.formAccessor.form.handleSubmit();
	}
}
