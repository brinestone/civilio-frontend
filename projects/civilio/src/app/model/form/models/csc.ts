import { FormType } from "@civilio/shared";
import { FormModelDefinitionSchema, RelevancePredicateSchema, SectionSchema } from "../schemas";

// #region CSC
export const CscFormDefinition = FormModelDefinitionSchema.parse({
	sections: [
		{
			id: 'csc.form.sections.respondent',
			fields: [
				{
					key: 'fosa.form.sections.respondent.fields.names',
					required: true,
					type: 'text',
				},
				{
					key: 'csc.form.sections.respondent.fields.position',
					required: true,
					type: 'text'
				},
				{
					key: 'csc.form.sections.respondent.fields.phone',
					type: 'text'
				},
				{
					key: 'csc.form.sections.respondent.fields.email',
					type: 'text'
				},
				{
					key: 'csc.form.sections.respondent.fields.knows_creation_date',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.respondent.fields.creation_date',
					type: 'date',
					max: new Date(),
					required: true,
					relevance: {
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.respondent.fields.knows_creation_date'] === true;
						}),
						dependencies: ['csc.form.sections.respondent.fields.knows_creation_date']
					}
				}
			]
		}
	] as SectionSchema[],
	meta: {
		form: 'csc' as FormType
	}
});
// #endregion CSC
