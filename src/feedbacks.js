import { combineRgb } from '@companion-module/base'

import { graphics } from 'companion-module-utils'

async function personPhoto(person, returnStatus, options) {
	if (person && person.photo) {
		//return the png64 of the person
		let png64 = person.photo

		try {
			if (returnStatus) {
				let status = person.status //C, U, D

				const photoBuffer = await graphics.parseBase64(png64, { alpha: true })

				//create the status overlay
				let statusColor = combineRgb(0, 255, 0) // Green
				if (status === 'U') {
					statusColor = combineRgb(255, 255, 0) // Yellow
				}
				if (status === 'D') {
					statusColor = combineRgb(255, 0, 0) // Red
				}

				const statusBorder = graphics.border({
					width: 224,
					height: 224,
					color: statusColor,
					size: options.borderWidth,
					opacity: options.borderOpacity,
					type: options.borderType,
					customWidth: 72,
					customHeight: 72,
				})

				//now stack them
				const stackedBuffer = graphics.stackImage([photoBuffer, statusBorder])

				//convert buffer back to png64
				const png64_new = graphics.toPNG64({ image: stackedBuffer, width: 224, height: 224 })

				return {
					png64: png64_new,
				}
			} else {
				return {
					png64: png64,
				}
			}
		} catch (error) {
			//this helper runs outside the module instance, so there is no `self.log` here
			console.log('Error building feedback: ' + error)
			console.log(error)
			console.log('person', person)
		}
	}
	//if no person found return the default image
	//console.log('no person found')
	let defaultImage = ''

	return {
		png64: defaultImage,
	}
}

export default {
	initFeedbacks() {
		let self = this
		const feedbacks = {}

		const colorWhite = combineRgb(255, 255, 255) // White
		const colorRed = combineRgb(255, 0, 0) // Red

		feedbacks.item_overrun = {
			type: 'boolean',
			name: 'Plan Item Time Overrun',
			description: 'Change colors based on if the current Plan Item Time has overrun',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [],
			callback: async function (feedback) {
				let timeRemaining = self.currentState.dynamicVariables['plan_currentitem_time_remaining_seconds']

				if (timeRemaining < 0) {
					return true
				}

				return false
			},
		}

		feedbacks.showPersonStatus = {
			name: 'Show Person Status',
			type: 'boolean',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Person',
					id: 'person',
					default: self.CHOICES_POSITIONS[0].id,
					choices: self.CHOICES_POSITIONS,
				},
				{
					type: 'dropdown',
					label: 'Status',
					id: 'status',
					default: 'C',
					choices: [
						{ id: 'C', label: 'Confirmed' },
						{ id: 'U', label: 'Unconfirmed' },
						{ id: 'D', label: 'Declined' },
					],
				},
			],
			callback: async (feedback) => {
				const personId = feedback.options.person
				const status = feedback.options.status
				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.id === personId)
				if (person) {
					//check if the person status matches the feedback status
					if (person.status === status) {
						return true
					}
				}
				return false
			},
		}

		feedbacks.showPersonPhotoPositionName = {
			name: 'Show Person Photo based on Position Name',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'dropdown',
					label: 'Position',
					id: 'position',
					default: self.CHOICES_POSITIONS[0].id,
					choices: self.CHOICES_POSITIONS,
				},
			],
			callback: async (feedback) => {
				const position = feedback.options.position

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.id === position)

				return await personPhoto(person, false, feedback.options)
			},
		}

		feedbacks.showPersonPhotoPositionNumber = {
			name: 'Show Person Photo based on Position Number',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
			],
			callback: async (feedback) => {
				const positionNumber = feedback.options.positionNumber

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople[positionNumber - 1]

				return await personPhoto(person, false, feedback.options)
			},
		}

		feedbacks.showPersonPhotoPositionNameWithStatus = {
			name: 'Show Person Photo based on Position Name (With Status)',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'dropdown',
					label: 'Position',
					id: 'position',
					default: self.CHOICES_POSITIONS[0].id,
					choices: self.CHOICES_POSITIONS,
				},
				{
					type: 'dropdown',
					label: 'Border Type',
					id: 'borderType',
					default: 'border',
					choices: [
						{ id: 'border', label: 'Border' },
						{ id: 'top', label: 'Top' },
						{ id: 'bottom', label: 'Bottom' },
						{ id: 'right', label: 'Right' },
						{ id: 'left', label: 'Left' },
					],
				},
				{
					type: 'number',
					label: 'Border Width',
					id: 'borderWidth',
					default: 5,
					min: 0,
					max: 50,
				},
				{
					type: 'number',
					label: 'Border Opacity',
					id: 'borderOpacity',
					default: 255,
					min: 0,
					max: 255,
				},
			],
			callback: async (feedback) => {
				const position = feedback.options.position

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople.find((p) => p.id === position)

				return await personPhoto(person, true, feedback.options)
			},
		}

		feedbacks.showPersonPhotoPositionNumberWithStatus = {
			name: 'Show Person Photo based on Position Number (With Status)',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
				{
					type: 'dropdown',
					label: 'Border Type',
					id: 'borderType',
					default: 'border',
					choices: [
						{ id: 'border', label: 'Border' },
						{ id: 'top', label: 'Top' },
						{ id: 'bottom', label: 'Bottom' },
						{ id: 'right', label: 'Right' },
						{ id: 'left', label: 'Left' },
					],
				},
				{
					type: 'number',
					label: 'Border Width',
					id: 'borderWidth',
					default: 5,
					min: 0,
					max: 25,
				},
				{
					type: 'number',
					label: 'Border Opacity',
					id: 'borderOpacity',
					default: 255,
					min: 0,
					max: 255,
				},
			],
			callback: async (feedback) => {
				const positionNumber = feedback.options.positionNumber

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople[positionNumber - 1]

				return await personPhoto(person, true, feedback.options)
			},
		}

		feedbacks.showPersonStatusByPositionNumber = {
			name: 'Show Person Status based on Position Number',
			type: 'boolean',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
				{
					type: 'dropdown',
					label: 'Status',
					id: 'status',
					default: 'C',
					choices: [
						{ id: 'C', label: 'Confirmed' },
						{ id: 'U', label: 'Unconfirmed' },
						{ id: 'D', label: 'Declined' },
					],
				},
			],
			callback: async (feedback) => {
				const positionNumber = feedback.options.positionNumber
				const status = feedback.options.status

				//find the person in the scheduledPeople array
				const person = self.scheduledPeople[positionNumber - 1]
				if (person) {
					//check if the person status matches the feedback status
					if (person.status === status) {
						return true
					}
				}
				return false
			},
		}

		feedbacks.showPersonPhotoPositionNumberByTeam = {
			name: 'Show Person Photo based on Position Number by Team',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'dropdown',
					label: 'Team',
					id: 'team',
					default: self.CHOICES_TEAMS[0].id,
					choices: self.CHOICES_TEAMS,
				},
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
			],
			callback: async (feedback) => {
				const team = feedback.options.team
				const positionNumber = feedback.options.positionNumber

				//find the person in the scheduledPeople array
				let person = undefined

				//find the person in the scheduledPeople array, filtered by team and then use position number as index
				const people = self.scheduledPeople.filter((p) => p.teamNameId === team)
				if (people.length > 0) {
					person = people[positionNumber - 1]
				}

				return await personPhoto(person, false, feedback.options)
			},
		}

		feedbacks.showPersonPhotoPositionNumberByTeamWithStatus = {
			name: 'Show Person Photo based on Position Number by Team (With Status)',
			type: 'advanced',
			affectedProperties: ['png64'],
			options: [
				{
					type: 'dropdown',
					label: 'Team',
					id: 'team',
					default: self.CHOICES_TEAMS[0].id,
					choices: self.CHOICES_TEAMS,
				},
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
				{
					type: 'dropdown',
					label: 'Border Type',
					id: 'borderType',
					default: 'border',
					choices: [
						{ id: 'border', label: 'Border' },
						{ id: 'top', label: 'Top' },
						{ id: 'bottom', label: 'Bottom' },
						{ id: 'right', label: 'Right' },
						{ id: 'left', label: 'Left' },
					],
				},
				{
					type: 'number',
					label: 'Border Width',
					id: 'borderWidth',
					default: 5,
					min: 0,
					max: 25,
				},
				{
					type: 'number',
					label: 'Border Opacity',
					id: 'borderOpacity',
					default: 255,
					min: 0,
					max: 255,
				},
			],
			callback: async (feedback) => {
				const team = feedback.options.team
				const positionNumber = feedback.options.positionNumber

				//find the person in the scheduledPeople array
				let person = undefined

				//find the person in the scheduledPeople array, filtered by team and then use position number as index
				const people = self.scheduledPeople.filter((p) => p.teamNameId === team)

				if (people.length > 0) {
					person = people[positionNumber - 1]
				}

				return await personPhoto(person, true, feedback.options)
			},
		}

		feedbacks.showPersonStatusPositionNumberByTeam = {
			name: 'Show Person Status based on Position Number by Team',
			type: 'boolean',
			defaultStyle: {
				color: colorWhite,
				bgcolor: colorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Team',
					id: 'team',
					default: self.CHOICES_TEAMS[0].id,
					choices: self.CHOICES_TEAMS,
				},
				{
					type: 'number',
					label: 'Position Number',
					id: 'positionNumber',
					default: 1,
					min: 1,
					max: 100,
					range: false,
				},
				{
					type: 'dropdown',
					label: 'Status',
					id: 'status',
					default: 'C',
					choices: [
						{ id: 'C', label: 'Confirmed' },
						{ id: 'U', label: 'Unconfirmed' },
						{ id: 'D', label: 'Declined' },
					],
				},
			],
			callback: async (feedback) => {
				const team = feedback.options.team
				const positionNumber = feedback.options.positionNumber
				const status = feedback.options.status

				//find the person in the scheduledPeople array
				let person = undefined

				//find the person in the scheduledPeople array, filtered by team and then use position number as index
				const people = self.scheduledPeople.filter((p) => p.teamNameId === team)

				if (people.length > 0) {
					person = people[positionNumber - 1]
				}

				if (person) {
					//check if the person status matches the feedback status
					if (person.status === status) {
						return true
					}
				}
				return false
			},
		}

		/* Plan Picker feedbacks */
		const colorBlack = combineRgb(0, 0, 0)
		let pickerSlotChoices = []
		for (let i = 1; i <= self.getPickerSlotCount(); i++) {
			pickerSlotChoices.push({ id: i, label: `Plan ${i}` })
		}

		let pickerServiceTypeSlotChoices = []
		for (let i = 1; i <= self.getPickerServiceTypeSlotCount(); i++) {
			pickerServiceTypeSlotChoices.push({ id: i, label: `Service Type ${i}` })
		}

		feedbacks.picker_servicetype_selected = {
			type: 'boolean',
			name: 'Plan Picker: Service Type is Selected',
			description: 'True when this folder slot, or this specific service type, is the one selected in the plan picker.',
			defaultStyle: {
				color: colorBlack,
				bgcolor: combineRgb(255, 191, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Choose by',
					id: 'mode',
					default: 'slot',
					disableAutoExpression: true,
					choices: [
						{ id: 'slot', label: 'Folder slot' },
						{ id: 'specific', label: 'Specific service type' },
					],
				},
				{
					type: 'dropdown',
					label: 'Service Type Slot',
					id: 'slot',
					default: 1,
					choices: pickerServiceTypeSlotChoices,
					isVisibleExpression: `$(options:mode) != 'specific'`,
				},
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					allowCustom: true,
					isVisibleExpression: `$(options:mode) == 'specific'`,
				},
			],
			callback: async function (feedback) {
				if (feedback.options.mode === 'specific') {
					return (
						self.picker.serviceTypeId !== '' && `${feedback.options.servicetypeid}` === `${self.picker.serviceTypeId}`
					)
				}
				return self.getPickerSelectedServiceTypeSlot() === parseInt(feedback.options.slot)
			},
		}

		feedbacks.picker_servicetype_slot_empty = {
			type: 'boolean',
			name: 'Plan Picker: Service Type Slot is Empty',
			description: 'True when no service type is loaded in this slot. Useful for dimming unused buttons.',
			defaultStyle: {
				color: combineRgb(80, 80, 80),
				bgcolor: colorBlack,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Service Type Slot',
					id: 'slot',
					default: 1,
					choices: pickerServiceTypeSlotChoices,
				},
			],
			callback: async function (feedback) {
				return !self.picker.serviceTypes[parseInt(feedback.options.slot) - 1]
			},
		}

		feedbacks.picker_folder_loaded = {
			type: 'boolean',
			name: 'Plan Picker: Folder is Loaded',
			description:
				'True when the service type slots were last loaded from this folder. Useful for lighting up folder buttons.',
			defaultStyle: {
				color: colorBlack,
				bgcolor: combineRgb(255, 191, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Folder',
					id: 'folderid',
					default: '',
					allowCustom: true,
					choices: self.getPickerFolderChoices(),
				},
			],
			callback: async function (feedback) {
				return `${feedback.options.folderid ?? ''}`.trim() === self.picker.sourceOverride
			},
		}

		feedbacks.picker_plan_selected = {
			type: 'boolean',
			name: 'Plan Picker: Plan Slot is Selected',
			defaultStyle: {
				color: colorBlack,
				bgcolor: combineRgb(255, 191, 0),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Plan Slot',
					id: 'slot',
					default: 1,
					choices: pickerSlotChoices,
				},
			],
			callback: async function (feedback) {
				return self.getPickerSelectedSlot() === parseInt(feedback.options.slot)
			},
		}

		feedbacks.picker_plan_controlled = {
			type: 'boolean',
			name: 'Plan Picker: Plan Slot is Being Controlled',
			description:
				'True when this connection is in control of the plan in this slot (or the selected plan), no matter which button took control.',
			defaultStyle: {
				color: colorWhite,
				bgcolor: combineRgb(0, 153, 51),
			},
			options: [
				{
					type: 'dropdown',
					label: 'Plan Slot',
					id: 'slot',
					default: 0,
					choices: [{ id: 0, label: 'Selected plan' }, ...pickerSlotChoices],
				},
			],
			callback: async function (feedback) {
				let slot = parseInt(feedback.options.slot)
				let plan = slot === 0 ? self.getPickerSelectedPlan() : self.picker.plans[slot - 1]
				return !!plan && self.isInControlOfPlan(plan.id)
			},
		}

		feedbacks.picker_slot_empty = {
			type: 'boolean',
			name: 'Plan Picker: Plan Slot is Empty',
			description: 'True when no upcoming plan is loaded in this slot. Useful for dimming unused buttons.',
			defaultStyle: {
				color: combineRgb(80, 80, 80),
				bgcolor: colorBlack,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Plan Slot',
					id: 'slot',
					default: 1,
					choices: pickerSlotChoices,
				},
			],
			callback: async function (feedback) {
				return !self.picker.plans[parseInt(feedback.options.slot) - 1]
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
