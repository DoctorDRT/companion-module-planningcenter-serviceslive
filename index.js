// PlanningCenterOnline-Services-Live

import { InstanceBase, InstanceStatus } from '@companion-module/base'

import upgradeScripts from './src/upgrades.js'

import config from './src/config.js'
import api from './src/api.js'

import actions from './src/actions.js'
import variables from './src/variables.js'
import feedbacks from './src/feedbacks.js'
import presets from './src/presets.js'
import picker from './src/picker.js'

export const UpgradeScripts = upgradeScripts

export default class PCOLiveInstance extends InstanceBase {
	constructor(internal) {
		super(internal)

		// Assign the methods from the listed files to this class
		Object.assign(this, {
			...config,
			...api,
			...actions,
			...variables,
			...feedbacks,
			...presets,
			...picker,
		})

		this.currentState = {
			internal: {
				services: [],
				plans: [],
				plan_times: [],
				services_list: [{ id: '', label: 'No Services loaded. Update instance config.' }],
				services_withorg_list: [{ id: '0', label: 'No Services loaded. Update instance config.' }],
				plans_list: [{ id: '', label: 'No Plans loaded. Update instance config.' }],
				currentController: null,
			},
			dynamicVariables: {
				orgnization_name: '',

				plan_title: '',
				plan_series: '',
				plan_times: '',
				plan_current_time: '',

				plan_index: '',
				plan_length: '',

				plan_currentitem: '',
				plan_currentitem_time_length: '',
				plan_currentitem_time_started: '',
				plan_currentitem_time_remaining: '',
				plan_currentitem_time_remaining_seconds: 0,
				plan_currentitem_key: '',

				plan_nextitem: '',
				plan_nextitem_time_length: '',
				plan_nextitem_key: '',
			},
		}

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined

		this.INTERVAL = null
		this.RESTART_TIMEOUT = null
		this.PICKER_INTERVAL = null
		this.PICKER_SERVICETYPES_INTERVAL = null

		this.initPickerState()
		this.ITEM_TIME_REMAINING_INTERVAL = null

		this.planItemNoteCategories = [] //array of plan item note categories for the current service type

		this.scheduledPeople = [] //array of people scheduled to the current plan being controlled
		this.teamPositionsPlanId = undefined //plan the scheduled people were last loaded for
		this.teamPositionsFetchedAt = 0
		this.itemNoteCategoriesServiceTypeId = undefined
		this.itemNoteCategoriesFetchedAt = 0
		this.personPhotoCache = new Map() //photo thumbnail url -> png base64
		this.personPhotoLoading = new Set() //photo urls currently being downloaded

		this.CHOICES_POSITIONS = [
			{
				id: 'scheduled_no_people',
				label: 'No people scheduled',
			},
		]

		this.CHOICES_TEAMS = [
			{
				id: 'scheduled_no_teams',
				label: 'No teams scheduled',
			},
		]
	}

	async init(config, isFirstInit, secrets) {
		await this.configUpdated(config, secrets)
	}

	async configUpdated(config, secrets) {
		this.config = config
		this.secrets = secrets || {}

		this.initActions()
		this.initFeedbacks()
		this.initVariables()
		this.initPresets()

		this.checkVariables()
		this.checkAllFeedbacks()

		this.updateStatus(InstanceStatus.Connecting)

		this.stopInterval()
		this.cancelRestart()
		this.stopPickerRefresh()
		this.stopPickerServiceTypesRefresh()

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined

		this.initPCOLive()

		//fill the plan picker's service type slots, then restore the last selection (see the Plan Picker settings)
		if (this.config.applicationid && this.getSecretKey()) {
			this.startPicker()
		}
	}

	async destroy() {
		//close out any connections
		this.stopInterval()
		this.cancelRestart()
		this.stopPickerRefresh()
		this.stopPickerServiceTypesRefresh()

		this.lastServiceTypeId = undefined
		this.lastPlanId = undefined
		this.lastPlanItemId = undefined
	}
}
