import {
	ChangeDetectionStrategy,
	Component
} from "@angular/core";
import {
	HasPendingChanges
} from "@app/model/form";
import { provideIcons } from "@ng-icons/core";
import {
	Observable
} from "rxjs";

@Component({
	selector: "cv-form-page",
	viewProviders: [
		provideIcons({
		}),
	],
	imports: [

	],
	changeDetection: ChangeDetectionStrategy.OnPush,
	templateUrl: "./form.page.html",
	styleUrl: "./form.page.scss",
})
export class FormPage
	implements HasPendingChanges {


	hasPendingChanges(): boolean | Promise<boolean> | Observable<boolean> {
		return false;
	}
}
