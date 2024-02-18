import { Page } from "puppeteer";
import path from "path"

export const intervallScreenshot = (page: Page, intervall: number): void => {
    setInterval(async () => {
        await page.screenshot({ path: path.join(__dirname, "..", "..", "img", "intervallScreenshot.png"), type: "png" })
    }, intervall)
}