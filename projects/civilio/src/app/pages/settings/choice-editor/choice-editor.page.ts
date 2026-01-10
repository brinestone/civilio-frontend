import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass, NgPlural, NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, linkedSignal, OnDestroy, OnInit, resource, signal, untracked, viewChildren } from '@angular/core';
import { apply, applyEach, debounce, Field, form, required, schema } from '@angular/forms/signals';
import { HasPendingChanges } from '@app/model/form';
import { FORM_SERVICE } from '@app/services/form';
import { randomString } from '@app/util';
import { FindFormOptionGroupsResponseSchema, OptionItemSchema } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideChevronDown, lucideChevronsUpDown, lucideChevronUp, lucideFilter, lucideLoader, lucideMenu, lucidePlus, lucideRefreshCw, lucideSaveAll, lucideSearch, lucideTrash2 } from '@ng-icons/lucide';
import { BrnPopoverImports, BrnPopoverTrigger } from '@spartan-ng/brain/popover';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCommandEmpty, HlmCommandImports } from '@spartan-ng/helm/command';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmLabel } from '@spartan-ng/helm/label';
import { HlmPopoverImports } from '@spartan-ng/helm/popover';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTextarea } from '@spartan-ng/helm/textarea';
import { HlmH3 } from '@spartan-ng/helm/typography';
import { current, produce, setAutoFreeze } from 'immer';
import { toast } from 'ngx-sonner';
import { Observable } from 'rxjs';
import z from 'zod';

const GroupLineSchema = z.object({
	data: FindFormOptionGroupsResponseSchema.shape.groups.unwrap().extend({
		options: OptionItemSchema.extend({
			isNew: z.boolean().optional().default(false)
		}).array()
	}),
	isNew: z.boolean().default(false),
	expanded: z.boolean().optional().default(false)
});
type GroupLine = z.output<typeof GroupLineSchema>;

@Component({
	selector: 'cv-choice-editor',
	viewProviders: [
		provideIcons({
			lucideRefreshCw,
			lucidePlus,
			lucideSaveAll,
			lucideChevronDown,
			lucideChevronUp,
			lucideMenu,
			lucideLoader,
			lucideFilter,
			lucideSearch,
			lucideTrash2,
			lucideChevronsUpDown
		})
	],
	imports: [
		HlmFieldImports,
		HlmInputGroupImports,
		HlmCommandImports,
		BrnPopoverImports,
		HlmPopoverImports,
		HlmSelectImports,
		BrnSelectImports,
		HlmH3,
		NgClass,
		HlmLabel,
		NgIcon,
		HlmButton,
		Field,
		HlmTextarea,
		CdkDropList,
		CdkDrag,
		CdkDragHandle,
		NgPlural,
		BrnPopoverTrigger,
		CdkDragPlaceholder,
		HlmCommandEmpty,
		NgTemplateOutlet,
		HlmInput,
	],
	templateUrl: './choice-editor.page.html',
	styleUrl: './choice-editor.page.scss',
})
export class ChoiceEditorPage implements OnInit, OnDestroy, HasPendingChanges {
	private expansionPanels = viewChildren<ElementRef<HTMLDivElement>>('expansionPanel');
	private formService = inject(FORM_SERVICE);
	// protected form = input.required<string>();
	protected savingChanges = signal(false);
	protected readonly options = resource({
		defaultValue: { groups: [] },
		// params: () => ({ form: this.form() }),
		loader: async ({ params }) => {
			const { groups } = await this.formService.loadUngroupedFormOptions();
			return { groups: GroupLineSchema.array().parse(groups.map(g => ({ data: g }))) };
		}
	})
	protected readonly optionsSequential = computed(() => {
		return this.formData().groups.map(g => {
			const items = g.data.options;
			const values = items.map(i => Number(i.value));
			if (values.some(v => isNaN(v))) return false;
			const min = Math.min(...values);
			const max = Math.max(...values);

			const isSpreadValid = (max - min) === (items.length - 1);
			const hasNoDuplicates = new Set(values).size === items.length;
			return isSpreadValid && hasNoDuplicates;
		})
	});
	protected readonly newOptions = computed(() => {
		const data = this.formData();
		return data.groups.map(g => {
			if (g.isNew) return g.data.options;
			return g.data.options.filter(i => i.isNew);
		});
	});
	protected readonly newItemsIndexOffset = computed(() => {
		return this.formData().groups.map(g => g.isNew ? 0 : g.data.options.findIndex(i => i.isNew) < 0 ? g.data.options.length : g.data.options.findIndex(i => i.isNew));
	})
	protected readonly formData = linkedSignal(() => this.options.value())
	private readonly groupLineSchema = schema<GroupLine>(paths => {
		apply(paths.data, innerPaths => {
			applyEach(innerPaths.options, itemPath => {
				required(itemPath.label, { message: 'This field is required' });
				required(itemPath.value, { message: 'This field is required' });
				// required(itemPath., { message: 'This field is required', when: ({ valueOf }) => !!valueOf(paths.data.parentGroup) })
			});

			debounce(innerPaths.title, 200);
			required(innerPaths.title, { message: 'This field is required' });
			debounce(innerPaths.key, 200);
			required(innerPaths.key, { message: 'This field is required' });
			// validateHttp<string, { available: boolean }>(innerPaths.group as any, {
			// 	request: ({ value, pathKeys }) => {
			// 		const pristineValue = get(untracked(this.formData), pathKeys()).trim();
			// 		const currentValue = value().trim();
			// 		if (pristineValue === currentValue) return;
			// 		return `http://localhost:3000/api/forms/${this.form()}/options/group-check?key=${value()}`
			// 	},
			// 	onSuccess: (response, { value }) => {
			// 		if (response.available) return null;
			// 		return { messages: 'Value is not unique', kind: 'duplicateValue' }
			// 	},
			// 	onError: (e, ctx) => {
			// 		return { messages: 'Could not check key availability', kind: 'networkError' }
			// 	}
			// })
		})
	});
	protected readonly formModel = form(this.formData, (paths) => {
		applyEach(paths.groups, this.groupLineSchema);
	});
	protected readonly parents = computed(() => {
		const { groups } = this.formData();
		return groups.map(g => !!g.data.parentKey ? (groups.find(gg => gg.data.key == g.data.parentKey) ?? null) : null)
			.map(g => g ? ({
				key: g.data.key as string,
				title: g.data.title,
				options: g.data.options
			}) : null);
	})

	protected onToggleExpanded({ currentTarget, target, type }: MouseEvent, lineIndex: number) {
		if (
			(type == 'click' && target instanceof HTMLButtonElement) ||
			(type == 'dblclick' && currentTarget === target && currentTarget === this.expansionPanels()[lineIndex].nativeElement)
		) {
			this.formModel.groups[lineIndex].expanded().value.update(v => !v);
		}
	}

	protected onSetParentKey(key: string, lineIndex: number) {
		this.formData.update(data => {
			return produce({ ...data }, draft => {
				draft.groups[lineIndex].data.parentKey = key;
			})
		})
	}

	private nextValueInSequence(items: GroupLine['data']['options']) {
		const values = items.map(i => Number(i.value));
		if (values.some(v => isNaN(v))) {
			return String(0);
		}

		const max = Math.max(...values);
		return String(max + 1);
	}

	protected onAddOptionButtonClicked(lineIndex: number) {
		this.formData.update(data => {
			const isSequential = untracked(this.optionsSequential)[lineIndex];
			return produce(data, draft => {
				draft.groups[lineIndex].data.options.push({
					isNew: true,
					label: isSequential ? this.nextValueInSequence(current(draft.groups[lineIndex].data.options)) : '',
					value: isSequential ? this.nextValueInSequence(current(draft.groups[lineIndex].data.options)) : '',
					i18nKey: null
				})
			})
		})
	}

	protected onItemReordered(event: CdkDragDrop<GroupLine['data']['options']>, lineIndex: number) {
		this.formData.update(data => {
			const g = data.groups[lineIndex].data.options;
			const copy = [...g];
			moveItemInArray(copy, event.previousIndex, event.currentIndex);
			return produce({ ...data }, draft => {
				draft.groups[lineIndex].data.options = copy;
			});
		})
	}

	protected onNewItemReOrdered(event: CdkDragDrop<GroupLine['data']['options']>, lineIndex: number) {
		this.formData.update(data => {
			const g = data.groups[lineIndex].data.options;
			const copy = [...g];
			const offset = Math.max(0, this.newItemsIndexOffset()[lineIndex]);
			const prev = event.previousIndex - offset;
			const curr = event.currentIndex - offset;
			moveItemInArray(copy, prev, curr);
			return produce({ ...data }, draft => {
				draft.groups[lineIndex].data.options = copy;
			})
		});
	}

	protected onAddGroupButtonClicked() {
		this.formData.update(data => {
			return produce(data, draft => {
				draft.groups.unshift({
					isNew: true,
					expanded: true,
					data: {
						description: null,
						// form: this.form(),
						key: null,
						options: [],
						parent: null,
						parentKey: null,
						parentValue: null,
						title: ''
					}
				});
			});
		})
	}

	ngOnInit() {
		setAutoFreeze(false);
	}

	ngOnDestroy(): void {
		setAutoFreeze(true);
	}

	onDeleteLineButtonClicked(lineIndex: number) {
		this.formData.update(data => {
			return produce(data, (draft) => {
				const deleted = draft.groups.splice(lineIndex, 1).filter(v => !v.isNew);
				if (deleted.length == 0) return;

				setTimeout(() => {
					this.onExistingGroupDeleted(current(draft).groups[lineIndex].data.key as string);
				}, 0);
			});
		});
	}

	private onExistingGroupDeleted(...key: string[]) {

	}

	protected async onFormSubmit(event: SubmitEvent) {
		event.preventDefault();
		this.savingChanges.set(true);
		try {
			await this.formService.saveOptionGroups({
				groups: this.formData().groups
			});
		} catch (e) {
			toast.error('Error', { description: (e as Error).message });
		} finally {
			this.savingChanges.set(false);
		}
	}

	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return this.formModel().dirty();
	}

	protected generateGroupKeyAt(lineIndex: number) {
		const str = randomString(6);
		this.formData.update(data => {
			return produce(data, draft => {
				draft.groups[lineIndex].data.key = str;
			})
		})
	}
}
