import { InstanceStatus } from '@companion-module/base'

const baseAPIUrl = 'https://api.planningcenteronline.com/services/v2'

const PICKER_DEFAULT_SLOTS = 4
const PICKER_MAX_SLOTS = 10
const PICKER_REFRESH_MS = 5 * 60 * 1000 //reload the upcoming plans list every 5 minutes
const PICKER_SERVICETYPES_REFRESH_MS = 15 * 60 * 1000 //reload the service type slots every 15 minutes
const PICKER_DEFAULT_SERVICETYPE_SLOTS = 8
const PICKER_MAX_SERVICETYPE_SLOTS = 30

/*
 * Plan Picker
 *
 * Lets an operator choose a service type, see the next few upcoming plans for it as variables,
 * pick one, and then take control of that plan. Flow on a Stream Deck:
 *   0. (optional) "Plan Picker: Load Service Types from Folder" fills picker_servicetype_N_name variables
 *   1. "Plan Picker: Select Service Type" (one button per folder slot, or a specific service type per button)
 *   2. "Plan Picker: Select Plan" (one button per slot, text = $(services-live:picker_plan_1_name) etc.)
 *   3. "Plan Picker: Take Control of Selected Plan"
 */
export default {
	getPickerSlotCount: function () {
		let slots = parseInt(this.config?.picker_slots)
		if (isNaN(slots) || slots < 1) {
			slots = PICKER_DEFAULT_SLOTS
		}
		return Math.min(slots, PICKER_MAX_SLOTS)
	},

	getPickerServiceTypeSlotCount: function () {
		let slots = parseInt(this.config?.picker_servicetype_slots)
		if (isNaN(slots) || slots < 1) {
			slots = PICKER_DEFAULT_SERVICETYPE_SLOTS
		}
		return Math.min(slots, PICKER_MAX_SERVICETYPE_SLOTS)
	},

	initPickerState: function () {
		this.picker = {
			sourceOverride: '', //'' = the source in the connection settings, '0' = every service type, otherwise a folder id
			folderId: '',
			folderName: '',
			serviceTypes: [], //[{ id, name }] - the service types loaded from a folder, in PCO's order
			serviceTypesLoading: false,
			serviceTypeId: '',
			serviceTypeName: '',
			plans: [], //[{ id, dates, shortDates, title, seriesTitle, times }]
			selectedPlanId: '',
			loading: false,
		}
		this.pickerFolders = [] //[{ id, name }] - every folder in PCO Services, for the Load Service Types dropdown
	},

	/* Comma, space or newline separated service type ids from a connection setting, in the order given */
	parsePickerIdList: function (value) {
		return `${value || ''}`
			.split(/[\s,;]+/)
			.map((id) => id.trim())
			.filter((id) => id !== '')
	},

	getPickerSelectedSlot: function () {
		if (!this.picker || !this.picker.selectedPlanId) {
			return 0
		}
		let index = this.picker.plans.findIndex((p) => p.id === this.picker.selectedPlanId)
		return index + 1 //0 when not found
	},

	getPickerSelectedPlan: function () {
		let slot = this.getPickerSelectedSlot()
		return slot > 0 ? this.picker.plans[slot - 1] : undefined
	},

	formatPickerTimes: function (planTimes) {
		//only service times (not rehearsals or other), sorted, formatted like "9:00 AM, 11:00 AM"
		return planTimes
			.filter((t) => t.attributes && t.attributes.time_type === 'service' && t.attributes.starts_at)
			.map((t) => new Date(t.attributes.starts_at))
			.sort((a, b) => a - b)
			.map((d) => d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }))
			.join(', ')
	},

	loadPickerPlans: function (serviceTypeId, keepSelection, preferPlanId) {
		let self = this

		serviceTypeId = `${serviceTypeId || ''}`.trim()

		if (serviceTypeId === '' || serviceTypeId === '0') {
			self.log('error', 'Plan Picker: no Service Type Id given.')
			return Promise.resolve()
		}

		let previousSelection = keepSelection ? self.picker.selectedPlanId : ''

		if (self.picker.serviceTypeId !== serviceTypeId) {
			//switching service types, clear out the old list right away so buttons don't show stale plans
			self.picker.plans = []
			self.picker.selectedPlanId = ''
			previousSelection = ''
		}
		if (preferPlanId) {
			previousSelection = `${preferPlanId}` //select this plan if it is still upcoming (used when restoring the last selection)
		}

		self.picker.serviceTypeId = serviceTypeId
		let serviceObj = self.currentState.internal.services.find((s) => s.id === serviceTypeId)
		let pickerServiceType = self.picker.serviceTypes.find((s) => s.id === serviceTypeId)
		self.picker.serviceTypeName = serviceObj
			? serviceObj.attributes.name
			: pickerServiceType
				? pickerServiceType.name
				: ''
		self.picker.loading = true
		self.checkVariables()
		self.checkAllFeedbacks()

		let slots = self.getPickerSlotCount()
		let plans_url = `${baseAPIUrl}/service_types/${serviceTypeId}/plans?filter=future&order=sort_date&per_page=${slots}&include=plan_times`

		return self
			.doRest('GET', plans_url, {})
			.then(function (result) {
				if (self.picker.serviceTypeId !== serviceTypeId) {
					//the user switched service types while this request was in flight
					return
				}

				let data = Array.isArray(result.data) ? result.data : []
				let included = Array.isArray(result.included) ? result.included : []

				self.picker.plans = data.map((plan) => {
					let timeIds = (plan.relationships?.plan_times?.data || []).map((t) => t.id)
					let planTimes = included.filter((inc) => inc.type === 'PlanTime' && timeIds.includes(inc.id))

					return {
						id: plan.id,
						dates: plan.attributes.dates || '',
						shortDates: plan.attributes.short_dates || plan.attributes.dates || '',
						title: plan.attributes.title || '',
						seriesTitle: plan.attributes.series_title || '',
						times: self.formatPickerTimes(planTimes),
					}
				})

				//keep the same plan selected if it is still upcoming, otherwise default to the first (soonest) plan
				if (previousSelection && self.picker.plans.find((p) => p.id === previousSelection)) {
					self.picker.selectedPlanId = previousSelection
				} else {
					self.picker.selectedPlanId = self.picker.plans.length > 0 ? self.picker.plans[0].id : ''
				}

				if (!self.picker.serviceTypeName && self.picker.plans.length > 0 && data[0].attributes) {
					self.picker.serviceTypeName = data[0].attributes.service_type_name || ''
				}

				self.picker.loading = false
				self.startPickerRefresh()
				self.savePickerSelection()
				self.checkVariables()
				self.checkAllFeedbacks()
			})
			.catch(function (message) {
				self.picker.loading = false
				self.log('error', 'Plan Picker: error loading upcoming plans: ' + message)
				self.updateStatus(InstanceStatus.ConnectionFailure, message)
				self.checkVariables()
				self.checkAllFeedbacks()
			})
	},

	selectPickerSlot: function (slot) {
		let plan = this.picker.plans[slot - 1]
		if (plan) {
			this.picker.selectedPlanId = plan.id
			this.savePickerSelection()
		} else {
			this.log('debug', `Plan Picker: slot ${slot} has no plan loaded.`)
		}
		this.checkVariables()
		this.checkAllFeedbacks()
	},

	stepPickerSelection: function (step) {
		let count = this.picker.plans.length
		if (count === 0) {
			return
		}
		let current = this.getPickerSelectedSlot() //1-based, 0 when none
		let next = current === 0 ? 1 : current + step
		next = Math.max(1, Math.min(count, next))
		this.selectPickerSlot(next)
	},

	pickerTakeControl: function () {
		let self = this
		let plan = self.getPickerSelectedPlan()
		let serviceTypeId = self.picker.serviceTypeId

		if (!plan || !serviceTypeId) {
			self.log('error', 'Plan Picker: no plan selected. Load a service type and select a plan first.')
			return
		}

		let takeControlPromise = self.takeControl(serviceTypeId, plan.id)
		if (takeControlPromise) {
			takeControlPromise
				.then(function (result) {
					self.updateStatus(InstanceStatus.Ok)

					//remember who "we" are and who is in control, so the "in control" feedback is right straight away
					if (result && result.data && result.data.links && result.data.links.controller) {
						self.currentState.internal.currentController = result.data.links.controller
						self.currentState.internal.liveController = result.data.links.controller
					}

					//follow this plan with the variables and polling
					self.lastServiceTypeId = serviceTypeId
					self.lastPlanId = plan.id
					self.getItemNoteCategories().catch(function () {})
					self.getTeamPositions()
					self.checkVariables()
					self.checkAllFeedbacks()
					self.startInterval()
				})
				.catch(function (message) {
					self.log('error', 'Plan Picker: error taking control: ' + message)
					self.updateStatus(InstanceStatus.UnknownError, message)
				})
		}
	},

	pickerReleaseControl: function () {
		let self = this
		let plan = self.getPickerSelectedPlan()
		let serviceTypeId = self.picker.serviceTypeId

		if (!plan || !serviceTypeId) {
			self.log('error', 'Plan Picker: no plan selected.')
			return
		}

		let releasePromise = self.releaseControl(serviceTypeId, plan.id)
		if (releasePromise) {
			releasePromise
				.then(function () {
					self.updateStatus(InstanceStatus.Ok)
					if (self.lastPlanId === plan.id) {
						self.currentState.internal.liveController = null
					}
					self.checkAllFeedbacks()
				})
				.catch(function (message) {
					self.log('error', 'Plan Picker: error releasing control: ' + message)
					self.updateStatus(InstanceStatus.UnknownError, message)
				})
		}
	},

	/* True when this instance is in control of the plan (going by the most recent live data for the followed plan) */
	isInControlOfPlan: function (planId) {
		let internal = this.currentState.internal
		return (
			!!planId &&
			this.lastPlanId === planId &&
			!!internal.liveController &&
			internal.liveController === internal.currentController
		)
	},

	/*
	 * Fills the picker's service type slots.
	 *   folderId blank: the source in the connection settings (the Parent Folder, every service type, or the listed ids)
	 *   folderId 0:     every service type
	 *   any other id:   the service types in that folder, in PCO's order
	 * Service types in the "Hide" setting are always left out, except from the listed ids.
	 */
	loadPickerServiceTypes: function (folderId) {
		let self = this

		let sourceOverride = `${folderId ?? ''}`.trim()
		let listIds = []
		let resolvedFolderId = ''

		if (sourceOverride === '') {
			if (self.config?.picker_source === 'list') {
				listIds = self.parsePickerIdList(self.config.picker_servicetype_list)
			} else {
				resolvedFolderId = self.getParentFolderId()
			}
		} else if (sourceOverride !== '0') {
			resolvedFolderId = sourceOverride
		}

		let url = `${baseAPIUrl}/service_types?order=sequence&per_page=100`
		if (resolvedFolderId) {
			url += `&where[parent_id]=${encodeURIComponent(resolvedFolderId)}`
		}

		self.picker.sourceOverride = sourceOverride
		self.picker.folderId = resolvedFolderId
		self.picker.folderName = resolvedFolderId
			? (self.pickerFolders.find((f) => f.id === resolvedFolderId) || {}).name || self.picker.folderName
			: listIds.length > 0
				? 'My List'
				: 'All Service Types'
		self.picker.serviceTypesLoading = true
		self.checkVariables()

		let folderPromise = Promise.resolve(self.picker.folderName)
		if (resolvedFolderId) {
			folderPromise = self
				.doRest('GET', `${baseAPIUrl}/folders/${encodeURIComponent(resolvedFolderId)}`, {})
				.then((result) => (result.data && result.data.attributes ? result.data.attributes.name : ''))
				.catch(() => '') //the folder name is just a nice-to-have
		}

		let loadId = (self.pickerServiceTypesLoadId = (self.pickerServiceTypesLoadId || 0) + 1)

		return Promise.all([self.getAllPages(url), folderPromise])
			.then(function ([result, folderName]) {
				if (self.pickerServiceTypesLoadId !== loadId) {
					return //a different source was requested while this one was loading
				}

				let all = (result.data || []).map((st) => ({ id: `${st.id}`, name: st.attributes?.name || '' }))
				let serviceTypes
				if (listIds.length > 0) {
					//the listed ids, in the order they were listed
					serviceTypes = listIds.map((id) => all.find((st) => st.id === id)).filter((st) => st)
					let missing = listIds.filter((id) => !all.find((st) => st.id === id))
					if (missing.length > 0) {
						self.log('warn', `Plan Picker: these listed service type ids were not found in PCO: ${missing.join(', ')}`)
					}
				} else {
					let hidden = self.parsePickerIdList(self.config?.picker_servicetype_hide)
					serviceTypes = all.filter((st) => !hidden.includes(st.id))
				}

				self.picker.serviceTypes = serviceTypes
				self.picker.folderName = folderName || self.picker.folderName
				self.picker.serviceTypesLoading = false

				if (self.picker.serviceTypes.length > self.getPickerServiceTypeSlotCount()) {
					self.log(
						'info',
						`Plan Picker: found ${self.picker.serviceTypes.length} service types, but only ${self.getPickerServiceTypeSlotCount()} service type slots are set in the connection config.`,
					)
				}

				self.checkVariables()
				self.checkAllFeedbacks()
			})
			.catch(function (message) {
				if (self.pickerServiceTypesLoadId !== loadId) {
					return
				}
				self.picker.serviceTypesLoading = false
				self.log('error', 'Plan Picker: error loading service types: ' + message)
				self.updateStatus(InstanceStatus.ConnectionFailure, message)
				self.checkVariables()
				self.checkAllFeedbacks()
			})
	},

	/* Choices for the folder dropdown: the connection's default, every service type, then each PCO folder */
	getPickerFolderChoices: function () {
		return [
			{ id: '', label: 'Default (Plan Picker settings)' },
			{ id: '0', label: 'All service types' },
			...(this.pickerFolders || []).map((f) => ({ id: f.id, label: f.name })),
		]
	},

	/* Loads every Services folder, for the folder dropdown on "Load Service Types" and the folder presets */
	loadPickerFolders: function () {
		let self = this
		return self
			.getAllPages(`${baseAPIUrl}/folders?per_page=100&order=name`)
			.then(function (result) {
				self.pickerFolders = (result.data || []).map((f) => ({
					id: `${f.id}`,
					name: f.attributes?.name || `Folder ${f.id}`,
				}))
				//the folder dropdowns and folder presets changed
				self.initActions()
				self.initFeedbacks()
				self.initPresets()
				self.checkAllFeedbacks()
			})
			.catch(function (message) {
				self.log('warn', 'Plan Picker: could not load the folder list: ' + message)
			})
	},

	/*
	 * Runs when the connection starts: loads the folders and the service type slots, then picks the service type
	 * the connection settings ask for (the last one used, or slot 1) if nothing is selected yet.
	 */
	startPicker: function () {
		let self = this
		self.loadPickerFolders()
		self.startPickerServiceTypesRefresh()

		//the settings may have changed, so go back to the source they name (a Load button can still pick another)
		return self.loadPickerServiceTypes('').then(function () {
			if (self.picker.serviceTypeId) {
				self.loadPickerPlans(self.picker.serviceTypeId, true) //reload it with the new settings
				return
			}

			let startup = self.config?.picker_startup || 'last'
			let lastServiceTypeId = `${self.config?.picker_last_servicetype_id || ''}`.trim()
			if (startup === 'last' && lastServiceTypeId) {
				let saved = self.picker.serviceTypes.find((st) => st.id === lastServiceTypeId)
				self.picker.serviceTypeName = saved ? saved.name : ''
				self.loadPickerPlans(lastServiceTypeId, false, self.config?.picker_last_plan_id)
			} else if (startup === 'first' || startup === 'last') {
				//'last' with nothing saved yet starts on slot 1 too
				if (self.picker.serviceTypes.length > 0) {
					self.selectPickerServiceTypeSlot(1)
				}
			}
		})
	},

	startPickerServiceTypesRefresh: function () {
		let self = this
		self.stopPickerServiceTypesRefresh()
		self.PICKER_SERVICETYPES_INTERVAL = setInterval(function () {
			self.loadPickerServiceTypes(self.picker.sourceOverride)
		}, PICKER_SERVICETYPES_REFRESH_MS)
	},

	stopPickerServiceTypesRefresh: function () {
		if (this.PICKER_SERVICETYPES_INTERVAL) {
			clearInterval(this.PICKER_SERVICETYPES_INTERVAL)
			this.PICKER_SERVICETYPES_INTERVAL = null
		}
	},

	/* Saves the selected service type and plan in the connection config, so they come back after a restart */
	savePickerSelection: function () {
		if (!this.config) {
			return
		}
		let serviceTypeId = this.picker.serviceTypeId || ''
		let planId = this.picker.selectedPlanId || ''
		if (this.config.picker_last_servicetype_id === serviceTypeId && this.config.picker_last_plan_id === planId) {
			return
		}
		this.config = { ...this.config, picker_last_servicetype_id: serviceTypeId, picker_last_plan_id: planId }
		this.saveConfig(this.config, undefined) //companion does not call configUpdated for this
	},

	/* 1-based slot of the selected service type in the loaded service types, 0 when it isn't one of them */
	getPickerSelectedServiceTypeSlot: function () {
		if (!this.picker.serviceTypeId) {
			return 0
		}
		return this.picker.serviceTypes.findIndex((st) => st.id === this.picker.serviceTypeId) + 1
	},

	selectPickerServiceTypeSlot: function (slot) {
		let serviceType = this.picker.serviceTypes[slot - 1]
		if (!serviceType) {
			this.log('debug', `Plan Picker: service type slot ${slot} is empty.`)
			return
		}
		this.picker.serviceTypeName = serviceType.name
		this.loadPickerPlans(serviceType.id, this.picker.serviceTypeId === serviceType.id)
	},

	stepPickerServiceType: function (step) {
		let count = this.picker.serviceTypes.length
		if (count === 0) {
			return
		}
		let current = this.getPickerSelectedServiceTypeSlot()
		let next = current === 0 ? 1 : current + step
		next = Math.max(1, Math.min(count, next))
		this.selectPickerServiceTypeSlot(next)
	},

	/* A plan's display name: its title if it has one, otherwise its series title (blank if it has neither) */
	getPickerPlanName: function (plan) {
		return plan ? plan.title || plan.seriesTitle || '' : ''
	},

	clearPicker: function () {
		let folders = this.pickerFolders
		this.stopPickerRefresh()
		this.initPickerState()
		this.pickerFolders = folders
		this.savePickerSelection()
		this.checkVariables()
		this.checkAllFeedbacks()
	},

	startPickerRefresh: function () {
		let self = this
		self.stopPickerRefresh()
		if (self.picker.serviceTypeId) {
			self.PICKER_INTERVAL = setInterval(function () {
				self.loadPickerPlans(self.picker.serviceTypeId, true)
			}, PICKER_REFRESH_MS)
		}
	},

	stopPickerRefresh: function () {
		if (this.PICKER_INTERVAL) {
			clearInterval(this.PICKER_INTERVAL)
			this.PICKER_INTERVAL = null
		}
	},

	getPickerVariableDefinitions: function () {
		let variables = [
			{ variableId: 'picker_servicetype_id', name: 'Plan Picker: Service Type Id' },
			{ variableId: 'picker_servicetype_name', name: 'Plan Picker: Service Type Name' },
			{ variableId: 'picker_folder_id', name: 'Plan Picker: Folder Id' },
			{ variableId: 'picker_folder_name', name: 'Plan Picker: Folder Name' },
			{ variableId: 'picker_servicetype_count', name: 'Plan Picker: Number of Service Types Loaded' },
			{ variableId: 'picker_selected_servicetype_slot', name: 'Plan Picker: Selected Service Type Slot Number' },
			{ variableId: 'picker_plan_count', name: 'Plan Picker: Number of Upcoming Plans Loaded' },
			{ variableId: 'picker_selected_plan_name', name: 'Plan Picker: Selected Plan Name' },
			{ variableId: 'picker_selected_slot', name: 'Plan Picker: Selected Slot Number' },
			{ variableId: 'picker_selected_plan_id', name: 'Plan Picker: Selected Plan Id' },
			{ variableId: 'picker_selected_plan_dates', name: 'Plan Picker: Selected Plan Dates' },
			{ variableId: 'picker_selected_plan_short_dates', name: 'Plan Picker: Selected Plan Short Dates' },
			{ variableId: 'picker_selected_plan_title', name: 'Plan Picker: Selected Plan Title' },
			{ variableId: 'picker_selected_plan_times', name: 'Plan Picker: Selected Plan Service Times' },
		]

		for (let i = 1; i <= this.getPickerServiceTypeSlotCount(); i++) {
			variables.push({ variableId: `picker_servicetype_${i}_id`, name: `Plan Picker: Service Type ${i} Id` })
			variables.push({ variableId: `picker_servicetype_${i}_name`, name: `Plan Picker: Service Type ${i} Name` })
		}

		for (let i = 1; i <= this.getPickerSlotCount(); i++) {
			variables.push({ variableId: `picker_plan_${i}_id`, name: `Plan Picker: Plan ${i} Id` })
			variables.push({ variableId: `picker_plan_${i}_name`, name: `Plan Picker: Plan ${i} Name` })
			variables.push({ variableId: `picker_plan_${i}_dates`, name: `Plan Picker: Plan ${i} Dates` })
			variables.push({ variableId: `picker_plan_${i}_short_dates`, name: `Plan Picker: Plan ${i} Short Dates` })
			variables.push({ variableId: `picker_plan_${i}_title`, name: `Plan Picker: Plan ${i} Title` })
			variables.push({ variableId: `picker_plan_${i}_series`, name: `Plan Picker: Plan ${i} Series` })
			variables.push({ variableId: `picker_plan_${i}_times`, name: `Plan Picker: Plan ${i} Service Times` })
		}

		return variables
	},

	getPickerVariableValues: function () {
		let values = {}
		let picker = this.picker
		let selected = this.getPickerSelectedPlan()

		values.picker_servicetype_id = picker.serviceTypeId
		values.picker_servicetype_name = picker.serviceTypeName
		values.picker_folder_id = picker.folderId
		values.picker_folder_name = picker.folderName
		values.picker_servicetype_count = picker.serviceTypesLoading ? 'Loading...' : picker.serviceTypes.length
		values.picker_selected_servicetype_slot = this.getPickerSelectedServiceTypeSlot()
		values.picker_plan_count = picker.loading ? 'Loading...' : picker.plans.length
		values.picker_selected_plan_name = this.getPickerPlanName(selected)
		values.picker_selected_slot = this.getPickerSelectedSlot()
		values.picker_selected_plan_id = selected ? selected.id : ''
		values.picker_selected_plan_dates = selected ? selected.dates : ''
		values.picker_selected_plan_short_dates = selected ? selected.shortDates : ''
		values.picker_selected_plan_title = selected ? selected.title : ''
		values.picker_selected_plan_times = selected ? selected.times : ''

		for (let i = 1; i <= this.getPickerServiceTypeSlotCount(); i++) {
			let serviceType = picker.serviceTypes[i - 1]
			values[`picker_servicetype_${i}_id`] = serviceType ? serviceType.id : ''
			values[`picker_servicetype_${i}_name`] = serviceType ? serviceType.name : ''
		}

		for (let i = 1; i <= this.getPickerSlotCount(); i++) {
			let plan = picker.plans[i - 1]
			values[`picker_plan_${i}_id`] = plan ? plan.id : ''
			values[`picker_plan_${i}_name`] = this.getPickerPlanName(plan)
			values[`picker_plan_${i}_dates`] = plan ? plan.dates : ''
			values[`picker_plan_${i}_short_dates`] = plan ? plan.shortDates : ''
			values[`picker_plan_${i}_title`] = plan ? plan.title : ''
			values[`picker_plan_${i}_series`] = plan ? plan.seriesTitle : ''
			values[`picker_plan_${i}_times`] = plan ? plan.times : ''
		}

		return values
	},
}
