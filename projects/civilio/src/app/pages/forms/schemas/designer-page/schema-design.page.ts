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
	signal,
	Type
} from '@angular/core';
import { FieldTree, form, submit } from '@angular/forms/signals';
import { FormDesignerHeader } from '@app/components/form/schema';
import { createFormItemContextInjector } from '@app/components/form/schema/items';
import {
	HasPendingChanges,
	isGroupItem
} from '@app/model/form';
import { FormService2 } from '@app/services/form';
import { FormItemDefinition, FormItemField, FormItemGroup } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { current, produce } from 'immer';
import { difference, differenceWith, get, intersection, intersectionWith } from 'lodash';
import { toast } from 'ngx-sonner';
import { Observable } from 'rxjs';
import {
	defaultFormDefinitionSchemaValue,
	defaultFormItemDefinitionSchemaValue,
	defineFormDefinitionFormSchema,
	domainToStrictFormDefinition,
	FormItemType,
	FormModel,
	pathSeparator
} from '../form-schemas';
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
		HlmSpinner,
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
export class SchemaDesignPage implements HasPendingChanges {
	readonly slug = input.required<string>();
	readonly formVersion = input.required<string>({ alias: 'version' });
	protected readonly formItemComponents = {
		'field': import('../../../../components/form/schema/items/field-schema-designer/field-schema-designer').then(m => m.FieldSchemaDesigner)
	} as Record<string, Promise<Type<any>>>;
	private readonly formService = inject(FormService2);
	private readonly formDefinition = resource({
		params: () => ({
			slug: this.slug(),
			version: this.formVersion()
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
	protected readonly pendingChangesDialogState = signal<BrnDialogState>('closed');
	protected readonly formNameDialogState = signal<BrnDialogState>('closed');
	protected pendingChangesActionCallback?: (action: 'save' | 'stay' | 'discard') => void;

	private walkFormItemTree(item: Strict<FormItemDefinition>, cb: (item: Strict<FormItemDefinition>) => void) {
		cb(item);
		if (isGroupItem(item) && item.meta.fields.length > 0) {
			for (const child of item.meta.fields) {
				this.walkFormItemTree(child, cb);
			}
		}
	}

	protected addFormItem(target: FormItemAddTarget, type: FormItemType) {
		const isGroup = (t: FormItemAddTarget): t is FieldTree<Strict<FormItemGroup>> => 'children' in t().value();
		const isRoot = (t: FormItemAddTarget): t is FieldTree<FormModel> => 'items' in t().value();
		if (isGroup(target)) {
			target().value.update(state => produce(state, draft => {
				const path = `${current(draft).path}${pathSeparator}${current(draft).meta.fields.length}`;
				const item = defaultFormItemDefinitionSchemaValue(path, 'field') as Strict<FormItemField>;
				draft.meta.fields.push(item);
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

	protected async onFormSubmit(event?: SubmitEvent) {
		event?.preventDefault();
		if (!this.formModel().valid()) {
			toast.warning('Invalid form state', { description: 'The current state of the form designer is invalid. Pleace update the form\'s state and try again' });
		}
		await submit(this.formModel, async tree => {
			const value = tree().value();
			const pristine = this.formDefinition.value();
			const comparator = (a: FormItemDefinition, b: FormItemDefinition) => {
				const symbolA = (a as unknown as { Symbol(): Symbol }).Symbol()
				const symbolB = (b as unknown as { Symbol(): Symbol }).Symbol();
				return symbolA == symbolB
			}
			const removedItems = differenceWith(pristine!.items!, value.items, comparator).map(i => i.id!);
			const addedItems = differenceWith(value.items, pristine!.items!, comparator);
			const updatedItems = intersectionWith(value.items, pristine!.items!, comparator);
			const changedItems = updatedItems.filter((item, index) => {
				const pristineItem = pristine!.items![pristine!.items!.indexOf(updatedItems[index])];
				return JSON.stringify(item) !== JSON.stringify(pristineItem);
			});
			try {
				await this.formService.updateFormVersionDefinition({
					addedItems, removedItems, updatedItems: changedItems
				}, this.slug(), this.formVersion());
			} catch (e) {
				toast.error('Could not save changes', { description: (e as Error).message });
			}
		})
	}

	protected onFormDiscard() {

	}
	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		if (!this.formModel().dirty()) return false;
		this.pendingChangesDialogState.set('open');
		return new Observable<boolean>(subscriber => {
			subscriber.add(() => {
				this.pendingChangesActionCallback = undefined;
				this.pendingChangesDialogState.set('closed');
			})
			this.pendingChangesActionCallback = async action => {
				switch (action) {
					case 'discard':
						subscriber.next(false);
						break;
					case 'stay':
						subscriber.next(true);
						break;
					case 'save':
						await this.onFormSubmit();
						subscriber.next(this.formModel().dirty());
						break;
				}
				subscriber.complete();
			}
		})
	}
}
