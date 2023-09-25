import { Page } from "puppeteer";

export const loginToDiscord = async (page: Page, token: string) => {
    await page.goto("https://discord.com/login");
    await page.waitForSelector(".wrapper-1f5byN")

    await page.evaluate((_token) => {
        setInterval(() => {
            const iframe = document.createElement("iframe")
            document.body.appendChild(iframe)
            const contentWindow = iframe.contentWindow
            if (!contentWindow) {
                throw new Error("Can't login to discord iframe content window is unaccesible")
            }

            contentWindow.localStorage.token = `"${_token}"`
        }, 50);
        setTimeout(() => { location.reload(); }, 2500);
    }, token)
}