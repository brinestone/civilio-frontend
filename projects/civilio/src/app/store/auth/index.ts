import { inject, Injectable } from "@angular/core";
import { AppAbility, DataAbility, UserAbility } from "@app/adapters/casl";
import { AuthService } from "@app/services/auth.service";
import { AbilityBuilder, createMongoAbility, PureAbility } from "@casl/ability";
import { FormSubmissionSchema, UserInfoSchema, UserPrincipal } from "@civilio/shared";
import { Navigate } from "@ngxs/router-plugin";
import { Action, NgxsOnInit, State, StateContext } from "@ngxs/store";
import { patch } from "@ngxs/store/operators";
import { concatMap, tap } from "rxjs";
import { AUTH_STATE, AuthStateModel } from "../models";
import { LoggedOut, LoginUser, Logout } from "./actions";

export * from './actions';

type Context = StateContext<AuthStateModel>;

@Injectable()
@State({
	name: AUTH_STATE,
	defaults: {
		credentialsSaved: false
	}
})
export class AuthState implements NgxsOnInit {
	private authService = inject(AuthService);
	private ability = inject(PureAbility);

	constructor() {
		const currentUser = this.authService.getMe();
		if (!currentUser) {
			this.ability.update([]);
		} else {
			this.populatePermissions(currentUser);
			// ctx.setState(patch({
			// 	principal: currentUser
			// }))
		}
	}

	ngxsOnInit(ctx: Context) {
		const currentUser = this.authService.getMe();
		if (!currentUser) {
			this.ability.update([]);
		} else {
			this.populatePermissions(currentUser);
			ctx.setState(patch({
				principal: currentUser
			}))
		}
	}

	@Action(Logout)
	async onLogout(ctx: Context) {
		await this.authService.logout();
		ctx.dispatch(new LoggedOut(true));
	}

	@Action(LoggedOut)
	async onLoggedOut(ctx: Context, action: LoggedOut) {
		if (action.clearCredentials) {
			await this.authService.clearSavedCredentials();
		}
		ctx.setState(patch({
			principal: undefined
		}))
		this.ability.update([]);
		// ctx.dispatch(new Navigate(['/'], undefined, { onSameUrlNavigation: 'ignore' }));
		location.href = '/';
	}

	@Action(LoginUser, { cancelUncompleted: true })
	onLoginUser(ctx: Context, req: LoginUser) {
		return this.authService.loginUser(req).pipe(
			tap(principal => ctx.setState(patch({
				principal
			}))),
			tap((principal) => this.populatePermissions(principal)),
			concatMap(() => this.authService.saveCredentials(req.username, req.password))
		);
	}

	private populatePermissions(user: UserPrincipal) {
		const { can, rules, cannot } = new AbilityBuilder(() => createMongoAbility<DataAbility | UserAbility>());
		can('read', 'Submission');
		can('read', 'User');
		if (user.isAdmin) {
			can('create', 'Submission');
			can('update', 'Submission');
			can('delete', 'Submission');
			can('read', 'Submission');
			can('approve', 'Submission');
			can('create', 'User');
			can('update', 'User');
			can('delete', 'User');
			can('read', 'User');
			can('change-password', 'User');
			cannot('update', 'User', {
				isAdmin: true,
				username: { $ne: user.username }
			});
			cannot('change-password', 'User', {
				isAdmin: true,
				username: { $ne: user.username }
			});
			cannot('delete', 'User', {
				isAdmin: true,
				username: { $ne: user.username }
			});
		} else if (user.role.includes('maintainer')) {
			can('create', 'Submission');
			can('update', 'Submission');
			can('delete', 'Submission');
			can('approve', 'Submission');
		}
		this.ability.update(rules);
	}
}
