import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { BaseFieldItemMetaSchema, FieldItemMetaSchema, FieldTypeSchema } from '@app/model/form';
import { FieldItemMeta } from '@civilio/sdk/models';
import { Strict } from '@civilio/shared';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCalendar, lucideCalendarCheck, lucideCalendarRange, lucideCheck, lucideCheckSquare, lucideClock, lucideHash, lucideListChecks, lucideMapPin, lucideText, lucideTextCursorInput } from '@ng-icons/lucide';
import { BrnDialogImports } from '@spartan-ng/brain/dialog';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';
import z from 'zod';
import { BaseMetaConfigComponent } from '../base-meta-config/base-meta-config.component';

@Component({
	selector: 'cv-form-item-meta-config',
	viewProviders: [
		provideIcons({
			lucideCheckSquare,
			lucideCalendar,
			lucideCheck,
			lucideListChecks,
			lucideClock,
			lucideTextCursorInput,
			lucideText,
			lucideHash,
			lucideMapPin,
			lucideCalendarCheck,
			lucideCalendarRange
		})
	],
	imports: [
		HlmSelectImports,
		BrnSelectImports,
		HlmFieldImports,
		HlmToggleGroupImports,
		HlmDialogImports,
		BrnDialogImports,
		HlmCheckbox,
		FormField,
		NgIcon,
		NgComponentOutlet,
		AsyncPipe
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: './form-field-meta-config.html',
	styleUrl: './form-field-meta-config.scss',
})
export class FormFieldMetaConfigComponent extends BaseMetaConfigComponent<FieldItemMeta> {
	protected readonly fieldItemTypes = FieldTypeSchema.options;
	protected readonly fieldItemTypesMap = {
		'boolean': { label: 'True/False', icon: 'lucideCheckSquare' },
		'date': { label: 'Date', icon: 'lucideCalendar' },
		"single-select": { label: 'Single select', icon: 'lucideCheck' },
		"multi-select": { label: 'Multi-select', icon: 'lucideListChecks' },
		'date-time': { label: 'Date-time', icon: 'lucideClock' },
		'text': { label: 'Single-line Text', icon: 'lucideTextCursorInput' },
		'multiline': { label: 'Multi-line Text', icon: 'lucideText' },
		'float': { label: 'Decimal', icon: 'lucideHash' },
		'integer': { label: 'Integer', icon: 'lucideHash' },
		'geo-point': { label: 'GPS Location', icon: 'lucideMapPin' },
		'multi-date': { label: 'Multi-date', icon: 'lucideCalendarCheck' },
		'date-range': { label: 'Date range', icon: 'lucideCalendarRange' },
	} as Record<z.infer<typeof FieldTypeSchema>, { label: string, icon: string }>;

	protected readonly fieldMetaConfigComponentsMap = {
		'boolean': import('../boolean-meta/boolean-meta.component').then(m => m.BooleanMetaComponent),
		'date-time': import('../simple-date/simple-date.component').then(m => m.SimpleDateComponent),
		'date': import('../simple-date/simple-date.component').then(m => m.SimpleDateComponent),
		'date-range': import('../range-date/range-date.component').then(m => m.RangeDateMetaComponent),
		'multi-date': import('../multi-date/multi-date.component').then(m => m.MultiDateMetaComponent),
		'text': import('../text-meta/text-meta.component').then(m => m.TextMetaComponent),
		'multiline': import('../text-meta/text-meta.component').then(m => m.TextMetaComponent),
		'single-select': import('../select-meta/select-meta.component').then(m => m.SelectMetaComponent),
		'multi-select': import('../select-meta/select-meta.component').then(m => m.SelectMetaComponent),
		'float': import('../number/number.component').then(m => m.NumberComponent),
		'integer': import('../number/number.component').then(m => m.NumberComponent),
		'geo-point': import('../geo-point/geo-point.component').then(m => m.GeoPointMetaComponent),
	} as Record<z.infer<typeof FieldTypeSchema>, Promise<typeof BaseMetaConfigComponent>>;
	protected onFieldTypeChanged(node: FieldTree<Strict<FieldItemMeta>>, newType: any) {
		const baseState = BaseFieldItemMetaSchema.parse(node().value());
		const { defaultValue: _, ...baseWithoutDefault } = baseState;
		const newState = FieldItemMetaSchema.parse({ ...baseWithoutDefault, type: newType });
		node().setControlValue(newState as any);
	}
}
