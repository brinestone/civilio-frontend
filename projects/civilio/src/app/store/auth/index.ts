import { inject, Injectable } from "@angular/core";
import { AppAbility } from "@app/adapters/casl";
import { AuthService } from "@app/services/auth.service";
import { AbilityBuilder, createMongoAbility, PureAbility } from "@casl/ability";
import { UserPrincipal } from "@civilio/shared";
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
		ctx.dispatch(new Navigate(['/']));
	}

	@Action(LoginUser, { cancelUncompleted: true })
	onLoginUser(ctx: Context, req: LoginUser) {
		return this.authService.loginUser(req).pipe(
			tap(principal => ctx.setState(patch({
				principal
			}))),
			concatMap(() => this.authService.saveCredentials(req.username, req.password))
		);
	}

	private populatePermissions(user: UserPrincipal) {
		const { can, rules } = new AbilityBuilder(() => createMongoAbility<AppAbility>());
		if (user.isAdmin) {
			can('manage', 'all');
		} else {
			can('create', 'Submission');
			can('update', 'Submission');
			can('delete', 'Submission');
			can('read', 'Submission');
		}
		this.ability.update(rules);
	}
}
