import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { loginToDiscord } from "./loginToDiscord";

export const createBrowser = async () => {
    let browser
    try {
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            userDataDir: "C:\\Users\\VG Admin\\AppData\\Local\\Google\\Chrome\\User Data\\Guest Profile",
            headless: false,
        })

        const page = await browser.newPage();

        const token = process.env.DISCORD_USER_TOKEN

        if (!token) {
            throw new Error("You need to specify a user token");
        }

        loginToDiscord(page, token)


    } catch (err) {
        console.log(err);
    } finally {
        await browser?.close()
    }
}