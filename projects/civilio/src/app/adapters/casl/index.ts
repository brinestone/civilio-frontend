import { makeEnvironmentProviders } from "@angular/core";
import { Ability, createMongoAbility, PureAbility, Subject } from '@casl/ability';
import { UserInfo } from "@civilio/shared";

type DataSubjects = Subject | 'Submission';
type DataActions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve';
type UserActions = 'create' | 'remove' | 'change-password' | 'read' | 'delete' | 'manage';

export type DataAbility = [DataActions, DataSubjects];
export type UserAbility = [UserActions, UserInfo | 'User' | 'all'];
export type AppAction = DataActions | UserActions;
export type AppSubject = DataSubjects | UserInfo | 'User' | 'all'
export type AppAbility = Ability<DataAbility | UserAbility>;

export function provideCasl() {
	return makeEnvironmentProviders([
		{ provide: PureAbility, useValue: createMongoAbility() }
	])
}
