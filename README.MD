# Discord DM Cleaner

This application allows you to delete direct messages (DMs) that you have sent to other users on Discord.

## Installation

1. Clone the repository.
2. Install dependencies with `npm install` or with `pnpm install`.
3. Copy the contents of `.env.example` into a new file named `.env`.
4. Fill in the necessary values in `.env`.

## ⚠️ Warning

Due to Discord updates, this application can stop working at any time. If you encounter any problems, please open an issue.

### Environment Variables

| Variable               | Type      | Description                                                                                                                              |
| ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `INSTANCE_NAME`        | `string`  | The name of the instance. This is used to differentiate multiple instance that can be runned in parallel                                 |
| `DISCORD_USER_TOKEN`   | `string`  | The token of the Discord account that you want to delete DMs from.                                                                       |
| `USER_ID`              | `string`  | The ID of the user that you want to delete DMs from.                                                                                     |
| `PRODUCTION`           | `boolean` | Whether or not the application is running in production.                                                                                 |
| `INTERVALL_SCREENSHOT` | `boolean` | Take a screenshoot every 700ms and save it in the `./img` folder. This is usefull for debugging/monitoring in production mode (headless) |
| `EXECUTABLE_PATH`      | `string`  | The path to the executable of the browser that you want to use.                                                                          |
| `USER_DATA_DIR`        | `string`  | The path to the user data directory of the browser that you want to use.                                                                 |
| `EXCLUDE_CHANNELS_IDS` | `string`  | The IDs of the DM channels that you want to exclude from deletion. Separate with comma (",")                                             |
| `SELECT_CHANNELS_IDS`  | `string`  | If you want to delete only some channels. Separate with comma (",")                                                                      |
| `START_LOGS_WEBHOOK`   | `string`  | The URL of the webhook that you want to send start logs to.                                                                              |
| `ERROR_LOGS_WEBHOOK`   | `string`  | The URL of the webhook that you want to send error logs to.                                                                              |
| `STATS_LOGS_WEBHOOK`   | `string`  | The URL of the webhook that you want to send stats logs to.                                                                              |

#### Executable Paths and User Data Directories

You must use a browser that is based on Chromium.

You must specify the executable path and user data directory of the browser that you want to use. The following are the methods to find the executable path and user data directory of the browser that you want to use.

| Browser | Information Page                     | Executable Path name property | Profile path name property |
| ------- | ------------------------------------ | ----------------------------- | -------------------------- |
| Brave   | [brave://version](brave://version)   | Executable Path               | Profile path               |
| Chrome  | [chrome://version](chrome://version) | Executable Path               | Profile path               |

## Usage

Build the application with `npm run build` or with `pnpm build`.
To start the application, run `npm start` or `pnpm dev`.

### Deleting DMs

Keep your terminal open until the application has finished deleting DMs. Closing the terminal will stop the application from deleting DMs.
If the application is in production the browser will be hidden, otherwise the browser will be visible.

When the application finishes deleting DMs, the terminal will stop the process.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## Note

Make sure to install the dependencies before running the application.
