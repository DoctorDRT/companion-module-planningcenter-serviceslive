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

1. **Plan Picker: Select Service Type** - sets the service type and loads its next plans (4 by default, set in the instance config), selecting the soonest one. The list refreshes itself every 5 minutes. "Choose by" can be:
   - **Folder slot**: first use **Plan Picker: Load Service Types from Folder**, which fills Service Type slots 1, 2, 3... with the service types in a PCO folder (in PCO's order). Leave the folder id blank to use the Parent Folder from the connection settings; if that is set, the slots load automatically when the connection starts. Slot buttons can show `$(services-live:picker_servicetype_1_name)` etc. **Select Next/Previous Service Type** steps through the slots.
   - **Specific service type**: a fixed service type on the button.
2. **Plan Picker: Select Plan** (Plan 1 = soonest) or **Select Next/Previous Plan** - choose which plan you want.
3. **Plan Picker: Take Control of Selected Plan** - takes control and starts polling that plan, so the current/next item variables follow it.

Also available: Refresh Upcoming Plans, Release Control of Selected Plan, and Clear.

Picker variables:

- Folder: `picker_folder_id`, `picker_folder_name`, `picker_servicetype_count`
- Each service type slot N: `picker_servicetype_N_id`, `picker_servicetype_N_name`
- Selected service type: `picker_servicetype_id`, `picker_servicetype_name`, `picker_selected_servicetype_slot`
- Each plan slot N: `picker_plan_N_id`, `picker_plan_N_name` (title, or series title if the plan has no title), `picker_plan_N_dates`, `picker_plan_N_short_dates`, `picker_plan_N_title`, `picker_plan_N_series`, `picker_plan_N_times`
- Selected plan: `picker_plan_count`, `picker_selected_slot`, `picker_selected_plan_id`, `picker_selected_plan_name`, `picker_selected_plan_dates`, `picker_selected_plan_short_dates`, `picker_selected_plan_title`, `picker_selected_plan_times`

Picker feedbacks: Service Type is Selected (by folder slot or specific service type), Service Type Slot is Empty, Plan Slot is Selected, Plan Slot is Being Controlled, Plan Slot is Empty.

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
