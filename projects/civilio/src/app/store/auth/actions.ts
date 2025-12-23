const prefix = '[auth]';

export class LoginUser {
	static type = `${prefix} login user`;
	constructor(readonly username: string, readonly password: string) { }
}
