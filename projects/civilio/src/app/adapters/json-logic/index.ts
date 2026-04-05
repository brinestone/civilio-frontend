import { Injectable } from "@angular/core";
import { validate } from "@angular/forms/signals";
import { LogicEngine } from "json-logic-engine";

@Injectable({ providedIn: null })
export class JsonLogic {
	private engine = new LogicEngine();

	constructor() {
		// Add custom regex operator for the 'match' operator in your schema
		this.engine.addMethod("regexp", ([val, pattern]) => {
			try {
				return new RegExp(pattern).test(String(val));
			} catch {
				return false;
			}
		});
		this.engine.addMethod("empty", ([val]) => {
			return (
				val === undefined ||
				(typeof val === "string" && val.trim() === "") ||
				(Array.isArray(val) && val.length === 0) ||
				val === null
			);
		});
		this.engine.addMethod("startsWith", ([val, prefix]) => {
			return (val as string | null | undefined)?.startsWith(prefix) ?? false;
		});
		this.engine.addMethod("endsWith", ([val, suffix]) => {
			return (val as string | null | undefined)?.endsWith(suffix) ?? false;
		});
	}

	evaluate(logic: any, data: Record<string, any>): boolean {
		return !!this.engine.run(logic, data);
	}
}
