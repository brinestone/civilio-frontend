import { Injectable } from "@angular/core";
import { UserPrincipal } from "@civilio/shared";
import { State, StateContext, StateToken } from "@ngxs/store";

type AuthStateModel = {
	principal?: UserPrincipal;
};
export const AUTH_STATE = new StateToken<AuthStateModel>('auth');
type Context = StateContext<AuthStateModel>;

@Injectable()
@State({
	name: AUTH_STATE,
	defaults: {
	}
})
export class AuthState {

}
