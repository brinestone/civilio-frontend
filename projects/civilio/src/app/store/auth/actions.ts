const prefix = '[auth]';

export class UserAdded {
	static type = `${prefix} user added`;
}

export class UserDeleted {
	static type = `${prefix} user deleted`;
	constructor(readonly username: string){}
}

export class Logout {
	static type = `${prefix} logout`
}

export class ReSignIn {
	static type = `${prefix} re-signin`
	constructor(readonly username: string, readonly password: string) { }
}

export class LoginUser {
	static type = `${prefix} login user`;
	constructor(readonly username: string, readonly password: string) { }
}

export class LoggedOut {
	static type = `${prefix} logged out`;
	constructor(readonly clearCredentials?: boolean) { }
}
