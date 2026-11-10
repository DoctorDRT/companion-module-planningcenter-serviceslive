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
	placeholder: 0x5b6472,
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

/* A variable's value, or a placeholder when it is blank (no plan running, nobody scheduled...) */
const orElse = (variable, placeholder) => expr(`${v(variable)} ? ${v(variable)} : '${placeholder}'`)
const colorWhenSet = (variable, color = COLORS.text) => expr(`${v(variable)} ? ${color} : ${COLORS.placeholder}`)

/*
 * An information card: a small label that always shows, and the value underneath.
 * Before a plan is running the value shows a dim placeholder instead of an empty button.
 */
const infoCard = (category, name, keywords, label, variable, placeholder, valueProps = {}, extra = {}) => ({
	type: 'layered',
	category: category,
	name: name,
	keywords: keywords,
	elements: [
		background(),
		text('label', 'Label', label, { x: 4, y: 6, width: 92, height: 20 }, { color: COLORS.muted }),
		text(
			'value',
			'Value',
			orElse(variable, placeholder),
			{ x: 4, y: 28, width: 92, height: 66 },
			{ color: colorWhenSet(variable), ...valueProps },
		),
		...(extra.elements || []),
	],
	steps: steps([]),
	feedbacks: extra.feedbacks || [],
})

const overrunBackground = {
	feedbackId: 'item_overrun',
	options: {},
	styleOverrides: [{ elementId: 'background', elementProperty: 'color', override: COLORS.darkRed }],
}

/* A round status badge for the top right corner: green check, amber question mark or red X */
const statusBadge = (statusVar) => {
	const status = v(statusVar)
	const circle = (id, color) => ({
		type: 'circle',
		id: id,
		name: 'Badge',
		x: 72,
		y: 4,
		width: 24,
		height: 24,
		color: color,
	})
	const line = (id, fromX, fromY, toX, toY) => ({
		type: 'line',
		id: id,
		name: 'Mark',
		fromX: fromX,
		fromY: fromY,
		toX: toX,
		toY: toY,
		borderWidth: 3.5,
		borderColor: COLORS.text,
	})
	return [
		{
			type: 'group',
			id: 'confirmed',
			name: 'Confirmed Badge',
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			enabled: expr(`${status} == 'Confirmed'`),
			children: [
				circle('confirmedCircle', COLORS.green),
				line('check1', 77.5, 16.5, 82, 21),
				line('check2', 82, 21, 90.5, 11),
			],
		},
		{
			type: 'group',
			id: 'unconfirmed',
			name: 'Unconfirmed Badge',
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			enabled: expr(`${status} == 'Unconfirmed'`),
			children: [
				circle('unconfirmedCircle', COLORS.amber),
				text(
					'question',
					'Question Mark',
					'?',
					{ x: 72, y: 5, width: 24, height: 22 },
					{ color: COLORS.background, weight: 'bold' },
				),
			],
		},
		{
			type: 'group',
			id: 'declined',
			name: 'Declined Badge',
			x: 0,
			y: 0,
			width: 100,
			height: 100,
			enabled: expr(`${status} == 'Declined'`),
			children: [circle('declinedCircle', COLORS.red), line('x1', 79, 11, 89, 21), line('x2', 89, 11, 79, 21)],
		},
	]
}

/* A scheduled position: the position name, the person, and their status badge */
const positionCard = (category, name, variablePrefix, number) => ({
	type: 'layered',
	category: category,
	name: name,
	keywords: ['scheduled', 'people', 'position', 'team', 'status', 'confirmed'],
	elements: [
		background(),
		text(
			'position',
			'Position Name',
			orElse(`${variablePrefix}_position`, `Position ${number}`),
			{ x: 4, y: 5, width: 66, height: 24 },
			{ color: COLORS.muted, halign: 'left' },
		),
		text(
			'person',
			'Person',
			orElse(variablePrefix, 'Nobody scheduled'),
			{ x: 4, y: 32, width: 92, height: 62 },
			{ color: colorWhenSet(variablePrefix), weight: 'bold' },
		),
		...statusBadge(`${variablePrefix}_status`),
	],
	steps: steps([]),
	feedbacks: [],
})

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

	/* ---- Current Item / Next Item information cards ---- */
	const current = 'Current Item'
	const next = 'Next Item'
	const index = v('plan_index')
	const total = v('plan_length')
	presets.plan_index = {
		type: 'layered',
		category: current,
		name: 'Item Number in Plan (Item 3 of 12)',
		keywords: ['index', 'position', 'item', 'of', 'progress'],
		elements: [
			background(),
			text('label', 'Label', 'ITEM', { x: 4, y: 6, width: 92, height: 20 }, { color: COLORS.muted }),
			text(
				'value',
				'Item Number',
				expr(`(${index} ? ${index} : '#') + ' of ' + (${total} ? ${total} : '#')`),
				{ x: 4, y: 28, width: 92, height: 46 },
				{ weight: 'bold', color: colorWhenSet('plan_index') },
			),
			{
				type: 'gauge',
				id: 'progress',
				name: 'Progress Bar',
				x: 6,
				y: 80,
				width: 88,
				height: 10,
				orientation: 'horizontal',
				value: expr(`${index} ? ${index} : 0`),
				min: 0,
				max: expr(`${total} > 0 ? ${total} : 1`),
				fillEnabled: true,
				trackStyle: 'dimmed',
				trackAmount: 33,
				roundedEnds: true,
				stops: [{ value: 0, color: COLORS.amber, gradient: false }],
			},
		],
		steps: steps([]),
		feedbacks: [],
	}
	presets.currentitem = infoCard(
		current,
		'Current Item',
		['current', 'now', 'item'],
		'NOW',
		'plan_currentitem',
		'No plan running',
	)
	presets.currentitem_time_length = infoCard(
		current,
		'Current Item Length',
		['length', 'duration'],
		'LENGTH',
		'plan_currentitem_time_length',
		'--:--',
	)
	presets.currentitem_time_started = infoCard(
		current,
		'Current Item Started At',
		['started', 'time'],
		'STARTED',
		'plan_currentitem_time_started',
		'--:--',
	)
	presets.current_item_time_remaining = infoCard(
		current,
		'Current Item Time Remaining',
		['remaining', 'countdown', 'timer'],
		'REMAINING',
		'plan_currentitem_time_remaining',
		'--:--',
		{
			weight: 'bold',
			color: expr(
				`${v('plan_currentitem_time_remaining')} ? (${v('plan_currentitem_time_remaining_seconds')} < 0 ? ${COLORS.red} : ${v('plan_currentitem_time_remaining_seconds')} < 60 ? ${COLORS.amber} : ${COLORS.text}) : ${COLORS.placeholder}`,
			),
		},
		{ feedbacks: [overrunBackground] },
	)
	presets.currentitem_time_shouldfinish = infoCard(
		current,
		'Current Item Should End At',
		['finish', 'end', 'time'],
		'ENDS AT',
		'plan_currentitem_time_shouldfinish',
		'--:--',
		{},
		{ feedbacks: [overrunBackground] },
	)
	presets.currentitem_key = infoCard(current, 'Current Item Key', ['key', 'song'], 'KEY', 'plan_currentitem_key', '—', {
		weight: 'bold',
	})

	presets.nextitem = {
		...infoCard(
			next,
			'Next Item (press to go to it)',
			['next', 'item', 'advance'],
			'NEXT',
			'plan_nextitem',
			'No plan running',
		),
		steps: steps([{ actionId: 'nextitem_followed', options: {} }]),
	}

	/* ---- Plan Control: move the plan being followed ---- */
	presets.go_next = {
		type: 'layered',
		category: 'Plan Control',
		name: 'Go to Next Item',
		keywords: ['next', 'advance', 'go', 'item'],
		elements: [
			background(COLORS.green),
			text('action', 'Action', 'GO NEXT', { x: 4, y: 6, width: 92, height: 26 }, { weight: 'bold' }),
			text('next', 'Next Item', orElse('plan_nextitem', 'No plan running'), { x: 4, y: 36, width: 92, height: 58 }),
		],
		steps: steps([{ actionId: 'nextitem_followed', options: {} }]),
		feedbacks: [],
	}
	presets.go_previous = {
		type: 'layered',
		category: 'Plan Control',
		name: 'Go to Previous Item',
		keywords: ['previous', 'back', 'item'],
		elements: [
			background(COLORS.panel),
			text('action', 'Action', 'PREVIOUS', { x: 4, y: 18, width: 92, height: 32 }, { weight: 'bold' }),
			text('label', 'Label', 'ITEM', { x: 4, y: 54, width: 92, height: 26 }, { color: COLORS.muted }),
		],
		steps: steps([{ actionId: 'previousitem_followed', options: {} }]),
		feedbacks: [],
	}
	presets.nextitem_time_length = infoCard(
		next,
		'Next Item Length',
		['next', 'length'],
		'NEXT LENGTH',
		'plan_nextitem_time_length',
		'--:--',
	)
	presets.nextitem_key = infoCard(
		next,
		'Next Item Key',
		['next', 'key', 'song'],
		'NEXT KEY',
		'plan_nextitem_key',
		'—',
		{ weight: 'bold' },
	)

	/* ---- Scheduled People: position, person and status ---- */
	for (let i = 1; i <= 50; i++) {
		presets[`scheduled_position_${i}`] = positionCard('Scheduled People', `Position ${i}`, `scheduled_position_${i}`, i)
	}
	for (let team of self.getScheduledTeams()) {
		for (let i = 1; i <= 30; i++) {
			presets[`scheduled_${team.id}_position_${i}`] = positionCard(
				`Scheduled People - ${team.label}`,
				`${team.label}: Position ${i}`,
				`scheduled_${team.id}_position_${i}`,
				i,
			)
		}
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
