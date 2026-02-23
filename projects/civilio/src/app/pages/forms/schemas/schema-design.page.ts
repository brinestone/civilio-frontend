import {
	CdkDropList,
	CdkDropListGroup
} from '@angular/cdk/drag-drop';
import { AsyncPipe, NgComponentOutlet, NgTemplateOutlet } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	computed,
	inject,
	input,
	linkedSignal,
	resource,
	Type
} from '@angular/core';
import { FieldTree, form, submit } from '@angular/forms/signals';
import { FormDesignerHeader } from '@app/components/form/schema';
import { createFormItemContextInjector } from '@app/components/form/schema/items';
import {
	isGroupItem
} from '@app/model/form';
import { FormService2 } from '@app/services/form';
import { FormItemDefinition, FormItemField, FormItemGroup } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { current, produce } from 'immer';
import { get } from 'lodash';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import {
	defaultFormDefinitionSchemaValue,
	defaultFormItemDefinitionSchemaValue,
	defineFormDefinitionFormSchema,
	domainToStrictFormDefinition,
	FormItemType,
	FormModel,
	pathSeparator
} from './form-schemas';
import { toast } from 'ngx-sonner';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
const isFieldTree = (v: FieldTree<Strict<FormItemDefinition>>): v is FieldTree<Strict<FormItemField>> => v.type().value() === 'field';
type FormItemAddTarget = FieldTree<FormModel> | FieldTree<FormItemGroup>;

@Component({
	selector: 'cv-forms',
	imports: [
		HlmDropdownMenuImports,
		HlmAlertDialogImports,
		NgTemplateOutlet,
		CdkDropList,
		CdkDropListGroup,
		FormDesignerHeader,
		AsyncPipe,
		NgComponentOutlet
	],
	templateUrl: './schema-design.page.html',
	styleUrl: './schema-design.page.scss',
	host: {
		'[class.editing]': '!renderForm()',
		'[class.scrollbar-thin]': 'true',
		'[class.scrollbar-thumb-primary/50]': 'true',
		'[class.scrollbar-track-transparent]': 'true',
	},
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchemaDesignPage {
	readonly slug = input<string>();
	protected readonly formItemComponents = {
		'field': import('../../../components/form/schema/items/field-schema-designer/field-schema-designer').then(m => m.FieldSchemaDesigner)
	} as Record<string, Promise<Type<any>>>;
	private readonly formVersionQueryParameter = injectQueryParams<string>('fv', { defaultValue: 'current' })
	private readonly formService = inject(FormService2);
	private readonly formDefinition = resource({
		params: () => ({
			slug: this.slug(),
			version: this.formVersionQueryParameter()
		}),
		loader: async ({ params }) => {
			if (!params.slug) return undefined;
			return await this.formService.findFormDefinition(params.slug, params.version ?? undefined);
		}
	});
	private readonly formData = linkedSignal(() => {
		const v = this.formDefinition.value();
		if (v) return domainToStrictFormDefinition(v);
		return defaultFormDefinitionSchemaValue();
	});
	protected readonly renderForm = linkedSignal(() => !!this.slug());
	protected readonly formModel = form(this.formData, defineFormDefinitionFormSchema());
	protected readonly fieldItems = computed(() => {
		const { items } = this.formData();
		const reg = {} as Record<string, FieldTree<Strict<FormItemField>>>;
		for (const i of items) {
			this.walkFormItemTree(i, item => {
				const tree = get(this.formModel.items, item.path.split(pathSeparator)) as FieldTree<Strict<FormItemDefinition>>;
				if (isFieldTree(tree) && tree().valid()) {
					reg[item.path] = tree;
				}
			})
		}
		return reg;
	});
	protected readonly itemComponentInjector = createFormItemContextInjector({
		itemDeleteHandler: this.onRemoveFormItem.bind(this),
		allFields: this.fieldItems
	});

	private walkFormItemTree(item: Strict<FormItemDefinition>, cb: (item: Strict<FormItemDefinition>) => void) {
		cb(item);
		if (isGroupItem(item) && item.children.length > 0) {
			for (const child of item.children) {
				this.walkFormItemTree(child, cb);
			}
		}
	}

	protected addFormItem(target: FormItemAddTarget, type: FormItemType) {
		const isGroup = (t: FormItemAddTarget): t is FieldTree<Strict<FormItemGroup>> => 'children' in t().value();
		const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> => 'items' in t().value();
		if (isGroup(target)) {
			target().value.update(state => produce(state, draft => {
				const path = `${current(draft).path}${pathSeparator}${current(draft).children.length}`;
				const item = defaultFormItemDefinitionSchemaValue(path, type);
				draft.children.push(item);
			}));
		} else if (isRoot(target)) {
			target().value.update(state => produce(state, draft => {
				const path = `${current(draft).items.length}`;
				const item = defaultFormItemDefinitionSchemaValue(path, type);
				draft.items.push(item);
			}))
		}
	}

	protected onRemoveFormItem(path: string, index: number) {
		const segments = path.split(pathSeparator);
		const target = (segments.length == 1 ? this.formModel.items : get(this.formModel.items, segments.slice(0, -1))) as FieldTree<unknown[]>;
		if (!target) return;
		target().value.update(state => produce(state, draft => {
			draft.splice(index, 1);
		}))
	}

	protected onFormSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		if (!this.formModel().valid()) {
			toast.warning('Invalid form state', {description: 'The current state of the form designer is invalid. Pleace update the form\'s state and try again'});
		}
		submit(this.formModel, async tree => {
			const value = tree().value();
		})
	}

	protected onFormDiscard() {

	}
}
