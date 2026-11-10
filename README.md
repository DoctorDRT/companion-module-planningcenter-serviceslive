# companion-module-planningcenter-serviceslive

A [Bitfocus Companion](https://bitfocus.io/companion) module for controlling **PCO Live** in Planning Center Services.

- Advance plan items, reset live times, and take or release control.
- Show the current and next item, a live countdown, item notes, and who is scheduled.
- **Plan Picker**: choose a service type from a PCO folder, see its upcoming plans on buttons, pick one and take control, all from a Stream Deck.
- Layered button designs for Companion 5.

Requires **Companion 5.0 or newer** (module API `@companion-module/base` 2.x, Node 22).

Full instructions for users are in [companion/HELP.md](companion/HELP.md), which Companion also shows from the connection's help button.

## Development

```sh
yarn install
yarn format                  # prettier
npx companion-module-build   # build a .tgz for Companion
```

To test a local copy, put this folder in Companion's **Developer modules** folder (Settings > Developer) and restart Companion. After changing dependencies, run `yarn install --production` in that folder so `node_modules` matches.

### Layout

| File                     | Contents                                                                           |
| ------------------------ | ---------------------------------------------------------------------------------- |
| `index.js`               | Module entry point                                                                 |
| `src/config.js`          | Connection settings                                                                |
| `src/api.js`             | PCO API requests and polling                                                       |
| `src/actions.js`         | Actions                                                                            |
| `src/feedbacks.js`       | Feedbacks                                                                          |
| `src/variables.js`       | Variables                                                                          |
| `src/picker.js`          | Plan Picker                                                                        |
| `src/presets.js`         | Presets                                                                            |
| `src/presets-layered.js` | Layered (Companion 5) preset designs                                               |
| `src/upgrades.js`        | Upgrade scripts. Never remove or reorder these; Companion tracks them by position. |

## License

See [LICENSE](LICENSE).
