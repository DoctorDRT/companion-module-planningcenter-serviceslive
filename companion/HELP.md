## PlanningCenter Online - Services LIVE

This module will allow you to control PCO LIVE and advance your Planning Center Online Service Plans.

### Configuration

- You will need to set up a Personal Access Token in your PCO account.
- <https://api.planningcenteronline.com/oauth/applications>
- The PCO account that makes the token will be the account that controls the plans.
- Supply the Application ID and Secret Key to Companion in the module instance settings.
- You can supply a folder ID to filter the list of services to that specific folder. You can get the folder ID from the URL when viewing that folder in the browser.
- You can also supply a Service Type ID to only return plans for that service type. You can get the Service Type Id from the URL also.
- You can choose how many plans per service type to return and allow as options for control.

### To use the module

Add an action to a button and choose the PCO Plan you wish to control.

**Available actions:**

- Go to Next Item (Select Plan Date from list)
- Go to Previous Item (Select Plan Date from list)
- Reset Live Times (Select Plan from list)
- Go to Next Item of Next Plan in Selected Service Type
- Go to Previous Item of Next Plan in Selected Service Type
- Reset Live Times of Next Plan in Selected Service Type
- Go to Next Item of a Specific Plan (Specify Service Type Id and Plan Id - supports variables)
- Go to Previous Item of a Specific Plan (Specify Service Type Id and Plan Id - supports variables)
- Reset Live Times of a Specific Plan (Specify Service Type Id and Plan Id - supports variables)
- Take Control of Plan (Select Plan Date from list)
- Release Control (Select Plan Date from list)
- Take Control of a Specific Plan (Specify Service Type Id and Plan Id - supports variables)
- Release Control of a Specific Plan (Specify Service Type Id and Plan Id - supports variables)
- Take Control of Next Plan in Selected Service Type
- Release Control of Next Plan in Selected Service Type
- Set Plan Id to poll for variables

### Plan Picker

The Plan Picker lets an operator choose a service type, see its next few upcoming plans on buttons, pick one, and then take control of it. Ready-made buttons are in the **Plan Picker** preset category.

1. **Plan Picker: Load Upcoming Plans for Service Type** - one button per service type. Loads the next plans (4 by default, set in the instance config) and selects the soonest one. The list refreshes itself every 5 minutes.
2. **Plan Picker: Select Plan** (Plan 1 = soonest) or **Select Next/Previous Plan** - choose which plan you want.
3. **Plan Picker: Take Control of Selected Plan** - takes control and starts polling that plan, so the current/next item variables follow it.

Also available: Refresh Upcoming Plans, Release Control of Selected Plan, and Clear.

Picker variables: `picker_servicetype_id`, `picker_servicetype_name`, `picker_plan_count`, `picker_selected_slot`, `picker_selected_plan_id`, `picker_selected_plan_dates`, `picker_selected_plan_short_dates`, `picker_selected_plan_title`, `picker_selected_plan_times`, and for each slot N: `picker_plan_N_id`, `picker_plan_N_dates`, `picker_plan_N_short_dates`, `picker_plan_N_title`, `picker_plan_N_series`, `picker_plan_N_times`.

Picker feedbacks: Service Type is Loaded, Plan Slot is Selected, Plan Slot is Being Controlled, Plan Slot is Empty.

**Available Variables:**

- Organization Name

- Plan Title
- Plan Series
- Plan Index (Current Item Location in overall Plan)
- Plan Length (Total Items in Plan)

- Plan Current Item
- Plan Current Item Time Length
- Plan Current Item Time Started
- Plan Current Item Time Remaining
- Plan Current Item Time Should Finish
- Plan Current Item Key

- Plan Next Item
- Plan Next Item Time Length
- Plan Next Item Key

- Last Controlled Service Type ID
- Last Controlled Service Type Name
- Last Controlled Plan ID
- Last Controlled Plan Name
