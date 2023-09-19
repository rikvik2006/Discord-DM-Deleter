import { Page } from "puppeteer";

export const loginToDiscord = async (page: Page, token: string) => {
    await page.goto("https://discord.com/login");

    page.evaluate(() => {
        setInterval(() => {
            const iframe = document.body.appendChild(document.createElement("iframe"))
            const contentWindow = iframe.contentWindow
            if (!contentWindow) {
                throw new Error("Can't logi to discord iframe content window is unaccesible")
            }

            contentWindow.localStorage.token = `"${token}"`
        }, 50);
        setTimeout(() => { location.reload(); }, 2500);
    })
}