const { InstanceStatus } = require('@companion-module/base')

const baseAPIUrl = 'https://api.planningcenteronline.com/services/v2'

const PICKER_DEFAULT_SLOTS = 4
const PICKER_MAX_SLOTS = 10
const PICKER_REFRESH_MS = 5 * 60 * 1000 //reload the upcoming plans list every 5 minutes

/*
 * Plan Picker
 *
 * Lets an operator choose a service type, see the next few upcoming plans for it as variables,
 * pick one, and then take control of that plan. Flow on a Stream Deck:
 *   1. "Plan Picker: Load Upcoming Plans" (one button per service type)
 *   2. "Plan Picker: Select Plan" (one button per slot, text = $(services-live:picker_plan_1_dates) etc.)
 *   3. "Plan Picker: Take Control of Selected Plan"
 */
module.exports = {
	getPickerSlotCount: function () {
		let slots = parseInt(this.config?.picker_slots)
		if (isNaN(slots) || slots < 1) {
			slots = PICKER_DEFAULT_SLOTS
		}
		return Math.min(slots, PICKER_MAX_SLOTS)
	},

	initPickerState: function () {
		this.picker = {
			serviceTypeId: '',
			serviceTypeName: '',
			plans: [], //[{ id, dates, shortDates, title, seriesTitle, times }]
			selectedPlanId: '',
			loading: false,
		}
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

	loadPickerPlans: function (serviceTypeId, keepSelection) {
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

		self.picker.serviceTypeId = serviceTypeId
		let serviceObj = self.currentState.internal.services.find((s) => s.id === serviceTypeId)
		self.picker.serviceTypeName = serviceObj ? serviceObj.attributes.name : ''
		self.picker.loading = true
		self.checkVariables()
		self.checkFeedbacks()

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
				self.checkVariables()
				self.checkFeedbacks()
			})
			.catch(function (message) {
				self.picker.loading = false
				self.log('error', 'Plan Picker: error loading upcoming plans: ' + message)
				self.updateStatus(InstanceStatus.ConnectionFailure, message)
				self.checkVariables()
				self.checkFeedbacks()
			})
	},

	selectPickerSlot: function (slot) {
		let plan = this.picker.plans[slot - 1]
		if (plan) {
			this.picker.selectedPlanId = plan.id
		} else {
			this.log('debug', `Plan Picker: slot ${slot} has no plan loaded.`)
		}
		this.checkVariables()
		this.checkFeedbacks()
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

		self.lastServiceTypeId = serviceTypeId
		self.lastPlanId = plan.id
		self.currentState.internal.pickerControlledPlanId = plan.id

		self.getItemNoteCategories()
		self.getTeamPositions()
		self.checkVariables()
		self.checkFeedbacks()

		let takeControlPromise = self.takeControl(serviceTypeId, plan.id)
		if (takeControlPromise) {
			takeControlPromise
				.then(function () {
					self.updateStatus(InstanceStatus.Ok)
					self.startInterval()
					self.checkFeedbacks()
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

		if (self.currentState.internal.pickerControlledPlanId === plan.id) {
			self.currentState.internal.pickerControlledPlanId = null
		}
		self.checkFeedbacks()

		let releasePromise = self.releaseControl(serviceTypeId, plan.id)
		if (releasePromise) {
			releasePromise
				.then(function () {
					self.updateStatus(InstanceStatus.Ok)
				})
				.catch(function (message) {
					self.log('error', 'Plan Picker: error releasing control: ' + message)
					self.updateStatus(InstanceStatus.UnknownError, message)
				})
		}
	},

	clearPicker: function () {
		this.stopPickerRefresh()
		this.initPickerState()
		this.checkVariables()
		this.checkFeedbacks()
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
			{ variableId: 'picker_plan_count', name: 'Plan Picker: Number of Upcoming Plans Loaded' },
			{ variableId: 'picker_selected_slot', name: 'Plan Picker: Selected Slot Number' },
			{ variableId: 'picker_selected_plan_id', name: 'Plan Picker: Selected Plan Id' },
			{ variableId: 'picker_selected_plan_dates', name: 'Plan Picker: Selected Plan Dates' },
			{ variableId: 'picker_selected_plan_short_dates', name: 'Plan Picker: Selected Plan Short Dates' },
			{ variableId: 'picker_selected_plan_title', name: 'Plan Picker: Selected Plan Title' },
			{ variableId: 'picker_selected_plan_times', name: 'Plan Picker: Selected Plan Service Times' },
		]

		for (let i = 1; i <= this.getPickerSlotCount(); i++) {
			variables.push({ variableId: `picker_plan_${i}_id`, name: `Plan Picker: Plan ${i} Id` })
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
		values.picker_plan_count = picker.loading ? 'Loading...' : picker.plans.length
		values.picker_selected_slot = this.getPickerSelectedSlot()
		values.picker_selected_plan_id = selected ? selected.id : ''
		values.picker_selected_plan_dates = selected ? selected.dates : ''
		values.picker_selected_plan_short_dates = selected ? selected.shortDates : ''
		values.picker_selected_plan_title = selected ? selected.title : ''
		values.picker_selected_plan_times = selected ? selected.times : ''

		for (let i = 1; i <= this.getPickerSlotCount(); i++) {
			let plan = picker.plans[i - 1]
			values[`picker_plan_${i}_id`] = plan ? plan.id : ''
			values[`picker_plan_${i}_dates`] = plan ? plan.dates : ''
			values[`picker_plan_${i}_short_dates`] = plan ? plan.shortDates : ''
			values[`picker_plan_${i}_title`] = plan ? plan.title : ''
			values[`picker_plan_${i}_series`] = plan ? plan.seriesTitle : ''
			values[`picker_plan_${i}_times`] = plan ? plan.times : ''
		}

		return values
	},
}
