import { Component, computed, inject, model } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { InitialsPipe } from '@app/pipes';
import { UserService } from '@app/services/user.service';
import { UserAdded, UserDeleted } from '@app/store/auth';
import { principal } from '@app/store/selectors';
import { PureAbility } from '@casl/ability';
import { AbilityServiceSignal } from '@casl/angular';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideUser, lucideUserPlus } from '@ng-icons/lucide';
import { TranslatePipe } from '@ngx-translate/core';
import { Actions, ofActionDispatched, select } from '@ngxs/store';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmEmptyImports } from '@spartan-ng/helm/empty';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSeparator } from '@spartan-ng/helm/separator';
import { HlmH3 } from "@spartan-ng/helm/typography";

@Component({
	selector: 'cv-users',
	viewProviders: [
		provideIcons({
			lucideUserPlus,
			lucideUser,
			lucideSearch
		})
	],
	imports: [
		HlmH3,
		HlmButton,
		HlmSeparator,
		RouterLink,
		RouterOutlet,
		RouterLinkActive,
		TranslatePipe,
		HlmBadge,
		HlmInput,
		FormsModule,
		HlmInputGroupImports,
		InitialsPipe,
		HlmEmptyImports,
		HlmAvatarImports,
		NgIcon
	],
	templateUrl: './users.page.html',
	styleUrl: './users.page.scss',
})
export class UsersPage {
	private userService = inject(UserService);
	protected route = inject(ActivatedRoute);
	protected principal = select(principal);
	protected userInputFilter = model<string>();
	protected abs = inject<AbilityServiceSignal<PureAbility>>(AbilityServiceSignal);
	protected readonly users = rxResource({
		defaultValue: [],
		stream: () => {
			return this.userService.getAllUsers();
		}
	});
	private readonly searchIndexes = computed(() => {
		return (this.users.value() ?? []).map((u, i) => [i, [...(new Set<string>([u.fullName, u.role, u.username]))].join('#').toLowerCase()] as [number, string])
	})
	protected readonly filteredUsers = computed(() => {
		const filter = this.userInputFilter()?.trim();
		const indexes = this.searchIndexes();
		const users = this.users.value()
		if (!filter || indexes.length == 0) return users;
		return indexes.filter(([i, index]) => index.includes(filter.toLowerCase())).map(([i]) => users[i]);
	});
	constructor(actions: Actions) {
		actions.pipe(
			takeUntilDestroyed(),
			ofActionDispatched(UserDeleted, UserAdded)
		).subscribe(() => this.users.reload())
	}
}
