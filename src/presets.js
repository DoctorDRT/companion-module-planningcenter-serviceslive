import { combineRgb } from '@companion-module/base'

import png64 from './png64.js'
import { getLayeredPresets } from './presets-layered.js'

async function generateImages(count) {
	const imagePromises = Array.from({ length: count }, (_, i) => {
		return png64[i + 1]
	})

	const images = await Promise.all(imagePromises)
	return images
}

export default {
	/* The teams on the plan being followed (empty when nobody is scheduled) */
	getScheduledTeams() {
		return (this.CHOICES_TEAMS || []).filter((team) => team.id && team.id !== 'scheduled_no_teams')
	},

	async initPresets() {
		let self = this
		let presets = {}

		const white = combineRgb(255, 255, 255)
		const black = combineRgb(0, 0, 0)
		const v = (variable) => `$(services-live:${variable})`

		/*
		 * Current Item and Next Item. Each button always shows a label, so it reads sensibly before a plan is running.
		 * These simple versions are the fallback for the layered designs in presets-layered.js (same ids).
		 */
		const infoPreset = (category, name, label, variable, feedbacks = []) => ({
			type: 'button',
			category: category,
			name: name,
			style: { text: `${label}\\n${v(variable)}`, size: 'auto', color: white, bgcolor: black },
			steps: [{ down: [], up: [] }],
			feedbacks: feedbacks,
		})
		const overrun = [
			{ feedbackId: 'item_overrun', options: {}, style: { color: white, bgcolor: combineRgb(210, 34, 45) } },
		]

		presets.plan_index = {
			type: 'button',
			category: 'Current Item',
			name: 'Item Number in Plan (Item 3 of 12)',
			style: {
				text: `'Item: ' + (${v('plan_index')} ? ${v('plan_index')} : '#') + ' of ' + (${v('plan_length')} ? ${v('plan_length')} : '#')`,
				textExpression: true,
				size: 'auto',
				color: white,
				bgcolor: black,
			},
			steps: [{ down: [], up: [] }],
			feedbacks: [],
		}
		presets.currentitem = infoPreset('Current Item', 'Current Item', 'NOW', 'plan_currentitem')
		presets.currentitem_time_length = infoPreset(
			'Current Item',
			'Current Item Length',
			'LENGTH',
			'plan_currentitem_time_length',
		)
		presets.currentitem_time_started = infoPreset(
			'Current Item',
			'Current Item Started At',
			'STARTED',
			'plan_currentitem_time_started',
		)
		presets.current_item_time_remaining = infoPreset(
			'Current Item',
			'Current Item Time Remaining',
			'REMAINING',
			'plan_currentitem_time_remaining',
			overrun,
		)
		presets.currentitem_time_shouldfinish = infoPreset(
			'Current Item',
			'Current Item Should End At',
			'ENDS AT',
			'plan_currentitem_time_shouldfinish',
			overrun,
		)
		presets.currentitem_key = infoPreset('Current Item', 'Current Item Key', 'KEY', 'plan_currentitem_key')

		presets.nextitem = infoPreset('Next Item', 'Next Item', 'NEXT', 'plan_nextitem')
		presets.nextitem_time_length = infoPreset(
			'Next Item',
			'Next Item Length',
			'NEXT LENGTH',
			'plan_nextitem_time_length',
		)
		presets.nextitem_key = infoPreset('Next Item', 'Next Item Key', 'NEXT KEY', 'plan_nextitem_key')

		/*
		 * Scheduled People, for the plan being followed.
		 * "Position and Person" buttons show the position, the person and a status badge (layered design in
		 * presets-layered.js, with this simple version as the fallback). "Photo with Status" uses the photo feedbacks.
		 * Generic buttons count every scheduled position in order; team buttons count within one team.
		 */
		const statusColors = { C: combineRgb(31, 166, 74), U: combineRgb(230, 160, 0), D: combineRgb(210, 34, 45) }
		const PRESET_NUMBERS = await generateImages(50)

		const scheduledGroup = (category, count, prefix, idPrefix, nameStatusFeedback, photoFeedback, extraOptions) => {
			presets[`${idPrefix}_header_person`] = {
				type: 'text',
				category: category,
				name: 'Position and Person',
				text: 'The position name, who is scheduled, and a badge for their status (check = confirmed, ? = unconfirmed, X = declined).',
			}
			for (let i = 1; i <= count; i++) {
				presets[`${idPrefix}_${i}`] = {
					type: 'button',
					category: category,
					name: `${prefix}Position ${i}`,
					style: {
						text: `${v(`${idPrefix}_${i}_position`)}\\n${v(`${idPrefix}_${i}`)}`,
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [{ down: [], up: [] }],
					feedbacks: ['C', 'U', 'D'].map((status) => ({
						feedbackId: nameStatusFeedback,
						options: { ...extraOptions, positionNumber: i, status: status },
						style: { color: white, bgcolor: statusColors[status] },
					})),
				}
			}

			presets[`${idPrefix}_header_photo`] = {
				type: 'text',
				category: category,
				name: 'Photo with Status',
				text: 'The photo of the person scheduled to that position, with a status bar along the bottom.',
			}
			for (let i = 1; i <= count; i++) {
				presets[`${idPrefix}_photo_${i}`] = {
					type: 'button',
					category: category,
					name: `${prefix}Position ${i} Photo`,
					style: {
						text: '',
						png64: PRESET_NUMBERS[i - 1],
						pngalignment: 'center:center',
						size: 'auto',
						color: white,
						bgcolor: black,
					},
					steps: [{ down: [], up: [] }],
					feedbacks: [
						{
							feedbackId: photoFeedback,
							options: {
								...extraOptions,
								positionNumber: i,
								borderType: 'bottom',
								borderWidth: 25,
								borderOpacity: 255,
							},
							style: { color: white, bgcolor: black },
						},
					],
				}
			}
		}

		scheduledGroup(
			'Scheduled People',
			50,
			'',
			'scheduled_position',
			'showPersonStatusByPositionNumber',
			'showPersonPhotoPositionNumberWithStatus',
			{},
		)

		for (let team of self.getScheduledTeams()) {
			scheduledGroup(
				`Scheduled People - ${team.label}`,
				30,
				`${team.label}: `,
				`scheduled_${team.id}_position`,
				'showPersonStatusPositionNumberByTeam',
				'showPersonPhotoPositionNumberByTeamWithStatus',
				{ team: team.id },
			)
		}

		/* Plan Picker presets */
		const pickerCategory = 'Plan Picker'
		const pickerAmber = combineRgb(255, 191, 0)
		const pickerGreen = combineRgb(0, 153, 51)

		presets.picker_header_specific = {
			type: 'text',
			category: pickerCategory,
			name: 'Specific Service Types',
			text: 'Each button always selects the same service type, whatever slot it is in.',
		}
		const hiddenServiceTypes = self.parsePickerIdList(self.config?.picker_servicetype_hide)
		for (let i = 0; i < self.currentState.internal.services_list.length; i++) {
			let service = self.currentState.internal.services_list[i]
			if (!service.id || hiddenServiceTypes.includes(`${service.id}`)) {
				continue
			}
			presets[`picker_servicetype_${service.id}`] = {
				type: 'button',
				category: pickerCategory,
				name: `Load ${service.label}`,
				style: {
					text: service.label,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [
							{
								actionId: 'picker_select_servicetype',
								options: { mode: 'specific', slot: 1, servicetypeid: service.id },
							},
						],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'picker_servicetype_selected',
						options: { mode: 'specific', slot: 1, servicetypeid: service.id },
						style: { color: combineRgb(0, 0, 0), bgcolor: pickerAmber },
					},
				],
			}
		}

		presets.picker_header_folders = {
			type: 'text',
			category: pickerCategory,
			name: 'Folders',
			text: 'Fill the service type slots from a folder. The amber button is the folder that is loaded.',
		}
		presets.picker_load_servicetypes = {
			type: 'button',
			category: pickerCategory,
			name: 'Load Service Types from Folder',
			style: {
				text: 'LOAD\\n$(services-live:picker_folder_name)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'picker_load_servicetypes', options: { folderid: '' } }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'picker_folder_loaded',
					options: { folderid: '' },
					style: { color: combineRgb(0, 0, 0), bgcolor: pickerAmber },
				},
			],
		}

		//one Load button per PCO folder, plus one for every service type
		const folderPresets = [{ id: '0', name: 'All Service Types' }, ...(self.pickerFolders || [])]
		for (let folder of folderPresets) {
			presets[`picker_load_folder_${folder.id}`] = {
				type: 'button',
				category: pickerCategory,
				name: `Load Folder: ${folder.name}`,
				style: {
					text: folder.name,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [{ actionId: 'picker_load_servicetypes', options: { folderid: folder.id } }],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'picker_folder_loaded',
						options: { folderid: folder.id },
						style: { color: combineRgb(0, 0, 0), bgcolor: pickerAmber },
					},
				],
			}
		}

		presets.picker_header_slots = {
			type: 'text',
			category: pickerCategory,
			name: 'Service Type Slots',
			text: 'Slot buttons show whichever service type is in that slot.',
		}
		for (let i = 1; i <= self.getPickerServiceTypeSlotCount(); i++) {
			presets[`picker_servicetype_slot_${i}`] = {
				type: 'button',
				category: pickerCategory,
				name: `Select Service Type ${i}`,
				style: {
					text: `$(services-live:picker_servicetype_${i}_name)`,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [{ actionId: 'picker_select_servicetype', options: { mode: 'slot', slot: i, servicetypeid: '' } }],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'picker_servicetype_slot_empty',
						options: { slot: i },
						style: { color: combineRgb(80, 80, 80), bgcolor: combineRgb(0, 0, 0) },
					},
					{
						feedbackId: 'picker_servicetype_selected',
						options: { mode: 'slot', slot: i, servicetypeid: '' },
						style: { color: combineRgb(0, 0, 0), bgcolor: pickerAmber },
					},
				],
			}
		}

		presets.picker_header_plans = {
			type: 'text',
			category: pickerCategory,
			name: 'Upcoming Plans',
			text: 'Plan 1 is the soonest. The amber border shows the selected plan.',
		}
		for (let i = 1; i <= self.getPickerSlotCount(); i++) {
			presets[`picker_plan_${i}`] = {
				type: 'button',
				category: pickerCategory,
				name: `Select Plan ${i}`,
				style: {
					text: `$(services-live:picker_plan_${i}_short_dates)\\n$(services-live:picker_plan_${i}_name)`,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [{ actionId: 'picker_select_plan', options: { slot: i } }],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'picker_slot_empty',
						options: { slot: i },
						style: { color: combineRgb(80, 80, 80), bgcolor: combineRgb(0, 0, 0) },
					},
					{
						feedbackId: 'picker_plan_selected',
						options: { slot: i },
						style: { color: combineRgb(0, 0, 0), bgcolor: pickerAmber },
					},
					{
						feedbackId: 'picker_plan_controlled',
						options: { slot: i },
						style: { color: combineRgb(255, 255, 255), bgcolor: pickerGreen },
					},
				],
			}
		}

		presets.picker_header_control = {
			type: 'text',
			category: pickerCategory,
			name: 'Control',
			text: 'Take or release control of the selected plan.',
		}
		presets.picker_take_control = {
			type: 'button',
			category: pickerCategory,
			name: 'Take Control of Selected Plan',
			style: {
				text: 'TAKE CONTROL\\n$(services-live:picker_selected_plan_short_dates)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(102, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'picker_take_control', options: {} }],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'picker_plan_controlled',
					options: { slot: 0 },
					style: { color: combineRgb(255, 255, 255), bgcolor: pickerGreen },
				},
			],
		}

		presets.picker_release_control = {
			type: 'button',
			category: pickerCategory,
			name: 'Release Control of Selected Plan',
			style: {
				text: 'RELEASE\\n$(services-live:picker_selected_plan_short_dates)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [{ actionId: 'picker_release_control', options: {} }],
					up: [],
				},
			],
			feedbacks: [],
		}

		const { structure, definitions } = toV2Presets(presets, getLayeredPresets(self))
		this.setPresetDefinitions(structure, definitions)
	},
}

const SECTION_ORDER = ['Plan Picker', 'Current Item', 'Next Item', 'Scheduled People']

const slug = (str) =>
	`${str}`
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '_')
		.replace(/^_|_$/g, '')

/* Converts the presets built above (v1 style, with a category on each) to a v2 simple preset */
function toSimplePreset(preset) {
	let style = { ...preset.style }
	if (typeof style.text === 'string') {
		style.text = style.text.replace(/\\n/g, '\n') //v1 presets used a literal \n for a new line
	}
	return {
		type: 'simple',
		name: preset.name || preset.label || '',
		style: style,
		steps: preset.steps || [{ down: [], up: [] }],
		feedbacks: (preset.feedbacks || []).map((feedback) => ({
			feedbackId: feedback.feedbackId,
			options: feedback.options || {},
			...(feedback.style ? { style: feedback.style } : {}),
		})),
	}
}

/*
 * Builds the v2 preset structure: one section per category, and a group inside it for each 'text' header.
 * Layered designs replace the simple preset with the same id as a pair of alternatives (layered first),
 * so Companion versions that can't draw layered buttons still get the simple one.
 */
function toV2Presets(presets, layeredPresets) {
	let definitions = {}
	let sections = new Map() //category -> { groups: [{ name, description, presets: [] }] }

	const getSection = (category) => {
		if (!sections.has(category)) {
			sections.set(category, { groups: [{ name: category, description: undefined, presets: [] }] })
		}
		return sections.get(category)
	}

	const add = (id, preset) => {
		let category = preset.category || 'General'
		let section = getSection(category)
		let layered = layeredPresets[id]

		if (layered) {
			let { category: _ignored, ...layeredDefinition } = layered
			definitions[id] = { type: 'alternatives', variants: [layeredDefinition, toSimplePreset(preset)] }
		} else {
			definitions[id] = toSimplePreset(preset)
		}
		section.groups[section.groups.length - 1].presets.push(id)
	}

	Object.keys(presets).forEach((key) => {
		let preset = presets[key]
		if (!preset) return

		if (preset.type === 'text') {
			//a header: start a new group in this section
			getSection(preset.category).groups.push({ name: preset.name, description: preset.text, presets: [] })
			return
		}

		let id = /^\d+$/.test(key) ? `preset_${key}` : key
		add(id, preset)
	})

	//layered designs that have no simple preset counterpart
	Object.keys(layeredPresets).forEach((id) => {
		if (definitions[id]) return
		let { category, ...layeredDefinition } = layeredPresets[id]
		definitions[id] = layeredDefinition
		let section = getSection(category || 'Plan Picker')
		section.groups[0].presets.push(id)
	})

	let categories = Array.from(sections.keys()).sort((a, b) => {
		let ia = SECTION_ORDER.indexOf(a)
		let ib = SECTION_ORDER.indexOf(b)
		return (ia === -1 ? SECTION_ORDER.length : ia) - (ib === -1 ? SECTION_ORDER.length : ib)
	})

	let structure = categories.map((category) => {
		let groups = sections.get(category).groups.filter((group) => group.presets.length > 0)
		let sectionId = slug(category)
		if (groups.length === 1 && groups[0].name === category) {
			return { id: sectionId, name: category, definitions: groups[0].presets }
		}
		return {
			id: sectionId,
			name: category,
			definitions: groups.map((group, index) => ({
				id: `${sectionId}_${index}_${slug(group.name)}`,
				type: 'simple',
				name: group.name,
				...(group.description ? { description: group.description } : {}),
				presets: group.presets,
			})),
		}
	})

	return { structure, definitions }
}
