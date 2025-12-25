import { makeEnvironmentProviders } from "@angular/core";
import { createMongoAbility, PureAbility, Subject } from '@casl/ability';
import { FormSubmission, UserInfo } from "@civilio/shared";

type DataSubjects = Subject | FormSubmission | 'Submission';
type DataActions = 'create' | 'read' | 'update' | 'delete' | 'manage' | 'approve';
type UserActions = 'update' | 'create' | 'remove' | 'change-password' | 'read' | 'delete' | 'manage';

export type DataAbility = [DataActions, DataSubjects];
export type UserAbility = [UserActions, UserInfo | 'User' | 'all'];
export type AppAction = DataActions | UserActions;
export type AppSubject = DataSubjects | UserInfo | 'User' | 'all'
export type AppAbility = PureAbility<DataAbility | UserAbility>;

export function provideCasl() {
	return makeEnvironmentProviders([
		{
			provide: PureAbility, multi: false, useValue: createMongoAbility([], {
				detectSubjectType: (subject) => {
					if (typeof subject === 'string') {
						return subject;
					}

					return subject.__caslType;
				}
			})
		}
	])
}
