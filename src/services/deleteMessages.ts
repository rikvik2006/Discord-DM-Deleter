import { ElementHandle, Page } from "puppeteer";

export const deleteMessages = async (page: Page) => {
    const channelId = process.env.DM_CHANNEL_ID
    const userId = process.env.USER_ID

    if (!channelId) {
        throw new Error("You need to specify some DM chat where delete messages")
    }

    if (!userId) {
        throw new Error("You need to specify the ID of the owner user");
    }

    page.evaluate(() => {
        location.assign(`https://discord.com/channels/@me/${channelId}`)
    })

    const userMessages = await page.$$eval("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g", (messages) => {
        const sameAuthMessages: HTMLElement[] = []
        for (let message of messages) {
            const pfpElement: HTMLImageElement = message.querySelector("div.message-2CShn3 div.contents-2MsGLg img.avatar-2e8lTP") as HTMLImageElement

            const imageURL = pfpElement.src
            if (!imageURL.includes(userId)) continue
            sameAuthMessages.push(message);
        }

        return sameAuthMessages
    })

    const userMessagesHandleElements: ElementHandle<HTMLElement>[] = await Promise.all(userMessages.map(async (message) => await page.evaluateHandle(e => e, message)))


}