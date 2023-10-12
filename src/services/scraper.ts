import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { loginToDiscord } from "./loginToDiscord";
import { deleteMessagesElementSibling } from "./deleteMessagesElementSibling";
import { getDMChannelsIds } from "./getDMChannels";

export const createBrowser = async () => {
    let browser
    const isProductionEnv = process.env.PRODUCTION
    const executablePath = process.env.EXECUTABLE_PATH
    const userDataDir = process.env.USER_DATA_DIR
    let excludeChannelsIds = process.env.EXCLUDE_CHANNELS_IDS

    if (isProductionEnv == undefined) {
        throw new Error("You need to specirty a deploymed status (Production or Developing). Expected: Boolean")
    }

    if (!executablePath) {
        throw new Error("You need to specify an executable path")
    }

    if (!userDataDir) {
        throw new Error("You need to specify a user data dir")
    }

    if (!excludeChannelsIds) {
        excludeChannelsIds = "";
    }

    const isProduction = isProductionEnv == "true" ? true : false

    try {
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            executablePath: executablePath,
            userDataDir: userDataDir,
            headless: isProduction ? "new" : false,
            devtools: !isProduction,
        })

        const page = await browser.newPage();

        page.on('console', (msg) => {
            for (let i = 0; i < msg.args().length; ++i)
                console.log(`${i}: ${msg.args()[i]}`);
        });

        const token = process.env.DISCORD_USER_TOKEN

        if (!token) {
            throw new Error("You need to specify a user token");
        }

        await page.goto("https://discord.com/login")

        await loginToDiscord(page, token)
        const channelsIds = await getDMChannelsIds(token)

        const excludeChannelsIdsArray = excludeChannelsIds.split(",");

        for (let channelId of channelsIds) {
            if (excludeChannelsIdsArray.includes(channelId)) {
                console.log(`*️⃣ Excluding channel id ${channelId}`)
                continue
            }

            await deleteMessagesElementSibling(page, channelId);
        }
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close()
    }
}