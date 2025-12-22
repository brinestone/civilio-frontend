import { FieldKey, FormType } from "@civilio/shared";
import { intersection, isEqual } from 'lodash';
import {
	FormModelDefinitionSchema,
	RelevanceDefinition,
	RelevancePredicateSchema,
	SectionSchema
} from "../schemas";

const relevanceMap = {
	centerIsNotPrimaryOrSecondary: {
		dependencies: ['csc.form.sections.identification.fields.category'],
		predicate: RelevancePredicateSchema.implement(deps => !deps['csc.form.sections.identification.fields.category'] || ['3', '4'].includes(deps['csc.form.sections.identification.fields.category'] as string))
	} as RelevanceDefinition,
	centerIsPrimaryOrSecondary: {
		dependencies: ['csc.form.sections.identification.fields.category'],
		predicate: RelevancePredicateSchema.implement(deps => ['1', '2'].includes(deps['csc.form.sections.identification.fields.category'] as string))
	} as RelevanceDefinition,
	dataIndexed: {
		dependencies: ['csc.form.sections.record_indexing.fields.data_indexed'],
		predicate: RelevancePredicateSchema.implement(deps => ['1', '2'].includes(deps['csc.form.sections.record_indexing.fields.data_indexed'] as string))
	} as RelevanceDefinition,
	documentsScanned: {
		dependencies: ['csc.form.sections.record_indexing.fields.records_scanned'],
		predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.record_indexing.fields.records_scanned'] == 1)
	} as RelevanceDefinition,
	centerIsFunctional: {
		dependencies: ['csc.form.sections.identification.fields.is_functional'],
		predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.identification.fields.is_functional'] === true)
	} as RelevanceDefinition,
	centerHasCsSoftware: {
		dependencies: ['csc.form.sections.digitization.fields.has_cs_software'],
		predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.digitization.fields.has_cs_software'] === true)
	} as RelevanceDefinition
}

// #region CSC
export const CscFormDefinition = FormModelDefinitionSchema.parse({
	sections: [
		// #region Respondent
		{
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
					type: 'text',
					pattern: "^(((\\+?237)?([62][0-9]{8}))(([,/] *)((\\+?237)?([62][0-9]{8})))*)?$"
				},
				{
					key: 'csc.form.sections.respondent.fields.email',
					type: 'text',
					pattern: `^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})?$`
				},
				{
					key: 'csc.form.sections.respondent.fields.knows_creation_date',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.respondent.fields.creation_date',
					type: 'date',
					max: new Date(),
					defaultToToday: true,
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
					// required: true,
					type: 'point',
				}
			]
		},
		// #endregion


		// #region Accessibility
		{
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
					min: 0,
					required: true
				},
				{
					key: 'csc.form.sections.accessibility.sections.general.fields.cover_radius',
					type: 'single-selection',
					optionsGroupKey: 'da2cb00',
					required: true
				}
			],
			id: 'csc.form.sections.accessibility',
			children: [
				// {
				// 	id: 'csc.form.sections.accessibility.sections.general',
				// 	fields: [

				// 	]
				// },
				{
					id: 'csc.form.sections.accessibility.sections.villages',
					fields: [{
						key: 'csc.form.sections.accessibility.sections.villages.fields.list',
						type: 'table',
						identifierColumn: 'csc.form.sections.accessibility.sections.villages.fields.index',
						columns: {
							index: {
								visible: false,
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
								type: 'number',
								min: 0,
								max: 50
							},
							observations: {
								key: 'csc.form.sections.accessibility.sections.villages.fields.observations',
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
			fields: [
				{
					key: 'csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.areas.sections.general.fields.moving_plans',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.areas.sections.general.fields.dedicated_cs_rooms'] === true)
					}
				}
			],
			children: [
				// {
				// 	id: 'csc.form.sections.areas.sections.general',
				// 	fields: [

				// 	]
				// },
				{
					id: 'csc.form.sections.areas.sections.rooms',
					fields: [
						{
							key: 'csc.form.sections.areas.sections.rooms.fields.list',
							type: 'table',
							relevance: {
								dependencies: ['csc.form.sections.identification.fields.is_functional'],
								predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.identification.fields.is_functional'] === true)
							},
							identifierColumn: 'csc.form.sections.areas.sections.rooms.fields.index',
							columns: {
								index: {
									editable: false,
									visible: false,
									type: 'number',
									key: 'csc.form.sections.areas.sections.rooms.fields.index',
								},
								name: {
									type: 'text',
									key: 'csc.form.sections.areas.sections.rooms.fields.name'
								},
								condition: {
									type: 'single-selection',
									optionGroupKey: 'hg4oe04',
									key: 'csc.form.sections.areas.sections.rooms.fields.condition'
								},
								area: {
									type: 'number',
									key: 'csc.form.sections.areas.sections.rooms.fields.area',
									relevance: {
										dependencies: [
											'csc.form.sections.areas.sections.rooms.fields.condition'
										],
										predicate: RelevancePredicateSchema.implement(deps => {
											return deps['csc.form.sections.areas.sections.rooms.fields.condition'] === true;
										})
									}
								},
								renovation_nature: {
									key: 'csc.form.sections.areas.sections.rooms.fields.renovation_nature',
									type: 'multi-selection',
									optionGroupKey: 'se9tm32',
									relevance: {
										dependencies: [
											'csc.form.sections.areas.sections.rooms.fields.condition'
										],
										predicate: RelevancePredicateSchema.implement(deps => {
											return deps['csc.form.sections.areas.sections.rooms.fields.condition'] === true;
										})
									}
								}
							}
						}
					]
				}
			]
		},
		//#endregion


		// #region Equipment
		{
			id: 'csc.form.sections.equipment',
			relevance: relevanceMap.centerIsFunctional,
			fields: [
				{
					key: 'csc.form.sections.equipment.fields.pc_count',
					type: 'int',
					min: 0,
					max: 1000,
				},
				{
					key: 'csc.form.sections.equipment.fields.server_count',
					type: 'int',
					min: 0,
					max: 1000,
				},
				{
					key: 'csc.form.sections.equipment.fields.printer_count',
					type: 'int',
					min: 0,
					max: 1000,
				},
				...([
					'csc.form.sections.equipment.fields.scanner_count',
					'csc.form.sections.equipment.fields.inverter_count',
					'csc.form.sections.equipment.fields.ac_count',
					'csc.form.sections.equipment.fields.fan_count',
					'csc.form.sections.equipment.fields.projector_count',
					'csc.form.sections.equipment.fields.office_table_count',
					'csc.form.sections.equipment.fields.chair_count',
				] as FieldKey[]).map(key => ({ key, type: 'int', min: 0 })),
				{
					key: 'csc.form.sections.equipment.fields.tablet_count',
					type: 'int',
					min: 0,
					max: 1000,
				},
				{
					key: 'csc.form.sections.equipment.fields.car_count',
					type: 'int',
					min: 0,
					max: 100,
				},
				{
					key: 'csc.form.sections.equipment.fields.bike_count',
					type: 'int',
					min: 0,
					max: 100,
				}
			]
		},
		// #endregion


		// #region Digitization
		{
			id: 'csc.form.sections.digitization',
			relevance: relevanceMap.centerIsFunctional,
			fields: [
				{
					key: 'csc.form.sections.digitization.fields.external_service_from_cr',
					type: 'boolean',
				},
				{
					key: 'csc.form.sections.digitization.fields.external_cr_uses_internet',
					type: 'boolean',
					relevance: {
						dependencies: ['csc.form.sections.digitization.fields.external_service_from_cr'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.digitization.fields.external_service_from_cr'] === true)
					}
				},
				{
					key: 'csc.form.sections.digitization.fields.has_cs_software',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.digitization.fields.cs_software_name',
					type: 'text',
					required: true,
					relevance: relevanceMap.centerHasCsSoftware
				},
				{
					key: 'csc.form.sections.digitization.fields.cs_software_license_sponsor',
					required: true,
					type: 'single-selection',
					relevance: relevanceMap.centerHasCsSoftware,
					optionsGroupKey: 'pt2hk19',
				},
				{
					key: 'csc.form.sections.digitization.fields.other_cs_software_license_sponsor',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.digitization.fields.cs_software_license_sponsor'],
						predicate: RelevancePredicateSchema.implement(deps => intersection(['4'], deps['csc.form.sections.digitization.fields.cs_software_license_sponsor'] as any[] ?? []).length > 0)
					}
				},
				{
					key: 'csc.form.sections.digitization.fields.users_receive_digital_acts',
					type: 'boolean',
					relevance: relevanceMap.centerHasCsSoftware
				},
				{
					key: 'csc.form.sections.digitization.fields.software_activation_date',
					type: 'date',
					requied: true,
					relevance: relevanceMap.centerHasCsSoftware
				},
				{
					key: 'csc.form.sections.digitization.fields.software_feedback',
					type: 'single-selection',
					optionsGroupKey: 'ja3ja10',
					required: true,
					relevance: relevanceMap.centerHasCsSoftware
				},
				...([
					'csc.form.sections.digitization.fields.software_trained_user_count',
					'csc.form.sections.digitization.fields.software_recorded_births_count',
					'csc.form.sections.digitization.fields.software_recorded_marriage_count',
					'csc.form.sections.digitization.fields.software_recorded_death_count',
				] as FieldKey[]).map(k => ({
					relevance: relevanceMap.centerHasCsSoftware,
					key: k,
					required: true,
					type: 'int',
					min: 0
				})),
				{
					key: 'csc.form.sections.digitization.fields.is_software_functioning',
					type: 'boolean',
				},
				{
					key: 'csc.form.sections.digitization.fields.software_non_functioning_reason',
					type: 'text',
					relevance: {
						dependencies: ['csc.form.sections.digitization.fields.is_software_functioning'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.digitization.fields.is_software_functioning'] !== true)
					}
				}
			]
		},
		// #endregion


		// #region Record Indexing
		{
			id: 'csc.form.sections.record_indexing',
			relevance: relevanceMap.centerIsFunctional,
			fields: [
				{
					key: 'csc.form.sections.record_indexing.fields.records_scanned',
					type: 'single-selection',
					optionsGroupKey: 'jk4rp06',
					required: true
				},
				{
					key: 'csc.form.sections.record_indexing.fields.staff_trained',
					type: 'single-selection',
					optionsGroupKey: 'fv5nn38',
					required: true
				},
				{
					key: 'csc.form.sections.record_indexing.fields.document_scan_start_date',
					type: 'int',
					min: 1980,
					max: 2025,
					relevance: relevanceMap.documentsScanned,
					required: true
				},
				{
					key: 'csc.form.sections.record_indexing.fields.data_indexed',
					type: 'single-selection',
					optionsGroupKey: 'fw78n80',
					required: true,
					relevance: relevanceMap.documentsScanned
				},
				...([
					'csc.form.sections.record_indexing.fields.births_scanned',
					'csc.form.sections.record_indexing.fields.marriages_scanned',
					'csc.form.sections.record_indexing.fields.deaths_scanned',
				] as FieldKey[]).map(key => ({
					key,
					relevance: relevanceMap.documentsScanned,
					type: 'int',
					min: 0,
					required: true
				})),
				...([
					'csc.form.sections.record_indexing.fields.births_indexed',
					'csc.form.sections.record_indexing.fields.marriages_indexed',
					'csc.form.sections.record_indexing.fields.deaths_indexed'
				] as FieldKey[]).map(key => ({
					key,
					relevance: relevanceMap.dataIndexed,
					type: 'int',
					min: 0,
					required: true
				})),
				{
					key: 'csc.form.sections.record_indexing.fields.is_data_used_by_csc',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.record_indexing.fields.data_usage',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.record_indexing.fields.is_data_used_by_csc'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.record_indexing.fields.is_data_used_by_csc'] === true)
					}
				}
			]
		},
		// #endregion


		// #region Record Procurement
		{
			id: 'csc.form.sections.record_procurement',
			relevance: relevanceMap.centerIsFunctional,
			fields: [
				{
					key: 'csc.form.sections.record_procurement.fields.has_there_been_lack_off_registers',
					type: 'multi-selection',
					required: true,
					optionsGroupKey: 'tw32q01'
				},
				{
					key: 'csc.form.sections.record_procurement.fields.records_provider',
					type: 'multi-selection',
					required: true,
					optionsGroupKey: 'sl8yh95'
				},
				{
					key: 'csc.form.sections.record_procurement.fields.other_records_provider',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.record_procurement.fields.records_provider'],
						predicate: RelevancePredicateSchema.implement(deps => intersection(['4'], deps['csc.form.sections.record_procurement.fields.records_provider'] as string[]).length > 0)
					}
				},
				{
					key: 'csc.form.sections.record_procurement.fields.uses_non_compliant_reigsters',
					type: 'boolean'
				},
				...([
					'csc.form.sections.record_procurement.fields.blank_births',
					'csc.form.sections.record_procurement.fields.blank_marriages',
					'csc.form.sections.record_procurement.fields.blank_deaths'
				] as FieldKey[]).map(key => ({
					key, type: 'int', min: 0, required: true
				}))
			]
		},
		// #endregion


		// #region Financial resources
		{
			id: 'csc.form.sections.financial_stats',
			relevance: {
				dependencies: [
					'csc.form.sections.identification.fields.category',
					'csc.form.sections.identification.fields.is_functional'
				],
				predicate: RelevancePredicateSchema.implement(deps => {
					const functional = deps['csc.form.sections.identification.fields.is_functional'] === true;
					const primaryOrSecondary = intersection(['1', '2'], [deps['csc.form.sections.identification.fields.category'] as string]).length > 0;
					return functional && primaryOrSecondary;
				})
			},
			fields: [
				...([
					'csc.form.sections.financial_stats.fields.birth_cert_cost',
					'csc.form.sections.financial_stats.fields.birth_cert_copy_cost',
					'csc.form.sections.financial_stats.fields.marriage_cert_copy_cost',
					'csc.form.sections.financial_stats.fields.death_cert_copy_cost',
					'csc.form.sections.financial_stats.fields.celibacy_cert_copy_cost',
					'csc.form.sections.financial_stats.fields.non_registered_certs'
				] as FieldKey[]).map(key => ({
					key,
					type: 'int',
					min: 0,
					required: true
				})),
				{
					key: 'csc.form.sections.financial_stats.fields.rates_under_deliberation',
					type: 'boolean',
				},
				{
					key: 'csc.form.sections.financial_stats.fields.prices_displayed',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.financial_stats.fields.municipality_budget_2024',
					type: 'int',
					min: 0,
					required: true
				},
				{
					key: 'csc.form.sections.financial_stats.fields.cs_budget_2024',
					type: 'int',
					min: 0,
					required: true
				}
			]
		},
		// #endregion


		// #region Archiving Function
		{
			id: 'csc.form.sections.archiving_function',
			fields: [
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.has_archiving_room',
					type: 'boolean',
					relevance: relevanceMap.centerIsPrimaryOrSecondary
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.archive_room_electric_condition',
					type: 'single-selection',
					relevance: relevanceMap.centerIsPrimaryOrSecondary,
					optionsGroupKey: 'hv1un42',
					required: true
				},
				...([
					'csc.form.sections.archiving_function.sections.general.fields.has_fire_extinguisher',
					'csc.form.sections.archiving_function.sections.general.fields.locked_door',
					'csc.form.sections.archiving_function.sections.general.fields.is_archive_room_access_limited',
					'csc.form.sections.archiving_function.sections.general.fields.room_has_humidity'
				] as FieldKey[]).map(key => ({
					key,
					relevance: relevanceMap.centerIsPrimaryOrSecondary,
					type: 'boolean'
				})),
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.register_archiving_type',
					type: 'multi-selection',
					optionsGroupKey: 'xi0eq24',
					required: true,
					relevance: relevanceMap.centerIsPrimaryOrSecondary,
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.other_archiving_type',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.archiving_function.sections.general.fields.register_archiving_type'],
						predicate: RelevancePredicateSchema.implement(deps => intersection(['7'], deps['csc.form.sections.archiving_function.sections.general.fields.register_archiving_type'] as string[]).length > 0)
					}
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.has_written_archiving_plan',
					type: 'boolean',
					relevance: relevanceMap.centerIsPrimaryOrSecondary,
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited',
					type: 'single-selection',
					relevance: relevanceMap.centerIsPrimaryOrSecondary,
					optionsGroupKey: 'gw85g70',
					required: true
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.are_registers_deposited_systematically',
					type: 'boolean',
					relevance: relevanceMap.centerIsNotPrimaryOrSecondary
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.is_vandalized',
					type: 'boolean'
				},
				{
					key: 'csc.form.sections.archiving_function.sections.general.fields.vandalization_date',
					type: 'text',
					required: true,
					relevance: {
						dependencies: ['csc.form.sections.archiving_function.sections.general.fields.is_vandalized'],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.archiving_function.sections.general.fields.is_vandalized'] === true)
					}
				}],
			relevance: relevanceMap.centerIsFunctional,
			children: [
				// {
				// 	id: 'csc.form.sections.archiving_function.sections.general',
				// 	fields: [

				// 	]
				// },
				{
					id: 'csc.form.sections.archiving_function.sections.archive_stats',
					relevance: {
						dependencies: [
							'csc.form.sections.identification.fields.category',
							'csc.form.sections.identification.fields.is_functional'
						],
						predicate: RelevancePredicateSchema.implement(deps => deps['csc.form.sections.identification.fields.is_functional'] === true && ['1', '2'].includes(deps['csc.form.sections.identification.fields.category'] as string)),
					},
					fields: [
						{
							key: {
								value: 'csc.form.sections.archiving_function.sections.archive_stats.fields.list',
								titleArgs: {
									startYear: new Date().getFullYear() - 5,
									endYear: new Date().getFullYear(),
								}
							},
							type: 'table',
							relevance: relevanceMap.centerIsPrimaryOrSecondary,
							identifierColumn: 'csc.form.sections.archiving_function.sections.archive_stats.fields.index',
							columns: {
								index: {
									visible: false,
									key: 'csc.form.sections.archiving_function.sections.archive_stats.fields.index',
									editable: false,
									type: 'number'
								},
								year: {
									key: 'csc.form.sections.archiving_function.sections.archive_stats.fields.year',
									optionGroupKey: 'ue0vo43',
									type: 'single-selection'
								},
								birth_count: {
									key: 'csc.form.sections.archiving_function.sections.archive_stats.fields.birth_count',
									type: 'number',
								},
								marriage_count: {
									key: 'csc.form.sections.archiving_function.sections.archive_stats.fields.marriage_count',
									type: 'number'
								},
								death_count: {
									key: 'csc.form.sections.archiving_function.sections.archive_stats.fields.death_count',
									type: 'number'
								}
							}
						}
					]
				},
				{
					id: 'csc.form.sections.deeds',
					fields: [
						{
							key: 'csc.form.sections.deeds.fields.list',
							type: 'table',
							relevance: relevanceMap.centerIsFunctional,
							identifierColumn: 'csc.form.sections.deeds.fields.index',
							columns: {
								index: {
									key: 'csc.form.sections.deeds.fields.index',
									visible: false,
									editable: false,
									type: 'number',
								},
								drawn_births: {
									key: 'csc.form.sections.deeds.fields.birth_certs_drawn',
									type: 'number',
									min: 0
								},
								not_withdrawn_births: {
									key: 'csc.form.sections.deeds.fields.birth_certs_not_withdrawn',
									type: 'number',
									min: 0
								},
								drawn_marriages: {
									key: 'csc.form.sections.deeds.fields.marriage_certs_drawn',
									type: 'number',
									min: 0
								},
								not_withdrawn_marriages: {
									key: 'csc.form.sections.deeds.fields.marriage_certs_not_withdrawn',
									type: 'number',
									min: 0
								},
								drawn_deaths: {
									key: 'csc.form.sections.deeds.fields.death_certs_drawn',
									type: 'number',
									min: 0
								},
								not_withdrawn_deaths: {
									key: 'csc.form.sections.deeds.fields.death_certs_not_withdrawn',
									type: 'number',
									min: 0
								}
							}
						}
					]
				},
			]
		},
		// #endregion

		//#region Employee status
		{
			id: 'csc.form.sections.employees',
			relevance: relevanceMap.centerIsFunctional,
			fields: ([
				'csc.form.sections.employees.sections.general.fields.male_count',
				'csc.form.sections.employees.sections.general.fields.female_count',
				'csc.form.sections.employees.sections.general.fields.non_officer_male_count',
				'csc.form.sections.employees.sections.general.fields.non_officer_female_count',
			] as FieldKey[]).map(k => ({
				key: k,
				type: 'int',
				min: 0,
				max: 500,
			})),
			children: [
				{
					id: 'csc.form.sections.employees.sections.officers',
					fields: [
						{
							key: 'csc.form.sections.employees.sections.officers.fields.list',
							type: 'group',
							relevance: relevanceMap.centerIsFunctional,
							identifierKey: 'csc.form.sections.employees.sections.officers.fields.index',
							fields: [
								{
									visible: false,
									editable: false,
									type: 'int',
									key: 'csc.form.sections.employees.sections.officers.fields.index',
								},
								{
									type: 'text',
									key: 'csc.form.sections.employees.sections.officers.fields.name',
									// cssClass: 'font-bold text-lg'
								},
								{
									type: 'single-selection',
									optionsGroupKey: 'ts8cb25',
									key: 'csc.form.sections.employees.sections.officers.fields.position'
								},
								{
									type: 'text',
									key: 'csc.form.sections.employees.sections.officers.fields.other_position',
									required: true,
									relevance: {
										dependencies: ['csc.form.sections.employees.sections.officers.fields.position'],
										predicate: RelevancePredicateSchema.implement(deps => {
											return deps['csc.form.sections.employees.sections.officers.fields.position'] === '6';
										})
									}
								},
								{
									type: 'single-selection',
									key: 'csc.form.sections.employees.sections.officers.fields.prof_status',
									optionsGroupKey: 'kr15v52',
									required: true
								},
								{
									type: 'text',
									key: 'csc.form.sections.employees.sections.officers.fields.other_prof_status',
									required: true,
									relevance: {
										dependencies: ['csc.form.sections.employees.sections.officers.fields.prof_status'],
										predicate: RelevancePredicateSchema.implement(deps => {
											return deps['csc.form.sections.employees.sections.officers.fields.prof_status'] === '5';
										})
									}
								},
								{
									type: 'single-selection',
									optionsGroupKey: 'xw39g10',
									key: 'csc.form.sections.employees.sections.officers.fields.gender'
								},
								{
									type: 'text',
									key: 'csc.form.sections.employees.sections.officers.fields.phone',
									pattern: "^(((\\+?237)?([62][0-9]{8}))(([,/] *)((\\+?237)?([62][0-9]{8})))*)?$"
								},
								{
									type: 'int',
									min: 18,
									max: 90,
									key: 'csc.form.sections.employees.sections.officers.fields.age',
									required: true
								},
								{
									type: 'text',
									pattern: '^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})?$',
									key: 'csc.form.sections.employees.sections.officers.fields.email'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.ed_level',
									type: 'single-selection',
									optionsGroupKey: 'ta2og93'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.computer_level',
									type: 'single-selection',
									optionsGroupKey: 'nz2pr56'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.ec_training',
									type: 'boolean'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.archive_training',
									type: 'boolean'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.computer_training',
									type: 'boolean'
								},
								{
									key: 'csc.form.sections.employees.sections.officers.fields.cs_seniority',
									type: 'int',
									min: 1
								},
								{
									key: {
										value: 'csc.form.sections.employees.sections.officers.fields.monthly_salary',
										titleArgs: {
											lastYear: new Date().getFullYear() - 1
										}
									},
									type: 'int',
									min: 0
								}
							]
						}
					]
				}
			]
		},
		//#endregion

		//#region Extras
		{
			id: 'csc.form.sections.extra',
			fields: [
				{
					type: 'text',
					multiline: true,
					key: 'csc.form.sections.extra.fields.relevant_info'
				},
				{
					key: 'csc.form.sections.extra.fields.validation_code',
					required: true,
					type: 'text',
					validValues: [
						'BA101M', 'BA151M', 'BA201M', 'BA251M', 'BA301M', 'BA351M',
						'BA401M', 'BA451M', 'BA501M', 'BA551M', 'BA601M', 'BA651M',
						'BA701M', 'BA751M', 'BA801M',
						'ND102D', 'ND152D', 'ND202D', 'ND252D', 'ND302D', 'ND352D',
						'ND402D', 'ND452D', 'ND502D', 'ND552D', 'ND602D', 'ND652D',
						'ND702D', 'ND752D', 'ND802D',
						'NO403G', 'NO453G', 'NO503G', 'NO553G', 'NO603G', 'NO653G',
						'NO703G', 'NO753G', 'NO803G',
						'NO103G', 'NO153G', 'NO203G', 'NO253G', 'NO303G', 'NO353G',
						'ME107S', 'ME157S', 'ME207S', 'ME257S', 'ME307S', 'ME357S',
						'ME407S', 'ME457S', 'ME507S', 'ME557S', 'ME607S', 'ME657S',
						'ME707S', 'ME757S', 'ME807S'
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
