import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { loginToDiscord } from "./loginToDiscord";
import { deleteMessages } from "./deleteMessages";
import { deleteMessagesElementSibling } from "./deleteMessagesElementSibling";

export const createBrowser = async () => {
    let browser
    try {
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            userDataDir: "C:\\Users\\VG Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 3",
            headless: false,
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
        // await deleteMessages(page);
        await deleteMessagesElementSibling(page);
    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close()
    }
}