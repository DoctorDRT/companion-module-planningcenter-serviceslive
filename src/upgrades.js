module.exports = [
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
				action.options = { mode: 'specific', slot: 1, servicetypeid: action.options.servicetypeid }
				updatedActions.push(action)
			} else if (action.actionId === 'picker_select_servicetype' && action.options.mode === undefined) {
				action.options = { mode: 'slot', slot: action.options.slot, servicetypeid: '' }
				updatedActions.push(action)
			}
		}

		for (const feedback of props.feedbacks) {
			if (feedback.feedbackId === 'picker_servicetype_loaded') {
				feedback.feedbackId = 'picker_servicetype_selected'
				feedback.options = { mode: 'specific', slot: 1, servicetypeid: feedback.options.servicetypeid }
				updatedFeedbacks.push(feedback)
			} else if (feedback.feedbackId === 'picker_servicetype_slot_selected') {
				feedback.feedbackId = 'picker_servicetype_selected'
				feedback.options = { mode: 'slot', slot: feedback.options.slot, servicetypeid: '' }
				updatedFeedbacks.push(feedback)
			}
		}

		return {
			updatedConfig: null,
			updatedActions: updatedActions,
			updatedFeedbacks: updatedFeedbacks,
		}
	},
]
