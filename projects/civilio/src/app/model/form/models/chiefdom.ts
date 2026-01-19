import { FieldKey, FormType } from "@civilio/shared";
import {
	FormModelDefinitionSchema,
	RelevanceDefinition,
	RelevancePredicateSchema,
	SectionSchema
} from "../schemas";
import { intersection } from "lodash";

const relevanceMap = {
	centerUsesOtherConnectionType: {
		dependencies: ['chefferie.form.sections.infra.fields.conn_type'],
		predicate: RelevancePredicateSchema.implement(deps => {
			return deps['chefferie.form.sections.infra.fields.conn_type'] === '6';
		})
	} as RelevanceDefinition,
	centerHasEmployees: {
		dependencies: ['chefferie.form.sections.personnel_status.general.fields.employee_count'],
		predicate: RelevancePredicateSchema.implement(deps => {
			const count = Number(deps['chefferie.form.sections.personnel_status.general.fields.employee_count']);
			return !isNaN(count) && count > 0;
		})
	} as RelevanceDefinition,
	centerUsesOtherWaterSource: {
		dependencies: ['chefferie.form.sections.infra.fields.water_sources'],
		predicate: RelevancePredicateSchema.implement(deps => {
			return intersection(['6'], [deps['chefferie.form.sections.infra.fields.water_sources']]).length > 0;
		})
	} as RelevanceDefinition,
	centerUsesWater: {
		dependencies: ['chefferie.form.sections.infra.fields.has_water_source'],
		predicate: RelevancePredicateSchema.implement(deps => {
			return deps['chefferie.form.sections.infra.fields.has_water_source'] === true;
		})
	} as RelevanceDefinition,
	centerHasOtherRecordsLocation: {
		dependencies: ['chefferie.form.sections.services.sections.general.fields.records_location'],
		predicate: RelevancePredicateSchema.implement(deps => {
			return deps['chefferie.form.sections.services.sections.general.fields.records_location'] === '3';
		})
	} as RelevanceDefinition,
	officerIsChief: {
		dependencies: ['chefferie.form.sections.services.sections.general.fields.is_chief_officer'],
		predicate: RelevancePredicateSchema.implement(deps => {
			return intersection(['1', '2'], [deps['chefferie.form.sections.services.sections.general.fields.is_chief_officer']]).length > 0
		})
	} as RelevanceDefinition
};

export const ChefferieFormDefinition = FormModelDefinitionSchema.parse({
	sections: [
		{
			id: 'chefferie.form.sections.respondent',
			fields: [
				{
					key: 'chefferie.form.sections.respondent.fields.name',
					type: 'text',
					required: true,
				},
				{
					key: 'chefferie.form.sections.respondent.fields.position',
					type: 'text',
					required: true
				},
				{
					key: 'chefferie.form.sections.respondent.fields.phone',
					type: 'text',
					pattern: "^(((\\+?237)?([62][0-9]{8}))(([,/] *)((\\+?237)?([62][0-9]{8})))*)?$"
				},
				{
					key: 'chefferie.form.sections.respondent.fields.email',
					type: 'text',
					pattern: `^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})?$`
				},
				{
					key: 'chefferie.form.sections.respondent.fields.creation_date',
					type: 'date',
					defaultToToday: true,
					max: new Date(),
					// required: true
				},
			]
		},
		{
			id: 'chefferie.form.sections.identification',
			fields: [
				{
					key: 'chefferie.form.sections.identification.fields.division',
					type: 'single-selection',
					optionsGroupKey: 'division',
					required: true
				},
				{
					key: 'chefferie.form.sections.identification.fields.municipality',
					type: 'single-selection',
					optionsGroupKey: 'commune',
					required: true,
					parent: 'chefferie.form.sections.identification.fields.division'
				},
				{
					key: 'chefferie.form.sections.identification.fields.quarter',
					type: 'text',
					required: true
				},
				{
					key: 'chefferie.form.sections.identification.fields.facility_name',
					type: 'text',
					required: true
				},
				{
					key: 'chefferie.form.sections.identification.fields.degree',
					type: 'single-selection',
					optionsGroupKey: 'vb2qk85',
					required: true
				},
				{
					key: 'chefferie.form.sections.identification.fields.cs_proximity',
					type: 'float',
					required: true,
					min: 0,
					max: 80000,
					unit: 'units.meters.short'
				},
				{
					key: 'chefferie.form.sections.identification.fields.gps_coords',
					type: 'point',
				}
			]
		},
		{
			id: 'chefferie.form.sections.services',
			fields: [
				{
					type: 'single-selection',
					optionsGroupKey: 'tr2ph17',
					key: 'chefferie.form.sections.services.sections.general.fields.is_chief_officer',
				},
				{
					relevance: relevanceMap.officerIsChief,
					type: 'boolean',
					key: 'chefferie.form.sections.services.sections.general.fields.is_oath_taken',
					// optionsGroupKey: 'hb0ui59',
					// required: true
				},
				{
					required: true,
					type: 'single-selection',
					optionsGroupKey: 'vo6qc48',
					key: 'chefferie.form.sections.services.sections.general.fields.records_location',
				},
				{
					type: 'text',
					required: true,
					relevance: relevanceMap.centerHasOtherRecordsLocation,
					key: 'chefferie.form.sections.services.sections.general.fields.other_records_location'
				},
				{
					relevance: relevanceMap.officerIsChief,
					type: 'boolean',
					key: 'chefferie.form.sections.services.sections.general.fields.officer_trained_cs',
				},
				{
					key: 'chefferie.form.sections.services.sections.general.fields.has_waiting_room',
					type: 'boolean'
				},
				{
					type: 'boolean',
					key: 'chefferie.form.sections.services.sections.general.fields.toilets_accessible'
				}
			],
			children: [
				{
					id: 'chefferie.form.sections.services.sections.equipment',
					fields: [
						...([
							'chefferie.form.sections.services.sections.equipment.fields.pc_count',
							'chefferie.form.sections.services.sections.equipment.fields.printer_count',
							'chefferie.form.sections.services.sections.equipment.fields.tablet_count',
						] as FieldKey[]).map(k => ({
							key: k,
							type: 'int',
							min: 0,
							max: 1000,
							required: true
						})),
						...([
							'chefferie.form.sections.services.sections.equipment.fields.car_count',
							'chefferie.form.sections.services.sections.equipment.fields.bike_count',
						] as FieldKey[]).map(k => ({
							key: k,
							type: 'int',
							min: 0,
							max: 100,
							required: true
						}))
					]
				}
			]
		},
		{
			id: 'chefferie.form.sections.infra',
			fields: [
				{
					key: 'chefferie.form.sections.infra.fields.is_residence',
					type: 'boolean',
				},
				{
					key: 'chefferie.form.sections.infra.fields.has_internet',
					type: 'boolean'
				},
				{
					key: 'chefferie.form.sections.infra.fields.conn_type',
					type: 'single-selection',
					optionsGroupKey: 'internet_types',
					required: true
				},
				// {
				// 	key: 'chefferie.form.sections.infra.fields.other_conn_type',
				// 	type: 'text',
				// 	required: true,
				// },
				{
					key: 'chefferie.form.sections.infra.fields.has_power',
					type: 'boolean'
				},
				{
					key: 'chefferie.form.sections.infra.fields.has_water_source',
					type: 'boolean'
				},
				{
					type: 'single-selection',
					optionsGroupKey: 'zp4ec39',
					multiple: true,
					key: 'chefferie.form.sections.infra.fields.water_sources',
					required: true,
					relevance: relevanceMap.centerUsesWater
				},
				{
					type: 'text',
					key: 'chefferie.form.sections.infra.fields.other_water_source',
					required: true,
					relevance: relevanceMap.centerUsesOtherWaterSource
				},
				{
					type: 'boolean',
					key: 'chefferie.form.sections.infra.fields.has_fire_extinguisher'
				}
			]
		},
		{
			id: 'chefferie.form.sections.personnel_status',
			fields: [
				{
					key: 'chefferie.form.sections.personnel_status.general.fields.employee_count',
					type: 'int',
					min: 0,
					max: 500,
					required: true
				},
				{
					relevance: relevanceMap.centerHasEmployees,
					key: 'chefferie.form.sections.personnel_status.employees.fields.list',
					type: 'table',
					identifierColumn: 'chefferie.form.sections.personnel_status.employees.fields.index',
					columns: {
						index: {
							visible: false,
							editable: false,
							key: 'chefferie.form.sections.personnel_status.employees.fields.index',
							type: 'number'
						},
						names: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.name',
							type: 'text',
						},
						function: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.position',
							type: 'text'
						},
						gender: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.gender',
							type: 'single-selection',
							optionGroupKey: 'xw39g10',
						},
						phone: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.phone',
							type: 'text',
						},
						ed_level: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.ed_level',
							type: 'single-selection',
							optionGroupKey: 'ta2og93',
						},
						cs_training: {
							optionGroupKey: 'vl4fn37',
							type: 'single-selection',
							key: 'chefferie.form.sections.personnel_status.employees.fields.has_cs_training'
						},
						computer_level: {
							optionGroupKey: 'nz2pr56',
							type: 'single-selection',
							key: 'chefferie.form.sections.personnel_status.employees.fields.computer_level'
						},
						age: {
							key: 'chefferie.form.sections.personnel_status.employees.fields.age',
							type: 'number',
							min: 18,
							max: 90
						}
					}
				}
			]
		},
		{
			id: 'chefferie.form.sections.comments',
			fields: [
				{
					type: 'text',
					multiline: true,
					key: 'chefferie.form.sections.comments.fields.relevant_info'
				},
				{
					type: 'text',
					required: true,
					key: 'chefferie.form.sections.comments.fields.validation_code'
				}
			]
		}
	] as SectionSchema[],
	meta: {
		form: 'chefferie' as FormType,
		label: 'chefferie.title'
	}
});
