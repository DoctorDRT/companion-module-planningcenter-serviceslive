## Planning Center Services Live

This module controls **PCO Live** for your Planning Center Services plans. Use it to advance items, take and release control, show the current and next item with a countdown, see who is scheduled, and pick which plan to run from a Stream Deck.

**Requires Companion 5.0 or newer.**

---

### Contents

1. [Setup](#setup)
2. [Quick start: the Plan Picker](#quick-start-the-plan-picker)
3. [Ways to choose a plan](#ways-to-choose-a-plan)
4. [Actions](#actions)
5. [Feedbacks](#feedbacks)
6. [Variables](#variables)
7. [Presets](#presets)
8. [Troubleshooting](#troubleshooting)

---

### Setup

#### 1. Create a Personal Access Token in PCO

1. Sign in to <https://api.planningcenteronline.com/oauth/applications> with the PCO account that should run PCO Live.
2. Under **Personal Access Tokens**, create a new token and give it a name such as "Companion".
3. Copy the token's **Application ID** and **Secret**.

The PCO person who owns the token is the person who "takes control" of plans, so use an account that has rights to control the plans you need. A shared production account works well.

#### 2. Fill in the connection settings

The settings are grouped into numbered sections.

**1. Planning Center account**

| Setting        | What it does                                                                                        |
| -------------- | --------------------------------------------------------------------------------------------------- |
| Application ID | The Application ID from your token.                                                                 |
| Secret Key     | The Secret from your token. It is kept in Companion's secrets store, so it stays hidden once saved. |

**2. Which plans to show** (all optional)

| Setting                | What it does                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Parent Folder ID       | Only list service types inside this PCO folder. The Plan Picker also fills its service type slots from this folder. |
| Service Type ID        | Only list plans from this one service type.                                                                         |
| Plans per Service Type | How many upcoming plans to list for each service type in the action dropdowns. Default is 7.                        |

**Finding an id:** open the folder or service type in PCO Services in your browser and look at the address bar. The number after `folders/` or `service_types/` is the id. For example, in `services.planningcenteronline.com/service_types/123456` the service type id is `123456`.

**3. Plan Picker**

| Setting                    | What it does                                                              |
| -------------------------- | ------------------------------------------------------------------------- |
| Service Type Slots (1-30)  | How many service types from the folder get their own slot. Default is 8.  |
| Upcoming Plan Slots (1-10) | How many upcoming plans load for the selected service type. Default is 4. |

**4. Live updates (polling)**

| Setting                     | What it does                                                                                                                                                          |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enable Polling              | Keeps the current item, countdown, scheduled people and feedbacks up to date. Leave this on unless you only need buttons that send commands.                          |
| Polling Rate (ms)           | How often to check PCO. 3000 ms (3 seconds) is recommended. Faster rates can get the connection rate-limited by PCO.                                                  |
| Auto-follow Service Type ID | Optional. When the connection starts, follow the next plan of this service type automatically. Leave blank if you choose plans with the Plan Picker or other actions. |

**5. Troubleshooting**

| Setting         | What it does                                                         |
| --------------- | -------------------------------------------------------------------- |
| Verbose Logging | Writes extra detail to the Companion log. Turn it off when finished. |

---

### Quick start: the Plan Picker

The Plan Picker lets an operator choose a service type, see its next few plans on buttons, pick one, and take control, without editing any buttons.

1. Set **Parent Folder ID** in the connection settings to the PCO folder that holds your service types (for example, your Sunday services folder).
2. Open the **Presets** tab, choose this connection, and open the **Plan Picker** section.
3. Drag these onto a page:
   - **Select Service Type 1, 2, 3...** (one per service type you want to see)
   - **Select Plan 1, 2, 3, 4**
   - **Take Control of Selected Plan**
   - **Release Control of Selected Plan** (optional)
   - **Current Item Countdown (gauge)** from the **Current Item** section (optional)
4. Press a service type button. Its upcoming plans appear on the plan buttons, and the soonest one is selected.
5. Press the plan you want, then press **Take Control**. The button turns green, and the current/next item variables and countdown now follow that plan.

What the buttons show:

- **Service type buttons** get a thick amber border when selected, and fade out when the slot is empty.
- **Plan buttons** show the date, plan name and service times. The selected plan gets an amber border, and the plan you are controlling shows a green **IN CONTROL** badge.
- **Take Control** is red until you are in control, then turns green.

The service type slots load automatically when the connection starts (if Parent Folder ID is set). The plan list refreshes itself every 5 minutes, and you can refresh it right away with **Plan Picker: Refresh Upcoming Plans**.

Want a different folder on one page? Use **Plan Picker: Load Service Types from Folder** with a folder id on a button. Leave the id blank to go back to the Parent Folder from the settings.

---

### Ways to choose a plan

Most actions come in a few versions. Pick the one that matches how you work:

| Version                                          | Use it when                                                                                         |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Plan Picker** actions                          | An operator should choose the service type and plan from the deck. Recommended for most teams.      |
| **...of Next Plan in Selected Service Type**     | You always run the next upcoming plan of one service type. The button picks the plan by itself.     |
| **...of a Specific Plan**                        | You know the Service Type ID and Plan ID, or have them in variables (such as the picker's).         |
| Plain (**Go to Next Item**, **Take Control**...) | You pick one plan from a dropdown when you build the button. That plan has to be updated each week. |

**Tip:** only the Plan Picker's Take Control and the **Set Plan Id for Polling** actions change which plan the variables follow. **Take Control of a Specific Plan** takes control but does not move the variables to that plan, so follow it with **Set Plan Id for Polling (Specific Plan Id)** if you need both.

---

### Actions

#### Plan Picker

| Action                            | What it does                                                                                                                                                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Load Service Types from Folder    | Fills the service type slots with the service types in a folder, in PCO's order. Blank folder id uses the Parent Folder setting.                                                      |
| Select Service Type               | Selects a service type and loads its upcoming plans. **Choose by**: _Folder slot_ (slot 1, 2, 3...) or _Specific service type_ (pick from the list or type an id, variables allowed). |
| Select Next/Previous Service Type | Steps through the folder slots.                                                                                                                                                       |
| Refresh Upcoming Plans            | Reloads the plans for the selected service type now.                                                                                                                                  |
| Select Plan                       | Selects plan slot 1, 2, 3... (1 is the soonest).                                                                                                                                      |
| Select Next/Previous Plan         | Steps through the plan slots.                                                                                                                                                         |
| Take Control of Selected Plan     | Takes control of the selected plan in PCO Live and makes the variables follow it.                                                                                                     |
| Release Control of Selected Plan  | Releases control of the selected plan.                                                                                                                                                |
| Clear                             | Clears the picker's service type, plans and selection.                                                                                                                                |

#### Running a plan

| Action                                               | What it does                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Go to Next Item / Go to Previous Item                | Advances the plan chosen in the dropdown.                                          |
| Reset Live Times                                     | Clears the live times of the plan chosen in the dropdown.                          |
| ...of Next Plan in Selected Service Type (3 actions) | Same as above, for the next upcoming plan of a service type.                       |
| ...of a Specific Plan (3 actions)                    | Same as above, for a Service Type ID and Plan ID you enter. Variables are allowed. |

To advance whatever plan the picker is controlling, use **Go to Next Item of a Specific Plan** with Service Type ID `$(services-live:picker_servicetype_id)` and Plan ID `$(services-live:picker_selected_plan_id)`.

#### Taking control

| Action                                                       | What it does                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| Take Control / Release Control                               | For the plan chosen in the dropdown.                                |
| Take / Release Control of a Specific Plan                    | For a Service Type ID and Plan ID you enter. Variables are allowed. |
| Take / Release Control of Next Plan in Selected Service Type | For the next upcoming plan of a service type.                       |

#### Polling

| Action                                     | What it does                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------- |
| Set Plan Id for Polling                    | Makes the variables and feedbacks follow the plan chosen in the dropdown. |
| Set Plan Id for Polling (Specific Plan Id) | Same, for a Plan ID (and optional Service Type ID) you enter.             |
| Restart Interval / Stop Interval           | Starts or stops polling without changing the settings.                    |

---

### Feedbacks

| Feedback                                   | Turns on when                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Plan Item Time Overrun                     | The current item has run past its length.                                                                       |
| Show Person Status                         | A scheduled person has a given status (confirmed, declined...).                                                 |
| Show Person Photo (several versions)       | Puts a scheduled person's photo on the button, by position name or number, optionally per team and with status. |
| Plan Picker: Service Type is Selected      | A folder slot or specific service type is the selected one.                                                     |
| Plan Picker: Service Type Slot is Empty    | That service type slot has nothing loaded.                                                                      |
| Plan Picker: Plan Slot is Selected         | That plan slot is the selected plan.                                                                            |
| Plan Picker: Plan Slot is Being Controlled | You are controlling the plan in that slot (slot 0 = the selected plan).                                         |
| Plan Picker: Plan Slot is Empty            | That plan slot has nothing loaded.                                                                              |

---

### Variables

Variables are written as `$(services-live:variable_name)`. If you renamed the connection, use your connection's label in place of `services-live`.

#### Plan being followed

| Variable                                                                                                                         | Shows                                                     |
| -------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `org_name`                                                                                                                       | Your organization name                                    |
| `plan_title`, `plan_series`                                                                                                      | Title and series of the plan                              |
| `plan_index`, `plan_length`                                                                                                      | Current item number and total items                       |
| `plan_currentitem`                                                                                                               | Current item title                                        |
| `plan_currentitem_time_length`                                                                                                   | Current item length (`mm:ss`)                             |
| `plan_currentitem_time_length_seconds`                                                                                           | Current item length in seconds                            |
| `plan_currentitem_time_started`                                                                                                  | When the current item started                             |
| `plan_currentitem_time_remaining`                                                                                                | Time left on the current item, counting down every second |
| `plan_currentitem_time_remaining_seconds`                                                                                        | Time left in seconds (negative when over)                 |
| `plan_currentitem_time_shouldfinish`                                                                                             | When the current item should finish                       |
| `plan_currentitem_key`                                                                                                           | Key of the current item (songs)                           |
| `plan_currentitem_description`                                                                                                   | Description of the current item                           |
| `plan_currentitem_notes_<category>`                                                                                              | Item notes, one variable per note category                |
| `plan_nextitem`, `plan_nextitem_time_length`, `plan_nextitem_key`, `plan_nextitem_description`, `plan_nextitem_notes_<category>` | The same, for the next item                               |
| `last_servicetype_id`, `last_servicetype_name`, `last_plan_id`, `last_plan_name`                                                 | The last plan controlled                                  |

#### Scheduled people

For the plan being followed, the module makes variables for every scheduled position:

- `scheduled_position_N`, `scheduled_position_N_status`, `scheduled_position_N_position`, `scheduled_position_N_photo_thumbnail`
- Per team: `scheduled_<team>_position_N` (with the same `_status`, `_position` and `_photo_thumbnail` versions)
- By position name: `scheduled_<team>_<position>`

Open the **Variables** tab in Companion to see the exact names for your teams.

#### Plan Picker

| Variable                                                                                                                                                                             | Shows                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `picker_folder_id`, `picker_folder_name`                                                                                                                                             | The folder the service type slots came from                |
| `picker_servicetype_count`                                                                                                                                                           | How many service types were loaded                         |
| `picker_servicetype_N_id`, `picker_servicetype_N_name`                                                                                                                               | Service type in slot N                                     |
| `picker_servicetype_id`, `picker_servicetype_name`                                                                                                                                   | The selected service type                                  |
| `picker_selected_servicetype_slot`                                                                                                                                                   | Slot number of the selected service type                   |
| `picker_plan_count`                                                                                                                                                                  | How many upcoming plans were loaded                        |
| `picker_plan_N_name`                                                                                                                                                                 | Plan title, or the series title when the plan has no title |
| `picker_plan_N_dates`, `picker_plan_N_short_dates`                                                                                                                                   | Plan dates, long and short                                 |
| `picker_plan_N_title`, `picker_plan_N_series`, `picker_plan_N_times`, `picker_plan_N_id`                                                                                             | Title, series, service times and id                        |
| `picker_selected_slot`                                                                                                                                                               | Slot number of the selected plan                           |
| `picker_selected_plan_id`, `picker_selected_plan_name`, `picker_selected_plan_dates`, `picker_selected_plan_short_dates`, `picker_selected_plan_title`, `picker_selected_plan_times` | The selected plan                                          |

---

### Presets

Presets are in the **Presets** tab under this connection:

- **Plan Picker**: Load Folder, service type slots, a button for each service type the connection knows about, plan slots, and Take/Release Control.
- **Current Item**: current item name, time remaining, countdown gauge and more.
- **Next Item**: next item name, length and key.
- **Scheduled People**: photo and status buttons for each scheduled position, generic and per team.

The Plan Picker and countdown presets use Companion 5's layered button designs. Where a layered design can't be shown, Companion uses the plain version instead. Every layered button can be changed after you drop it on a page: open the button and edit its elements.

---

### Troubleshooting

- **Status shows an error or "Connecting" never finishes:** check the Application ID and Secret Key, and that the token's PCO account can use Services. Turn on Verbose Logging and look at the connection's log.
- **The action dropdowns are empty:** the plans load when the connection starts. Check the Parent Folder ID and Service Type ID settings, or clear them to see everything.
- **The service type slots are empty:** set Parent Folder ID, or press a **Load Service Types from Folder** button with a folder id.
- **Variables don't change when I take control:** use the Plan Picker's Take Control, or add **Set Plan Id for Polling** to your button.
- **"Rate limited" in the log:** slow the Polling Rate down. 3000 ms or slower is recommended.
- **Updating from an older version:** your buttons and Secret Key move over automatically the first time the new version starts. Export your Companion config before updating, just in case.
