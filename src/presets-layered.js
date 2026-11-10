/*
 * Layered (element based) button designs for Companion v5+.
 *
 * Each design is offered as an "alternative" next to the simple preset with the same id, so Companion
 * shows the layered button where it can and falls back to the simple one where it can't.
 *
 * Element positions and sizes are percentages of the button (0-100).
 */

const CONNECTION = 'services-live'
const v = (variable) => `$(${CONNECTION}:${variable})`
const expr = (value) => ({ isExpression: true, value: value })

export const COLORS = {
	background: 0x14181f,
	panel: 0x232a35,
	text: 0xffffff,
	muted: 0x9aa4b2,
	dim: 0x3c4450,
	amber: 0xffbf00,
	green: 0x1fa64a,
	red: 0xd2222d,
	darkRed: 0x5a0f14,
}

/* The button background. With a selectedVar, its border turns into a thick amber frame when selected */
const background = (color = COLORS.background, selectedVar = undefined) => ({
	type: 'box',
	id: 'background',
	name: 'Background',
	x: 0,
	y: 0,
	width: 100,
	height: 100,
	color: color,
	...(selectedVar
		? {
				borderWidth: expr(`$(local:${selectedVar}) ? 8 : 2`),
				borderColor: expr(`$(local:${selectedVar}) ? ${COLORS.amber} : ${COLORS.dim}`),
				borderPosition: 'inside',
			}
		: {}),
})

const text = (id, name, value, bounds, props = {}) => ({
	type: 'text',
	id: id,
	name: name,
	...bounds,
	text: value,
	fontsize: 100,
	fontsizeAllowShrink: true,
	color: COLORS.text,
	halign: 'center',
	valign: 'center',
	...props,
})

/* Fades everything when a slot has nothing loaded */
const emptyOpacity = (emptyVar) => expr(`$(local:${emptyVar}) ? 25 : 100`)

const steps = (down) => [{ down: down, up: [] }]

export function getLayeredPresets(self) {
	let presets = {}

	/* ---- Plan Picker: load service types from folder ---- */
	presets.picker_load_servicetypes = {
		type: 'layered',
		name: 'Load Service Types from Folder',
		keywords: ['folder', 'service type', 'picker', 'load'],
		elements: [
			background(COLORS.panel),
			text('label', 'Label', 'LOAD FOLDER', { x: 4, y: 6, width: 92, height: 18 }, { color: COLORS.muted }),
			text('folder', 'Folder Name', v('picker_folder_name'), { x: 4, y: 26, width: 92, height: 44 }),
			text(
				'count',
				'Service Type Count',
				expr(`${v('picker_servicetype_count')} + ' service types'`),
				{ x: 4, y: 74, width: 92, height: 18 },
				{ color: COLORS.muted },
			),
		],
		steps: steps([{ actionId: 'picker_load_servicetypes', options: { folderid: '' } }]),
		feedbacks: [],
	}

	/* ---- Plan Picker: service type slots ---- */
	for (let i = 1; i <= self.getPickerServiceTypeSlotCount(); i++) {
		presets[`picker_servicetype_slot_${i}`] = {
			type: 'layered',
			name: `Select Service Type ${i}`,
			keywords: ['service type', 'picker', 'select', 'folder'],
			localVariables: [
				{
					variableType: 'feedback',
					variableName: 'selected',
					feedbackId: 'picker_servicetype_selected',
					options: { mode: 'slot', slot: i, servicetypeid: '' },
				},
				{
					variableType: 'feedback',
					variableName: 'empty',
					feedbackId: 'picker_servicetype_slot_empty',
					options: { slot: i },
				},
			],
			elements: [
				background(COLORS.background, 'selected'),
				{
					type: 'group',
					id: 'content',
					name: 'Content',
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					opacity: emptyOpacity('empty'),
					children: [
						text(
							'slot',
							'Slot Number',
							`SERVICE TYPE ${i}`,
							{ x: 6, y: 6, width: 88, height: 16 },
							{ color: expr(`$(local:selected) ? ${COLORS.amber} : ${COLORS.muted}`) },
						),
						text('name', 'Service Type Name', v(`picker_servicetype_${i}_name`), {
							x: 6,
							y: 24,
							width: 88,
							height: 70,
						}),
					],
				},
			],
			steps: steps([{ actionId: 'picker_select_servicetype', options: { mode: 'slot', slot: i, servicetypeid: '' } }]),
			feedbacks: [],
		}
	}

	/* ---- Plan Picker: plan slots ---- */
	for (let i = 1; i <= self.getPickerSlotCount(); i++) {
		presets[`picker_plan_${i}`] = {
			type: 'layered',
			name: `Select Plan ${i}`,
			keywords: ['plan', 'picker', 'select', 'date'],
			localVariables: [
				{
					variableType: 'feedback',
					variableName: 'selected',
					feedbackId: 'picker_plan_selected',
					options: { slot: i },
				},
				{
					variableType: 'feedback',
					variableName: 'controlled',
					feedbackId: 'picker_plan_controlled',
					options: { slot: i },
				},
				{
					variableType: 'feedback',
					variableName: 'empty',
					feedbackId: 'picker_slot_empty',
					options: { slot: i },
				},
			],
			elements: [
				background(COLORS.background, 'selected'),
				{
					type: 'group',
					id: 'content',
					name: 'Content',
					x: 0,
					y: 0,
					width: 100,
					height: 100,
					opacity: emptyOpacity('empty'),
					children: [
						text('date', 'Date', v(`picker_plan_${i}_short_dates`), { x: 6, y: 6, width: 88, height: 34 }),
						text('name', 'Plan Name', v(`picker_plan_${i}_name`), { x: 6, y: 42, width: 88, height: 24 }),
						text(
							'times',
							'Service Times',
							v(`picker_plan_${i}_times`),
							{ x: 6, y: 66, width: 88, height: 16 },
							{ color: COLORS.muted },
						),
						{
							type: 'box',
							id: 'live',
							name: 'Live Badge',
							x: 0,
							y: 84,
							width: 100,
							height: 16,
							color: COLORS.green,
							enabled: expr('$(local:controlled)'),
						},
						text(
							'liveText',
							'Live Badge Text',
							'IN CONTROL',
							{ x: 0, y: 84, width: 100, height: 16 },
							{ enabled: expr('$(local:controlled)'), weight: 'bold' },
						),
					],
				},
			],
			steps: steps([{ actionId: 'picker_select_plan', options: { slot: i } }]),
			feedbacks: [],
		}
	}

	/* ---- Plan Picker: take / release control ---- */
	presets.picker_take_control = {
		type: 'layered',
		name: 'Take Control of Selected Plan',
		keywords: ['take control', 'plan', 'picker', 'live'],
		localVariables: [
			{
				variableType: 'feedback',
				variableName: 'controlled',
				feedbackId: 'picker_plan_controlled',
				options: { slot: 0 },
			},
		],
		elements: [
			background(),
			{
				type: 'box',
				id: 'fill',
				name: 'Fill',
				x: 0,
				y: 0,
				width: 100,
				height: 100,
				color: expr(`$(local:controlled) ? ${COLORS.green} : ${COLORS.darkRed}`),
				cornerRadius: 0,
			},
			text(
				'action',
				'Action',
				expr(`$(local:controlled) ? 'IN CONTROL' : 'TAKE CONTROL'`),
				{ x: 4, y: 6, width: 92, height: 26 },
				{ weight: 'bold' },
			),
			text('date', 'Selected Plan Date', v('picker_selected_plan_short_dates'), {
				x: 4,
				y: 36,
				width: 92,
				height: 32,
			}),
			text('name', 'Selected Plan Name', v('picker_selected_plan_name'), { x: 4, y: 70, width: 92, height: 24 }),
		],
		steps: steps([{ actionId: 'picker_take_control', options: {} }]),
		feedbacks: [],
	}

	presets.picker_release_control = {
		type: 'layered',
		name: 'Release Control of Selected Plan',
		keywords: ['release control', 'plan', 'picker'],
		elements: [
			background(COLORS.panel),
			text('action', 'Action', 'RELEASE', { x: 4, y: 10, width: 92, height: 30 }, { weight: 'bold' }),
			text(
				'date',
				'Selected Plan Date',
				v('picker_selected_plan_short_dates'),
				{ x: 4, y: 46, width: 92, height: 26 },
				{ color: COLORS.muted },
			),
			text(
				'name',
				'Selected Plan Name',
				v('picker_selected_plan_name'),
				{ x: 4, y: 74, width: 92, height: 20 },
				{ color: COLORS.muted },
			),
		],
		steps: steps([{ actionId: 'picker_release_control', options: {} }]),
		feedbacks: [],
	}

	/* ---- Current item countdown with a gauge ---- */
	const remaining = v('plan_currentitem_time_remaining_seconds')
	const length = v('plan_currentitem_time_length_seconds')
	presets.current_item_countdown = {
		type: 'layered',
		category: 'Current Item',
		name: 'Current Item Countdown (gauge)',
		keywords: ['countdown', 'time remaining', 'timer', 'gauge', 'current item'],
		elements: [
			background(),
			text('title', 'Current Item', v('plan_currentitem'), { x: 4, y: 4, width: 92, height: 26 }),
			text(
				'remaining',
				'Time Remaining',
				v('plan_currentitem_time_remaining'),
				{ x: 4, y: 32, width: 92, height: 40 },
				{
					weight: 'bold',
					color: expr(`${remaining} < 0 ? ${COLORS.red} : ${remaining} < 60 ? ${COLORS.amber} : ${COLORS.text}`),
				},
			),
			{
				type: 'gauge',
				id: 'progress',
				name: 'Time Remaining Bar',
				x: 6,
				y: 80,
				width: 88,
				height: 12,
				orientation: 'horizontal',
				value: expr(`${remaining} < 0 ? 0 : ${remaining}`),
				min: 0,
				max: expr(`${length} > 0 ? ${length} : 1`),
				fillEnabled: true,
				trackStyle: 'dimmed',
				trackAmount: 33,
				roundedEnds: true,
				stops: [
					{
						value: 0,
						color: expr(`${remaining} < 60 ? ${COLORS.amber} : ${COLORS.green}`),
						gradient: false,
					},
				],
			},
		],
		steps: steps([]),
		feedbacks: [
			{
				feedbackId: 'item_overrun',
				options: {},
				styleOverrides: [{ elementId: 'background', elementProperty: 'color', override: COLORS.darkRed }],
			},
		],
	}

	return presets
}
