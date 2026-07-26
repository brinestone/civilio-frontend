import { AsyncPipe, NgComponentOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FieldTree, FormField } from "@angular/forms/signals";
import { FieldError } from "@app/components/form/field-error/field-error.component";
import { Strict } from "@civilio/shared";
import { QuestionConfig } from "@db/schemas";
import { NgIcon, provideIcons } from "@ng-icons/core";
import {
	lucideAtSign,
	lucideCalendar,
	lucideCalendarCheck,
	lucideCalendarRange,
	lucideCheck,
	lucideCheckSquare,
	lucideClock,
	lucideHash,
	lucideListChecks,
	lucideMapPin,
	lucidePhone,
	lucideText,
	lucideTextCursorInput,
} from "@ng-icons/lucide";
import { BrnDialogImports } from "@spartan-ng/brain/dialog";
import { BrnSelectImports } from "@spartan-ng/brain/select";
import { HlmCheckbox } from "@spartan-ng/helm/checkbox";
import { HlmDialogImports } from "@spartan-ng/helm/dialog";
import { HlmFieldImports } from "@spartan-ng/helm/field";
import { HlmInput } from "@spartan-ng/helm/input";
import { HlmSelectImports } from "@spartan-ng/helm/select";
import { HlmToggleGroupImports } from "@spartan-ng/helm/toggle-group";
import { BaseFieldConfig } from "../base-meta-config/base-meta-config.component";

@Component({
	selector: "cv-form-field-config",
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
			lucideCalendarRange,
			lucideAtSign,
			lucidePhone
		}),
	],
	imports: [
		HlmSelectImports,
		BrnSelectImports,
		HlmFieldImports,
		HlmInput,
		HlmToggleGroupImports,
		HlmDialogImports,
		BrnDialogImports,
		HlmCheckbox,
		FormField,
		FieldError,
		NgIcon,
		NgComponentOutlet,
		AsyncPipe,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form-field-config.html",
	styleUrl: "./form-field-config.scss",
})
export class FormFieldConfig extends BaseFieldConfig<QuestionConfig> {
	protected readonly fieldItemTypesMap = {
		boolean: { label: "True/False", icon: "lucideCheckSquare" },
		date: { label: "Date", icon: "lucideCalendar" },
		"single-select": { label: "Single select", icon: "lucideCheck" },
		"multi-select": { label: "Multi-select", icon: "lucideListChecks" },
		"date-time": { label: "Date-time", icon: "lucideClock" },
		text: { label: "Single-line Text", icon: "lucideTextCursorInput" },
		multiline: { label: "Multi-line Text", icon: "lucideText" },
		float: { label: "Decimal", icon: "lucideHash" },
		integer: { label: "Integer", icon: "lucideHash" },
		"geo-point": { label: "GPS Location", icon: "lucideMapPin" },
		"multi-date": { label: "Multi-date", icon: "lucideCalendarCheck" },
		"date-range": { label: "Date range", icon: "lucideCalendarRange" },
		"phone": { label: "Phone number", icon: "lucidePhone" },
		"email": { label: "Email address", icon: "lucideAtSign" },
	} as Record<string | QuestionConfig['type'], { label: string; icon: string }>;
	protected readonly fieldItemTypes = Object.keys(this.fieldItemTypesMap);

	protected readonly fieldMetaConfigComponentsMap = {
		boolean: import("../boolean-meta/boolean-meta.component").then(
			(m) => m.BooleanMetaComponent,
		),
		"date-time": import("../simple-date/simple-date.component").then(
			(m) => m.SimpleDateComponent,
		),
		date: import("../simple-date/simple-date.component").then(
			(m) => m.SimpleDateComponent,
		),
		"date-range": import("../range-date/range-date.component").then(
			(m) => m.RangeDateMetaComponent,
		),
		"multi-date": import("../multi-date/multi-date.component").then(
			(m) => m.MultiDateMetaComponent,
		),
		text: import("../text-meta/text-meta.component").then(
			(m) => m.TextMetaComponent,
		),
		multiline: import("../text-meta/text-meta.component").then(
			(m) => m.TextMetaComponent,
		),
		"single-select": import("../select-meta/select-meta.component").then(
			(m) => m.SelectMetaComponent,
		),
		"multi-select": import("../multi-select/multi-select").then(
			(m) => m.MultiSelectMeta,
		),
		float: import("../number/number.component").then((m) => m.NumberComponent),
		integer: import("../number/number.component").then(
			(m) => m.NumberComponent,
		),
		email: import('../text-meta/text-meta.component').then(m => m.TextMetaComponent),
		phone: import('../text-meta/text-meta.component').then(m => m.TextMetaComponent),
		"geo-point": import("../geo-point/geo-point.component").then(
			(m) => m.GeoPointMetaComponent,
		),
	} as Record<string, Promise<typeof BaseFieldConfig>>;
	protected onFieldTypeChanged<T extends QuestionConfig>(
		node: FieldTree<Strict<T>>,
		newType: any,
	) {
		const baseState = QuestionConfig.parse(node().value());
		const { defaultValue: _, ...baseWithoutDefault } = baseState;
		const newState = QuestionConfig.parse({
			...baseWithoutDefault,
			type: newType,
		});
		node().value.set(newState as any);
	}
}
