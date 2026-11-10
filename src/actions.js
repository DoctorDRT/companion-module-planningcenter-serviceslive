const { InstanceStatus } = require('@companion-module/base')

module.exports = {
	initActions() {
		let self = this // required to have reference to outer `this`
		let actions = {}

		actions.nextitem = {
			name: 'Go to Next Item',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'next')
					})
					.catch(function (message) {
						self.log('error', 'Error Going to Next Item: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.previousitem = {
			name: 'Go to Previous Item',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'previous')
					})
					.catch(function (message) {
						self.log('error', 'Error going to Previous Item: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		//reset live times
		actions.resetLiveTimes = {
			name: 'Reset Live Times',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'reset')
					})
					.catch(function (message) {
						self.log('error', 'Error Resetting Live Times: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.nextitem_inservicetype = {
			name: 'Go to Next Item of Next Plan in Selected Service Type',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					tooltip: 'PCO Service Type',
				},
			],
			callback: async function (event) {
				//get the next plan id in the service type, then do the normal requests (take control, advance)
				let serviceTypeId = event.options.servicetypeid
				self
					.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self.lastPlanId = planId
						self.startInterval()

						self
							.takeControl(serviceTypeId, planId)
							.then(function (result) {
								self.updateStatus(InstanceStatus.Ok)
								self.controlLive(serviceTypeId, planId, 'next')
							})
							.catch(function (message) {
								self.log('error', 'Error going to Next Item: ' + message)
								self.updateStatus(InstanceStatus.UnknownError, message)
							})
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.previousitem_inservicetype = {
			name: 'Go to Previous Item of Next Plan in Selected Service Type',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					tooltip: 'PCO Service Type',
				},
			],
			callback: async function (event) {
				let serviceTypeId = event.options.servicetypeid
				self
					.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self
							.takeControl(serviceTypeId, planId)
							.then(function (result) {
								self.updateStatus(InstanceStatus.Ok)
								self.controlLive(serviceTypeId, planId, 'previous')
							})
							.catch(function (message) {
								self.log('error', 'Error going to Previous Item: ' + message)
								self.updateStatus(InstanceStatus.UnknownError, message)
							})
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.resetLiveTimes_inservicetype = {
			name: 'Reset Live Times in Selected Service Type',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					tooltip: 'PCO Service Type',
				},
			],
			callback: async function (event) {
				let serviceTypeId = event.options.servicetypeid
				self
					.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self
							.takeControl(serviceTypeId, planId)
							.then(function (result) {
								self.updateStatus(InstanceStatus.Ok)
								self.controlLive(serviceTypeId, planId, 'reset')
							})
							.catch(function (message) {
								self.log('error', 'Error Resetting Live Times: ' + message)
								self.updateStatus(InstanceStatus.UnknownError, message)
							})
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.nextitem_specific = {
			name: 'Go to Next Item of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id.',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id.',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(event.options.servicetypeid)
				let planId = await self.parseVariablesInString(event.options.planid)

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'next')
					})
					.catch(function (message) {
						self.log('error', 'Error going to Next Item: ' + message)
						self.log('debug', 'Are the Service Type Id and Plan Id valid?')
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.previousitem_specific = {
			name: 'Go to Previous Item of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id to control.',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id to control.',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(event.options.servicetypeid)
				let planId = await self.parseVariablesInString(event.options.planid)

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'previous')
					})
					.catch(function (message) {
						self.log('error', 'Error going to Previous Item: ' + message)
						self.log('debug', 'Are the Service Type Id and Plan Id valid?')
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.resetLiveTimes_specific = {
			name: 'Reset Live Times of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					tooltip: 'PCO Service Type Id to control.',
					useVariables: true,
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					tooltip: 'PCO Plan Id to control.',
					useVariables: true,
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(event.options.servicetypeid)
				let planId = await self.parseVariablesInString(event.options.planid)

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.controlLive(serviceTypeId, planId, 'reset')
					})
					.catch(function (message) {
						self.log('error', 'Error Resetting Live Times: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.takecontrol = {
			name: 'Take Control',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.setControlledPlan(serviceTypeId, planId)
					})
					.catch(function (message) {
						self.log('error', message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.releasecontrol = {
			name: 'Release Control',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self
					.releaseControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
					})
					.catch(function (message) {
						self.log('error', message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.takecontrol_specific = {
			name: 'Take Control of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					useVariables: true,
					tooltip: 'PCO Service Type Id to control.',
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					useVariables: true,
					tooltip: 'PCO Plan Id to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(event.options.servicetypeid)
				let planId = await self.parseVariablesInString(event.options.planid)

				self
					.takeControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
						self.setControlledPlan(serviceTypeId, planId)
					})
					.catch(function (message) {
						self.log('error', message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.releasecontrol_specific = {
			name: 'Release Control of a Specific Plan',
			options: [
				{
					type: 'textinput',
					label: 'PCO Service Type Id',
					id: 'servicetypeid',
					useVariables: true,
					tooltip: 'PCO Service Type Id to control.',
				},
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					useVariables: true,
					tooltip: 'PCO Plan Id to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(event.options.servicetypeid)
				let planId = await self.parseVariablesInString(event.options.planid)

				self
					.releaseControl(serviceTypeId, planId)
					.then(function (result) {
						self.updateStatus(InstanceStatus.Ok)
					})
					.catch(function (message) {
						self.log('error', message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.takecontrol_inservicetype = {
			name: 'Take Control of Next Plan in Selected Service Type',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					tooltip: 'PCO Service Type',
				},
			],
			callback: async function (event) {
				//get the next plan id in the service type, then do the normal requests (take control, advance)
				let serviceTypeId = event.options.servicetypeid
				self
					.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self
							.takeControl(serviceTypeId, planId)
							.then(function (result) {
								self.updateStatus(InstanceStatus.Ok)
								self.setControlledPlan(serviceTypeId, planId)
							})
							.catch(function (message) {
								self.log('error', 'Error taking control: ' + message)
								self.updateStatus(InstanceStatus.UnknownError, message)
							})
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.releasecontrol_inservicetype = {
			name: 'Release Control of Next Plan in Selected Service Type',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					tooltip: 'PCO Service Type',
				},
			],
			callback: async function (event) {
				let serviceTypeId = event.options.servicetypeid
				self
					.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self
							.releaseControl(serviceTypeId, planId)
							.then(function (result) {
								self.updateStatus(InstanceStatus.Ok)
							})
							.catch(function (message) {
								self.log('error', 'Error releasing control: ' + message)
								self.updateStatus(InstanceStatus.UnknownError, message)
							})
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type: ' + message)
						self.updateStatus(InstanceStatus.UnknownError, message)
					})
			},
		}

		actions.setPlanIdForPolling = {
			name: 'Set Plan Id for Polling',
			description:
				'Sets the Plan Id to use for polling. This will be set automatically when you control a plan, but this is useful if you are not controlling a plan and want to poll a specific plan.',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Plan',
					id: 'planid',
					default: self.currentState.internal.plans_list[0].id,
					choices: self.currentState.internal.plans_list,
					tooltip: 'PCO Service Plan to control.',
				},
			],
			callback: async function (event) {
				let serviceTypeId = self.getServiceIdFromPlanId(event.options.planid)
				let planId = event.options.planid

				self.lastServiceTypeId = serviceTypeId
				self.lastPlanId = planId

				self.getTeamPositions()

				self.checkVariables()

				self.startInterval()
			},
		}

		actions.setPlanIdForPolling_specific = {
			name: 'Set Plan Id for Polling (Specific Plan Id)',
			description:
				'Sets the Plan Id to use for polling. This will be set automatically when you control a plan, but this is useful if you are not controlling a plan and want to poll a specific plan.',
			options: [
				{
					type: 'textinput',
					label: 'PCO Plan Id',
					id: 'planid',
					useVariables: true,
					tooltip: 'PCO Plan Id to use.',
				},
				{
					type: 'textinput',
					label: 'PCO Service Type Id (optional)',
					id: 'servicetypeid',
					default: '',
					useVariables: true,
					tooltip:
						'Needed when the plan is not one of the plans loaded when the connection started (for example a plan further in the future).',
				},
			],
			callback: async function (event) {
				let planId = await self.parseVariablesInString(event.options.planid)
				let serviceTypeId = event.options.servicetypeid
					? await self.parseVariablesInString(event.options.servicetypeid)
					: ''
				if (!serviceTypeId) {
					serviceTypeId = self.getServiceIdFromPlanId(planId)
				}
				if (!serviceTypeId) {
					self.log(
						'error',
						`Plan ${planId} was not found in the loaded plans. Fill in the Service Type Id option for this action.`,
					)
					return
				}

				self.lastServiceTypeId = serviceTypeId
				self.lastPlanId = planId

				self.getTeamPositions()

				self.checkVariables()

				self.startInterval()
			},
		}

		actions.restart_interval = {
			name: 'Restart Interval',
			description: 'Restarts the internal timer that request new data from PCO periodically.',
			options: [],
			callback: async function (event) {
				self.startInterval()
			},
		}

		actions.stop_interval = {
			name: 'Stop Interval',
			description: 'Stops the internal timer that request new data from PCO periodically.',
			options: [],
			callback: async function (event) {
				self.stopInterval()
			},
		}

		/*actions.send_chat_message = {
			name: 'Send Chat Message',
			description: 'Sends a chat message to the PCO Live Chat.',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_withorg_list[0].id,
					choices: self.currentState.internal.services_withorg_list,
					tooltip: 'PCO Service Type to send the message to.'
				},
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					default: 'Hello World!',
					tooltip: 'Message to send to the PCO Live Chat.'
				}
			],
			callback: async function(event) {
				let serviceTypeId = event.options.servicetypeid;

				
				if (serviceTypeId !== '0') {
					self.getPlanIdOfServiceType(serviceTypeId)
					.then(function (planId) {
						self.sendChatMessage(event.options.servicetypeid, planId, event.options.message);
					})
					.catch(function (message) {
						self.log('error', 'Error getting Plan Id from Service Type for Chat: ' + message);
						self.updateStatus(InstanceStatus.UnknownError, message);
					});
				}
				else {
					//if serviceTypeId is zero, we are sending the message to the entire organization, so just get the first plan id
					self.sendChatMessage('0', self.currentState.internal.plans_list[1].id, event.options.message);
				}				
			}
		};*/

		/* Plan Picker: choose a service type, pick one of its next few plans, then take control */
		let pickerSlotChoices = []
		for (let i = 1; i <= self.getPickerSlotCount(); i++) {
			pickerSlotChoices.push({ id: i, label: `Plan ${i}` })
		}

		actions.picker_load_plans = {
			name: 'Plan Picker: Load Upcoming Plans for Service Type',
			description:
				'Loads the next few upcoming plans for a service type into the picker variables (picker_plan_1_dates, etc). The soonest plan is selected by default. The list refreshes every 5 minutes.',
			options: [
				{
					type: 'dropdown',
					label: 'PCO Service Type',
					id: 'servicetypeid',
					default: self.currentState.internal.services_list[0].id,
					choices: self.currentState.internal.services_list,
					allowCustom: true,
					tooltip: 'Pick a service type, or type a Service Type Id (variables are supported).',
				},
			],
			callback: async function (event) {
				let serviceTypeId = await self.parseVariablesInString(`${event.options.servicetypeid}`)
				self.loadPickerPlans(serviceTypeId, false)
			},
		}

		actions.picker_refresh_plans = {
			name: 'Plan Picker: Refresh Upcoming Plans',
			description: 'Reloads the upcoming plans for the service type already loaded in the picker.',
			options: [],
			callback: async function () {
				self.loadPickerPlans(self.picker.serviceTypeId, true)
			},
		}

		actions.picker_select_plan = {
			name: 'Plan Picker: Select Plan',
			description: 'Selects one of the loaded upcoming plans (Plan 1 is the soonest).',
			options: [
				{
					type: 'dropdown',
					label: 'Plan Slot',
					id: 'slot',
					default: 1,
					choices: pickerSlotChoices,
				},
			],
			callback: async function (event) {
				self.selectPickerSlot(parseInt(event.options.slot))
			},
		}

		actions.picker_step_selection = {
			name: 'Plan Picker: Select Next/Previous Plan',
			description: 'Moves the picker selection to the next or previous upcoming plan.',
			options: [
				{
					type: 'dropdown',
					label: 'Direction',
					id: 'direction',
					default: 'next',
					choices: [
						{ id: 'next', label: 'Next (later plan)' },
						{ id: 'previous', label: 'Previous (sooner plan)' },
					],
				},
			],
			callback: async function (event) {
				self.stepPickerSelection(event.options.direction === 'previous' ? -1 : 1)
			},
		}

		actions.picker_take_control = {
			name: 'Plan Picker: Take Control of Selected Plan',
			description:
				'Takes control of the plan selected in the picker and starts polling it, so the current/next item variables follow it.',
			options: [],
			callback: async function () {
				self.pickerTakeControl()
			},
		}

		actions.picker_release_control = {
			name: 'Plan Picker: Release Control of Selected Plan',
			options: [],
			callback: async function () {
				self.pickerReleaseControl()
			},
		}

		actions.picker_clear = {
			name: 'Plan Picker: Clear',
			description: 'Clears the picker service type, plans and selection.',
			options: [],
			callback: async function () {
				self.clearPicker()
			},
		}

		self.setActionDefinitions(actions)
	},
}
