# Discord DM Cleaner

This application allows you to delete direct messages (DMs) that you have sent to other users on Discord.

## Installation

1. Clone the repository.
2. Install dependencies with `npm install` or with `pnpm install`.
3. Copy the contents of `.env.example` into a new file named `.env`.
4. Fill in the necessary values in `.env`.

### Environment Variables

| Variable | Description |
| --- | --- |
| `DISCORD_USER_TOKEN` | The token of the Discord account that you want to delete DMs from. |
| `USER_ID` | The ID of the user that you want to delete DMs from. |
| `PRODUCTION` | Whether or not the application is running in production. |
| `EXECUTABLE_PATH` | The path to the executable of the browser that you want to use. |
| `USER_DATA_DIR` | The path to the user data directory of the browser that you want to use. |
| `EXCLUDE_CHANNELS_IDS` | The IDs of the DM channels that you want to exclude from deletion. |

#### Executable Paths and User Data Directories

You must use a browser that is based on Chromium.

You must specify the executable path and user data directory of the browser that you want to use. The following are the methods to find the executable path and user data directory of the browser that you want to use.

| Browser | Information Page                     | Executable Path name property | Profile path name property |
|---------|--------------------------------------|-------------------------------|----------------------------|
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
