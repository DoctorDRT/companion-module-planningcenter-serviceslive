/*
 * Upgrade scripts run once per connection, in order, and are tracked by position.
 * Never remove or reorder one: replace an unneeded script with EmptyUpgradeScript instead.
 *
 * Action/feedback options are wrapped as { isExpression, value } in the v2 module api.
 */
const plainOption = (value) => ({ isExpression: false, value: value })
const optionValue = (option) => (option && typeof option === 'object' && 'value' in option ? option.value : option)

export default [
	function (context, props) {
		// This is a placeholder than now cannot be used/removed
		return {
			updatedConfig: null,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
	function (context, props) {
		// Plan Picker: "Load Upcoming Plans for Service Type" and "Select Service Type" were combined into
		// "Select Service Type" with a Choose by option, and their feedbacks were combined the same way
		let updatedActions = []
		let updatedFeedbacks = []

		for (const action of props.actions) {
			if (action.actionId === 'picker_load_plans') {
				action.actionId = 'picker_select_servicetype'
				action.options = {
					mode: plainOption('specific'),
					slot: plainOption(1),
					servicetypeid: action.options.servicetypeid,
				}
				updatedActions.push(action)
			} else if (action.actionId === 'picker_select_servicetype' && optionValue(action.options.mode) === undefined) {
				action.options = {
					mode: plainOption('slot'),
					slot: action.options.slot,
					servicetypeid: plainOption(''),
				}
				updatedActions.push(action)
			}
		}

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'picker_servicetype_loaded') {
				feedback.feedbackId = 'picker_servicetype_selected'
				feedback.options = {
					mode: plainOption('specific'),
					slot: plainOption(1),
					servicetypeid: feedback.options.servicetypeid,
				}
				updatedFeedbacks.push(feedback)
			} else if (feedback.feedbackId === 'picker_servicetype_slot_selected') {
				feedback.feedbackId = 'picker_servicetype_selected'
				feedback.options = {
					mode: plainOption('slot'),
					slot: feedback.options.slot,
					servicetypeid: plainOption(''),
				}
				updatedFeedbacks.push(feedback)
			}
		}

		return {
			updatedConfig: null,
			updatedActions: updatedActions,
			updatedFeedbacks: updatedFeedbacks,
		}
	},
	function (context, props) {
		// The Secret Key moved from the normal config to Companion's secrets store, so it is no longer shown on screen
		if (!props.config || !props.config.secretkey) {
			return { updatedConfig: null, updatedActions: [], updatedFeedbacks: [] }
		}

		let updatedSecrets = { ...(props.secrets || {}), secretkey: props.config.secretkey }
		let updatedConfig = { ...props.config }
		delete updatedConfig.secretkey

		return {
			updatedConfig: updatedConfig,
			updatedSecrets: updatedSecrets,
			updatedActions: [],
			updatedFeedbacks: [],
		}
	},
]
