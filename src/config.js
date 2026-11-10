import { Regex } from '@companion-module/base'

/* A section heading with a one line explanation underneath */
const heading = (id, label, value) => ({ type: 'static-text', id: id, width: 12, label: label, value: value })

export default {
	getConfigFields() {
		return [
			heading(
				'info_account',
				'1. Planning Center account',
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
				'2. Which plans to show',
				'Optional. Limits the plans offered in the action dropdowns. Find an id in the address bar when you open that folder or service type in PCO.',
			),
			{
				type: 'textinput',
				id: 'parentfolder',
				label: 'Parent Folder ID',
				tooltip:
					'Only list service types in this PCO folder. The Plan Picker also uses this folder for its service type slots.',
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
				'3. Plan Picker',
				'How many buttons the Plan Picker fills. More slots means more variables and presets.',
			),
			{
				type: 'number',
				id: 'picker_servicetype_slots',
				label: 'Service Type Slots (1-30)',
				tooltip: 'How many service types from the folder get their own slot. Default is 8.',
				width: 4,
				min: 1,
				max: 30,
				default: 8,
			},
			{
				type: 'number',
				id: 'picker_slots',
				label: 'Upcoming Plan Slots (1-10)',
				tooltip: 'How many upcoming plans load for the selected service type. Default is 4.',
				width: 4,
				min: 1,
				max: 10,
				default: 4,
			},

			heading(
				'info_polling',
				'4. Live updates (polling)',
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

			heading('info_troubleshooting', '5. Troubleshooting', ''),
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
