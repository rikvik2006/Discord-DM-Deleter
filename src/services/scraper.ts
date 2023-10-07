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
    if (isProductionEnv == undefined) {
        throw new Error("You need to specirty a deploymed status (Production or Developing). Expected: Boolean")
    }

    if (!executablePath) {
        throw new Error("You need to specify an executable path")
    }

    if (!userDataDir) {
        throw new Error("You need to specify a user data dir")
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

        for (let channelId of channelsIds) {
            await deleteMessagesElementSibling(page, channelId);
        }
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close()
    }
}