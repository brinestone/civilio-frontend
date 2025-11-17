import {
	Component,
	computed,
	effect,
	forwardRef,
	input,
	linkedSignal,
	output,
	signal,
	Signal,
	untracked
} from "@angular/core";
import {
	ControlValueAccessor,
	FormArray, FormGroup,
	FormRecord,
	NG_VALUE_ACCESSOR,
	ReactiveFormsModule,
	UntypedFormControl
} from "@angular/forms";
import { Option } from "@civilio/shared";
import { NgIcon, provideIcons } from "@ng-icons/core";
import { lucideCheck, lucideCheckCheck, lucidePencil, lucidePlus, lucideTrash2, lucideX, } from "@ng-icons/lucide";
import { TranslatePipe } from '@ngx-translate/core';
import { HlmButton } from "@spartan-ng/helm/button";
import { HlmTableContainer, HlmTableImports } from '@spartan-ng/helm/table';
import { HlmCheckbox } from "@spartan-ng/helm/checkbox";

export type ActionTriggeredEvent<T> = {
	row: T,
	index: number;
	identifier: RowAction<T>['identifier']
}
export type RowAction<T> = {
	class?: string;
	identifier: string | Symbol;
	icon?: string;
	label?: string;
	relevance?: (ctx: RowContext<T>) => boolean;
};

export type RowContext<T> = {
	row: T;
	index: number;
	column: ColumnDefinition<T>;
	selected: boolean;
	editing: boolean;
};

type ValueTransformer<T> = {
	toString: (v: T) => string | null;
	fromString: (v: string | null) => T | null;
}

export type ColumnEditor<T> = {
	enable?: boolean | ((ctx: ColumnDefinition<T>) => boolean);
};

export type TextColumnEditor = ColumnEditor<string> & {
	kind: "text";
	pattern?: string | RegExp;
};
export type BooleanColumnEditor = ColumnEditor<boolean> & { kind: 'boolean' }
export type SelectColumnEditor<T> = ColumnEditor<T> & {
	kind: "select";
	multi?: boolean;
	optionsKey: string;
};
export type NumberColumnEditor = ColumnEditor<number> & {
	kind: "number";
	min?: number;
	max?: number;
}

export type ColumnDefinition<T> = {
	header: string;
	headerI18n?: true;
	cell?: (ctx: RowContext<T>) => string;
	accessor: string;
	accessorFn?: (row: RowContext<T>) => string | number | Symbol;
	editor:
		| TextColumnEditor
		| BooleanColumnEditor
		| SelectColumnEditor<T>
		| NumberColumnEditor;
};

// Base editor types without kind (for the helper parameters)
export type TextEditorParams = Omit<TextColumnEditor, 'kind' | 'transformer'>;
export type NumberEditorParams = Omit<NumberColumnEditor, 'kind' | 'transformer'>;
export type BooleanEditorParams = Omit<BooleanColumnEditor, 'kind' | 'transformer'>;
export type SelectEditorParams<T> = Omit<SelectColumnEditor<T>, 'kind'>;

// Helper function types
export type ColumnHelperArgs<T, K extends string> = Omit<ColumnDefinition<T>, 'editor'> & {
	editor?: K extends 'text' ? TextEditorParams :
		K extends 'number' ? NumberEditorParams :
			K extends 'boolean' ? BooleanEditorParams :
				K extends 'select' ? SelectEditorParams<T> : never;
};

export const columns = {
	number: (params: ColumnHelperArgs<number, 'number'>): ColumnDefinition<number> => ({
		...params,
		editor: params.editor ? {
			...params.editor,
			kind: 'number',
		} : {
			kind: 'number',
		}
	}),

	text: (params: ColumnHelperArgs<string, 'text'>): ColumnDefinition<string> => ({
		...params,
		editor: params.editor ? {
			...params.editor,
			kind: 'text',
		} : {
			kind: 'text',
		}
	}),

	boolean: (params: ColumnHelperArgs<boolean, 'boolean'>): ColumnDefinition<boolean> => {
		return {
			...params,
			editor: {
				...(params.editor ?? {}),
				kind: 'boolean',
			}
		};
	},
	select: <T>(params: ColumnHelperArgs<T, 'select'> & {
		multi?: boolean;
		optionsKey: string;
	}): ColumnDefinition<T> => ({
		...params,
		editor: {
			kind: 'select' as const,
			multi: params.multi,
			optionsKey: params.optionsKey,
			...params.editor
		}
	})
};

export type ActionArgs<T> =
	Required<Omit<RowAction<T>, 'class' | 'icon' | 'relevance'>>
	& Partial<Omit<RowAction<T>, 'label' | 'identifier'>>

export function action<T>(args: ActionArgs<T>): RowAction<T> {
	return {
		...args
	}
}

export type TableDefinition<T> = {
	title: string;
	titleI18n?: true;
	columns: ColumnDefinition<T>[];
	editable?: boolean | (() => boolean);
	rowAddition?: { maxRows: number };
	rowActions?: RowAction<T>[];
	selection?: true;
};

@Component({
	selector: "cv-tabular-field",
	imports: [
		HlmTableImports,
		TranslatePipe,
		NgIcon,
		HlmButton,
		HlmCheckbox,
		ReactiveFormsModule,
		HlmTableContainer
	],
	templateUrl: "./tabular-field.component.html",
	styleUrl: "./tabular-field.component.scss",
	viewProviders: [
		provideIcons({
			lucidePencil,
			lucideCheck,
			lucidePlus,
			lucideTrash2,
			lucideX,
			lucideCheckCheck,
		}),
	],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TabularFieldComponent),
			multi: true,
		},
	],
	hostDirectives: []
})
export class TabularFieldComponent<T> implements ControlValueAccessor {
	public readonly loadingData = input<boolean>();
	public readonly optionSource = input.required<Record<string, Option[]>>();
	public readonly definition = input.required<TableDefinition<T>>();
	public readonly actionTriggered = output<ActionTriggeredEvent<T>>();

	protected readonly enableCreationActions = computed(() => !!this.definition().rowAddition);
	protected readonly maxRows = computed(() => this.definition().rowAddition?.maxRows ?? 0);
	protected readonly headers = computed(() => this.definition().columns.map(c => ({
		header: c.header,
		headerI18n: c.headerI18n
	})));
	protected readonly disabled = signal<boolean>(false);
	protected readonly selectionEnabled = computed(() => this.definition().selection ?? false);
	protected readonly columns = computed(() => this.definition().columns)
	protected readonly selections = linkedSignal(() => {
		return this.form.controls.rows.value.map(() => false);
	});
	protected readonly form = new FormGroup({
		rows: new FormArray<FormRecord<UntypedFormControl>>([])
	});
	private touchCallback?: () => void;
	private changeCallback?: (v: T[]) => void;

	writeValue(obj: any): void {
		this.form.setValue({ rows: obj });
	}

	registerOnChange(fn: any): void {
		this.changeCallback = fn;
	}

	registerOnTouched(fn: any): void {
		this.touchCallback = fn;
	}

	setDisabledState?(isDisabled: boolean): void {
		this.disabled.set(isDisabled);
	}

	protected makeContext<T>(index: number, data: T, column: ColumnDefinition<T>) {
		return {
			column,
			row: data,
			index,
			selected: untracked(this.selections)[index],

		} as RowContext<T>;
	}

	protected addRow() {

	}
}
