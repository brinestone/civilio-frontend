import { FormType } from "@civilio/shared";
import { intersection, isEqual, isEqualWith } from 'lodash';
import { FormModelDefinitionSchema, RelevancePredicateSchema, SectionSchema } from "../schemas";

// #region CSC
export const CscFormDefinition = FormModelDefinitionSchema.parse({
	sections: [
		{
			// #region Respondent
			id: 'csc.form.sections.respondent',
			fields: [
				{
					key: 'csc.form.sections.respondent.fields.names',
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
		},
		// #endregion
		// #region Identification
		{
			id: 'csc.form.sections.identification',
			fields: [
				{
					key: 'csc.form.sections.identification.fields.division',
					type: 'single-selection',
					optionsGroupKey: 'division',
					required: true
				},
				{
					key: 'csc.form.sections.identification.fields.municipality',
					type: 'single-selection',
					optionsGroupKey: 'commune',
					required: true,
					parent: 'csc.form.sections.identification.fields.division'
				},
				{
					key: 'csc.form.sections.identification.fields.quarter',
					type: 'text',
					required: true,
				},
				{
					key: 'csc.form.sections.identification.fields.facility_name',
					type: 'text',
					required: true
				},
				{
					key: 'csc.form.sections.identification.fields.category',
					type: 'single-selection',
					optionsGroupKey: 'mx3gb95',
				},
				{
					key: 'csc.form.sections.identification.fields.is_chiefdom',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.category'],
						predicate: RelevancePredicateSchema.implement((deps) => {
							return deps['csc.form.sections.identification.fields.category'] === '3';
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.degree',
					type: "single-selection",
					optionsGroupKey: 'sl95o71',
					relevance: {
						dependencies: [
							'csc.form.sections.identification.fields.category',
							'csc.form.sections.identification.fields.is_chiefdom'
						],
						predicate: RelevancePredicateSchema.implement(deps => {
							const conditions = [
								['csc.form.sections.identification.fields.category', '3'],
								['csc.form.sections.identification.fields.is_chiefdom', true]
							];
							return conditions
								.map(([k, v]) => isEqual((deps as any)[k as string], v))
								.reduce((acc, curr) => acc && curr, true);
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.size',
					required: true,
					type: 'single-selection',
					optionsGroupKey: 'pq1hw83',
					relevance: {
						dependencies: [
							'csc.form.sections.identification.fields.category'
						],
						predicate: RelevancePredicateSchema.implement(deps => {
							const conditions = [
								['csc.form.sections.identification.fields.category', '1']
							];
							return conditions
								.map(([k, v]) => isEqual((deps as any)[k as string], v))
								.reduce((acc, curr) => acc && curr, true);
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.milieu',
					type: 'single-selection',
					required: true,
					optionsGroupKey: 'vb2qk85'
				},
				{
					key: 'csc.form.sections.identification.fields.attached_csc_count',
					type: 'int',
					required: true,
					min: 1,
					max: 50,
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.category'],
						predicate: RelevancePredicateSchema.implement((deps) => {
							const conditions = [
								['csc.form.sections.identification.fields.category', '1']
							];
							return conditions
								.map(([k, v]) => isEqual((deps as any)[k as string], v))
								.reduce((acc, curr) => acc && curr, true);
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.is_functional',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.identification.fields.non_function_reason',
					type: 'multi-selection',
					optionsGroupKey: 'ti6lo46',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.is_functional'],
						predicate: RelevancePredicateSchema.implement((deps) => {
							const conditions = [
								['csc.form.sections.identification.fields.is_functional', false]
							];
							return conditions
								.map(([k, v]) => isEqual((deps as any)[k as string], v))
								.reduce((acc, curr) => acc && curr, true);
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.custom_non_function_reason',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.non_function_reason'],
						predicate: RelevancePredicateSchema.implement((deps) => {
							return intersection(deps['csc.form.sections.identification.fields.non_function_reason'] as string[], ['6']).length > 0;
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.non_function_duration',
					type: 'single-selection',
					required: true,
					optionsGroupKey: 'kq18p63',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.is_functional'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.identification.fields.is_functional'] === false;
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.csc_creation_declaration',
					type: 'text',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.category'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return ['3', '4'].includes(deps['csc.form.sections.identification.fields.category'] as string);
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.is_officer_appointed',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.category'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return ['3', '4'].includes(deps['csc.form.sections.identification.fields.category'] as string);
						})
					}
				}, {
					key: 'csc.form.sections.identification.fields.officer_declaration',
					type: 'text',
					relevance: {
						dependencies: ['csc.form.sections.identification.fields.is_officer_appointed'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.identification.fields.is_officer_appointed'] === true
						})
					}
				},
				{
					key: 'csc.form.sections.identification.fields.gps_coords',
					required: true,
					type: 'point',
				}
			]
		},
		// #endregion
		// #region Accessibility
		{
			fields: [],
			id: 'csc.form.sections.accessibility',
			children: [
				{
					id: 'csc.form.sections.accessibility.sections.general',
					fields: [
						{
							key: 'csc.form.sections.accessibility.sections.general.fields.serving_roads',
							type: 'single-selection',
							optionsGroupKey: 'tr2ph17',
							required: true
						},
						{
							key: 'csc.form.sections.accessibility.sections.general.fields.has_obstacles',
							type: 'single-selection',
							optionsGroupKey: 'hb0ui59',
							required: true,
							relevance: {
								dependencies: ['csc.form.sections.accessibility.sections.general.fields.serving_roads'],
								predicate: RelevancePredicateSchema.implement(deps => {
									return deps['csc.form.sections.accessibility.sections.general.fields.serving_roads'] == '1';
								})
							}
						},
						{
							key: 'csc.form.sections.accessibility.sections.general.fields.is_road_degradable',
							type: 'boolean'
						},
						{
							key: 'csc.form.sections.accessibility.sections.general.fields.attached_villages_count',
							type: 'int',
							max: 100,
							required: true
						},
						{
							key: 'csc.form.sections.accessibility.sections.general.fields.cover_radius',
							type: 'single-selection',
							optionsGroupKey: 'da2cb00',
							required: true
						}
					]
				},
				{
					id: 'csc.form.sections.accessibility.sections.villages',
					fields: [{
						key: 'csc.form.sections.accessibility.sections.villages',
						type: 'table',
						identifierColumn: 'csc.form.sections.accessibility.sections.villages.fields.index',
						columns: {
							index: {
								key: 'csc.form.sections.accessibility.sections.villages.fields.index',
								type: 'number',
								editable: false,
							},
							name: {
								key: 'csc.form.sections.accessibility.sections.villages.fields.name',
								type: 'text',
							},
							avg_dist: {
								key: 'csc.form.sections.accessibility.sections.villages.fields.avg_dist',
								type: 'number'
							},
							observations: {
								key: 'csc.form.sections.accessibility.sections.villages.fields.obsvervations',
								type: 'text',
							}
						}
					}]
				}
			]
		},
		// #endregion
		// #region Infrastructure
		{
			id: 'csc.form.sections.infra',
			relevance: {
				dependencies: ['csc.form.sections.identification.fields.is_functional'],
				predicate: RelevancePredicateSchema.implement(deps => {
					return deps['csc.form.sections.identification.fields.is_functional'] === true;
				})
			},
			fields: [
				{
					key: 'csc.form.sections.infra.fields.status',
					type: 'single-selection',
					required: true,
					optionsGroupKey: 'stat_bat'
				},
				{
					key: 'csc.form.sections.infra.fields.other_building',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.status'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.infra.fields.status'] == '5';
						})
					}
				}, {
					key: 'csc.form.sections.infra.fields.eneo_connection',
					type: 'boolean',
				}, {
					key: 'csc.form.sections.infra.fields.has_power_outages',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.eneo_connection'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.infra.fields.eneo_connection'] == true)
					}
				}, {
					key: 'csc.form.sections.infra.fields.has_stable_power',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.eneo_connection'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.infra.fields.eneo_connection'] == true)
					}
				}, {
					key: 'csc.form.sections.infra.fields.has_backup_power',
					type: 'boolean',
				}, {
					key: 'csc.form.sections.infra.fields.backup_power_sources',
					type: 'multi-selection',
					optionsGroupKey: 'wa8hl88',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.has_backup_power'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.infra.fields.has_backup_power'] === true;
						})
					}
				}, {
					key: 'csc.form.sections.infra.fields.other_power_source',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.backup_power_sources'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return intersection(deps['csc.form.sections.infra.fields.backup_power_sources'] as string[], ['autre_precisez']).length > 0;
						})
					}
				}, {
					key: 'csc.form.sections.infra.fields.water_sources',
					type: 'multi-selection',
					required: true,
					optionsGroupKey: 'on8vp92'
				}, {
					key: 'csc.form.sections.infra.fields.toilets_available',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.infra.fields.are_toilets_separated',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.toilets_available'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return deps['csc.form.sections.infra.fields.toilets_available'] === true;
						})
					}
				},
				{
					key: 'csc.form.sections.infra.fields.has_fiber_connection',
					type: 'single-selection',
					required: true,
					optionsGroupKey: 'hy7qe58'
				}, {
					key: 'csc.form.sections.infra.fields.network_type',
					type: 'multi-selection',
					optionsGroupKey: 'hy3mz13',
					required: true
				}, {
					key: 'csc.form.sections.infra.fields.other_network_type',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.network_type'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return intersection(deps['csc.form.sections.infra.fields.network_type'] as string[], ['4']).length > 0;
						})
					}
				}, {
					key: 'csc.form.sections.infra.fields.has_internet',
					type: 'boolean'
				}, {
					key: 'csc.form.sections.infra.fields.internet_type',
					type: 'multi-selection',
					required: true,
					optionsGroupKey: 'hy3mz13',
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.has_internet'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.infra.fields.has_internet'] === true)
					}
				}, {
					key: 'csc.form.sections.infra.fields.other_internet_type',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.internet_type'],
						predicate: RelevancePredicateSchema.implement(deps => {
							return intersection(deps['csc.form.sections.infra.fields.internet_type'] as string[], ['4']).length > 0;
						})
					}
				}, {
					key: 'csc.form.sections.infra.fields.internet_sponsor',
					type: 'single-selection',
					optionsGroupKey: 'hy3mz13',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.infra.fields.has_internet'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.infra.fields.has_internet'] === true)
					}
				}
			]
		},
		// #endregion
		// #region Areas
		{
			id: 'csc.form.sections.areas',
			relevance: {
				dependencies: ['csc.form.sections.identification.fields.is_functional'],
				predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.identification.fields.is_functional'] === true)
			},
			fields: [],
			children: [
				{
					id: 'csc.form.sections.areas.sections.general',
					fields: [
						{
							key: 'csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms',
							type: 'boolean'
						}, {
							key: 'csc.form.sections.areas.sections.general.fields.moving_plans',
							type: 'boolean',
							relevance: {
								dependencies: ['csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms'],
								predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms'] === true)
							}
						}
					]
				},
				{
					fields: [
						{
							key: 'csc.form.sections.areas.sections.rooms',
							type: 'table',
							relevance: {
								dependencies: ['csc.form.sections.identification.fields.is_functional'],
								predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.identification.fields.is_functional'] === true)
							},
							identifierColumn: 'csc.form.sections.areas.sections.rooms.fields.index',
							columns: {
								index: {
									editable: false,
									type: 'number',
									key: 'csc.form.sections.areas.sections.rooms.fields.index',
								},
								number: {
									type: 'number',
									key: 'csc.form.sections.areas.sections.rooms.fields.number'
								},
								condition: {
									type: 'single-selection',
									optionGroupKey: 'hg4oe04',
									key: 'csc.form.sections.areas.sections.rooms.fields.condition'
								}
							}
						}
					]
				}
			]
		}
		//#endregion
	] as SectionSchema[],
	meta: {
		form: 'csc' as FormType
	}
});
// #endregion CSC
