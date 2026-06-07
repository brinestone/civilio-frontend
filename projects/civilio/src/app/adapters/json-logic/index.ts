import { Injectable } from "@angular/core";
import { LogicEngine } from "json-logic-engine";

@Injectable({ providedIn: null })
export class JsonLogic extends LogicEngine {

	constructor() {
		super();
		this.addMethod('regexp', ([val, pattern]) => {
			try {
				return new RegExp(pattern).test(String(val));
			} catch {
				return false;
			}
		});
		this.addMethod('empty', ([val]) => {
			return val === undefined || typeof val === 'string' && val.trim() === '' || Array.isArray(val) && val.length === 0 || val === null;
		});
		this.addMethod('startsWith', ([val, prefix]) => {
			return (val as string | null | undefined)?.startsWith(prefix) ?? false;
		})
		this.addMethod('endsWith', ([val, suffix]) => {
			return (val as string | null | undefined)?.endsWith(suffix) ?? false;
		})
	}
}
