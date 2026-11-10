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
	async initPresets() {
		let self = this
		let presets = []

		presets.plan_index = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Index in Plan',
			style: {
				text: '$(services-live:plan_index) of $(services-live:plan_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item',
			style: {
				text: '$(services-live:plan_currentitem)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem_time_length = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Length',
			style: {
				text: '$(services-live:plan_currentitem_time_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.currentitem_time_started = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Started',
			style: {
				text: '$(services-live:plan_currentitem_time_started)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.current_item_time_remaining = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Remaining',
			style: {
				text: '$(services-live:plan_currentitem_time_remaining)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'item_overrun',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets.currentitem_time_shouldfinish = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Time Should Finish',
			style: {
				text: '$(services-live:plan_currentitem_time_shouldfinish)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [
				{
					feedbackId: 'item_overrun',
					options: {},
					style: {
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(255, 0, 0),
					},
				},
			],
		}

		presets.currentitem_key = {
			type: 'button',
			category: 'Current Item',
			label: 'Current Item Key',
			style: {
				text: '$(services-live:plan_currentitem_key)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item',
			style: {
				text: '$(services-live:plan_nextitem)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem_time_length = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item Time Length',
			style: {
				text: '$(services-live:plan_nextitem_time_length)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		presets.nextitem_key = {
			type: 'button',
			category: 'Next Item',
			label: 'Next Item Key',
			style: {
				text: '$(services-live:plan_nextitem_key)',
				size: 'auto',
				color: combineRgb(255, 255, 255),
				bgcolor: combineRgb(0, 0, 0),
			},
			steps: [
				{
					down: [],
					up: [],
				},
			],
			feedbacks: [],
		}

		//scheduled people feedbacks

		//first build them for the generic position number - this is for recycleable presets where you may not know the position name from plan to plan, but you want to populate buttons

		//need to generate the preset numbers for the buttons first
		let PRESET_NUMBERS = await generateImages(50)

		//let's make 1-50

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Photo Only`,
			type: 'text',
			text: `Show the photo of the person scheduled to the position number.`,
		})

		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Photo Only`,
				style: {
					text: '',
					png64: PRESET_NUMBERS[i - 1],
					pngalignment: 'center:center',
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'showPersonPhotoPositionNumber',
						options: {
							positionNumber: i,
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Photo With Status`,
			type: 'text',
			text: `Show the photo of the person scheduled to the position number, with their status (confirmed, unconfirmed, declined).`,
		})

		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Photo With Status`,
				style: {
					text: '',
					png64: PRESET_NUMBERS[i - 1],
					pngalignment: 'center:center',
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'showPersonPhotoPositionNumberWithStatus',
						options: {
							positionNumber: i,
							borderType: 'bottom',
							borderWidth: 25,
							borderOpacity: 255,
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Name Only`,
			type: 'text',
			text: `Presets for Generic Position Number with Person Name Only`,
		})
		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Person Name`,
				style: {
					text: `$(services-live:scheduled_position_${i})`,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Person Name with Status Feedback`,
			type: 'text',
			text: `Shows the name of the person scheduled to the position number with status feedback (green, yellow, or red depending on if confirmed, unconfirmed, or declined).`,
		})

		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Person Name with Status`,
				style: {
					text: `$(services-live:scheduled_position_${i})`,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [
					{
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'C', // Confirmed
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(0, 255, 0),
						},
					},
					{
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'U', // Unconfirmed
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 255, 0),
						},
					},
					{
						feedbackId: 'showPersonStatusByPositionNumber',
						options: {
							positionNumber: i,
							status: 'D', // Declined
						},
						style: {
							color: combineRgb(255, 255, 255),
							bgcolor: combineRgb(255, 0, 0),
						},
					},
				],
			}
			presets.push(presetObj)
		}

		presets.push({
			category: `Scheduled People - Generic Position`,
			name: `Generic Position Number - Position Name Only`,
			type: 'text',
			text: `Show the position name of the person scheduled to the position number.`,
		})
		//now build them for the generic position number with status
		for (let i = 1; i <= 50; i++) {
			let presetObj = {
				type: 'button',
				category: 'Scheduled People - Generic Position',
				label: `Scheduled Position ${i} - Position Name`,
				style: {
					text: `$(services-live:scheduled_position_${i}_position)`,
					size: 'auto',
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(0, 0, 0),
				},
				steps: [
					{
						down: [],
						up: [],
					},
				],
				feedbacks: [],
			}
			presets.push(presetObj)
		}

		//now build them for team generic position number - sorted by team
		//let's make 1-30
		for (let team in self.CHOICES_TEAMS) {
			let teamId = self.CHOICES_TEAMS[team].id
			let teamName = self.CHOICES_TEAMS[team].label

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Photo Only`,
				type: 'text',
				text: `Show the photo of the person scheduled to the position number for ${teamName}`,
			})

			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Photo Only`,
					style: {
						text: '',
						png64: PRESET_NUMBERS[i - 1],
						pngalignment: 'center:center',
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'showPersonPhotoPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Photo with Status`,
				type: 'text',
				text: `Show the photo of the person scheduled to the position number for ${teamName} with status`,
			})
			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Photo with Status`,
					style: {
						text: '',
						png64: PRESET_NUMBERS[i - 1],
						pngalignment: 'center:center',
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'showPersonPhotoPositionNumberByTeamWithStatus',
							options: {
								team: teamId,
								positionNumber: i,
								borderType: 'bottom',
								borderWidth: 25,
								borderOpacity: 255,
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Person Name Only`,
				type: 'text',
				text: `Show the name of the person scheduled to the position number for ${teamName}`,
			})

			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Person Name`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i})`,
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [],
							up: [],
						},
					],
					feedbacks: [],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Person Name with Status`,
				type: 'text',
				text: `Shows the name of the person scheduled to the position number for ${teamName} with status feedback (green, yellow, or red depending on if confirmed, unconfirmed, or declined).`,
			})
			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Person Name with Status`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i})`,
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [],
							up: [],
						},
					],
					feedbacks: [
						{
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'C', // Confirmed
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(0, 255, 0),
							},
						},
						{
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'U', // Unconfirmed
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(255, 255, 0),
							},
						},
						{
							feedbackId: 'showPersonStatusPositionNumberByTeam',
							options: {
								team: teamId,
								positionNumber: i,
								status: 'D', // Declined
							},
							style: {
								color: combineRgb(255, 255, 255),
								bgcolor: combineRgb(255, 0, 0),
							},
						},
					],
				}
				presets.push(presetObj)
			}

			presets.push({
				category: `Scheduled People - ${teamName}`,
				name: `${teamName} - Generic Position Number - Position Name Only`,
				type: 'text',
				text: `Show the position name of the person scheduled to the position number for ${teamName}`,
			})

			//now build them for the generic position number with status
			for (let i = 1; i <= 30; i++) {
				let presetObj = {
					type: 'button',
					category: `Scheduled People - ${teamName}`,
					label: `${teamName}: Scheduled Position ${i} - Position Name`,
					style: {
						text: `$(services-live:scheduled_${teamId}_position_${i}_position)`,
						size: 'auto',
						color: combineRgb(255, 255, 255),
						bgcolor: combineRgb(0, 0, 0),
					},
					steps: [
						{
							down: [],
							up: [],
						},
					],
					feedbacks: [],
				}
				presets.push(presetObj)
			}
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

const SECTION_ORDER = ['Plan Picker', 'Current Item', 'Next Item']

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
