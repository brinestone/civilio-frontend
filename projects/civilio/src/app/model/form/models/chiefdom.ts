import { FormType } from "@civilio/shared";
import { FormModelDefinitionSchema } from "../schemas";

export const ChefferieFormDefinition = FormModelDefinitionSchema.parse({
	sections: [],
	meta: {
		form: 'chefferie' as FormType
	}
});
