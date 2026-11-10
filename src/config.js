import { Regex } from '@companion-module/base'

/*
 * A section heading: a full width divider line, a larger title, and an optional explanation underneath.
 * Companion renders static text as Markdown. The label is left empty and the value always has a line break,
 * which makes Companion give every heading its own full width row instead of a label/value pair.
 */
const heading = (id, title, text = '') => ({
	type: 'static-text',
	id: id,
	width: 12,
	label: '',
	value: `---\n\n### ${title}\n` + (text ? `\n${text}\n` : ''),
})

export default {
	getConfigFields() {
		return [
			heading(
				'info_account',
				'Planning Center account',
				'This module controls PCO Live for your Planning Center Services plans. Create a Personal Access Token at <a href="https://api.planningcenteronline.com/oauth/applications" target="_blank">api.planningcenteronline.com/oauth/applications</a> and paste its two parts below. The PCO person who owns the token is the one who takes control of plans.',
			),
			{
				type: 'textinput',
				id: 'applicationid',
				label: 'Application ID',
				width: 6,
			},
			{
				type: 'secret-text',
				id: 'secretkey',
				label: 'Secret Key',
				tooltip: 'Stored in the Companion secrets store, so it stays hidden once saved.',
				width: 6,
			},

			heading(
				'info_plans',
				'Which plans to show',
				'Optional. Limits the plans offered in the action dropdowns. Find an id in the address bar when you open that folder or service type in PCO.',
			),
			{
				type: 'textinput',
				id: 'parentfolder',
				label: 'Parent Folder ID',
				tooltip:
					'Only list service types in this PCO folder. The Plan Picker also uses this folder for its service type slots. Blank or 0 means every service type.',
				width: 4,
				default: '',
			},
			{
				type: 'textinput',
				id: 'servicetypeid',
				label: 'Service Type ID',
				tooltip: 'Only list plans from this one service type.',
				width: 4,
				default: '',
			},
			{
				type: 'textinput',
				id: 'perpage',
				label: 'Plans per Service Type',
				tooltip: 'How many upcoming plans to list for each service type. Default is 7.',
				width: 4,
				default: 7,
				regex: Regex.NUMBER,
			},

			heading(
				'info_picker',
				'Plan Picker',
				'Choose which service types get a slot on the Plan Picker buttons, and what is selected when Companion starts. The list loads by itself and refreshes every 15 minutes.',
			),
			{
				type: 'dropdown',
				id: 'picker_source',
				label: 'Service Type Slots Come From',
				tooltip:
					'"Parent Folder" uses the Parent Folder ID above (blank or 0 means every service type). "Only the IDs I list" shows exactly the service types you enter, in that order.',
				width: 6,
				default: 'folder',
				choices: [
					{ id: 'folder', label: 'Parent Folder (or every service type)' },
					{ id: 'list', label: 'Only the IDs I list' },
				],
			},
			{
				type: 'dropdown',
				id: 'picker_startup',
				label: 'When the Connection Starts',
				tooltip: 'Which service type and plan to select when Companion starts or the connection restarts.',
				width: 6,
				default: 'last',
				choices: [
					{ id: 'last', label: 'Select the last one used' },
					{ id: 'first', label: 'Select service type slot 1' },
					{ id: 'none', label: 'Select nothing' },
				],
			},
			{
				type: 'textinput',
				id: 'picker_servicetype_list',
				label: 'Service Type IDs to Show',
				tooltip: 'Separate ids with commas. Slot 1 is the first id, slot 2 the second, and so on.',
				width: 12,
				default: '',
				isVisibleExpression: `$(options:picker_source) == 'list'`,
			},
			{
				type: 'textinput',
				id: 'picker_servicetype_hide',
				label: 'Service Type IDs to Hide',
				tooltip:
					'Optional. Separate ids with commas. These service types never get a slot, for example test service types only you use.',
				width: 12,
				default: '',
				isVisibleExpression: `$(options:picker_source) != 'list'`,
			},
			{
				type: 'number',
				id: 'picker_servicetype_slots',
				label: 'Service Type Slots (1-30)',
				tooltip: 'How many service types get their own slot. Default is 8.',
				width: 6,
				min: 1,
				max: 30,
				default: 8,
			},
			{
				type: 'number',
				id: 'picker_slots',
				label: 'Upcoming Plan Slots (1-10)',
				tooltip: 'How many upcoming plans load for the selected service type. Default is 4.',
				width: 6,
				min: 1,
				max: 10,
				default: 4,
			},
			/* Saved by the module so the last selection comes back after a restart. Never shown */
			{
				type: 'textinput',
				id: 'picker_last_servicetype_id',
				label: 'Last Selected Service Type',
				width: 6,
				default: '',
				isVisibleExpression: 'false',
			},
			{
				type: 'textinput',
				id: 'picker_last_plan_id',
				label: 'Last Selected Plan',
				width: 6,
				default: '',
				isVisibleExpression: 'false',
			},

			heading(
				'info_polling',
				'Live updates (polling)',
				'Polling keeps the current item, countdown and feedbacks up to date. A very fast rate can get the connection rate-limited by PCO.',
			),
			{
				type: 'checkbox',
				label: 'Enable Polling',
				id: 'polling',
				width: 4,
				default: true,
			},
			{
				type: 'number',
				label: 'Polling Rate (ms)',
				id: 'pollingRate',
				tooltip: '3000 ms is recommended. A faster rate may get the connection rate-limited.',
				width: 4,
				min: 1000,
				max: 30000,
				default: 3000,
				isVisibleExpression: '$(options:polling)',
			},
			{
				type: 'textinput',
				id: 'servicetypeid_polling',
				label: 'Auto-follow Service Type ID',
				tooltip:
					'Optional. When the connection starts, automatically follow the next plan of this service type. Leave blank to pick a plan with an action instead.',
				width: 4,
				default: '',
				isVisibleExpression: '$(options:polling)',
			},

			heading('info_troubleshooting', 'Troubleshooting', ''),
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Verbose Logging',
				tooltip: 'Writes extra detail to the Companion log. Turn it off when you are done.',
				width: 4,
				default: false,
			},
		]
	},
}
