import { Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AppAbility } from '@app/adapters/casl';
import { UserService } from '@app/services/user.service';
import { AbilityServiceSignal } from '@casl/angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideAsteriskSquare, lucideAtSign, lucideLock, lucidePencil, lucideTrash2, lucideUser, lucideUserPen, lucideX } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmRadio, HlmRadioGroupImports } from '@spartan-ng/helm/radio-group';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmH4 } from "@spartan-ng/helm/typography";

@Component({
	selector: 'cv-user',
	viewProviders: [
		provideIcons({
			lucidePencil,
			lucideUserPen,
			lucideTrash2,
			lucideX,
			lucideLock,
			lucideAsteriskSquare
		})
	],
	imports: [
		HlmRadioGroupImports,
		FormsModule,
		HlmRadio,
		HlmH4,
		NgIcon,
		HlmBadge,
		TranslatePipe,
		HlmFieldImports,
		HlmInput,
		HlmInputGroupImports,
		HlmSkeleton,
		HlmButton
	],
	templateUrl: './user.page.html',
	styleUrl: './user.page.scss',
})
export class UserPage {
	readonly username = input.required<string>({ alias: 'id' });
	readonly editing = signal(true);

	private readonly userService = inject(UserService);

	protected roles = [
		{ name: 'user', label: 'roles.user.title', description: 'roles.user.description' },
		{ name: 'maintainer', label: 'roles.maintainer.title', description: 'roles.maintainer.description' },
		{ name: 'admin', label: 'roles.admin.title', description: 'roles.admin.description' },
	];
	protected abs = inject<AbilityServiceSignal<AppAbility>>(AbilityServiceSignal);
	protected user = rxResource({
		params: () => this.username(),
		stream: ({ params: username }) => {
			return this.userService.findUserByUsername(username);
		}
	});
}
