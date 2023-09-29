import { ElementHandle, Page } from "puppeteer";
import { installMouseHelper } from "../helpers/installMouseHelper";

export const deleteMessages = async (page: Page) => {
    const channelId = process.env.DM_CHANNEL_ID
    const userId = process.env.USER_ID

    await installMouseHelper(page);

    await page.waitForSelector(".homeIcon-r0w4ny");

    if (!channelId) {
        throw new Error("You need to specify some DM chat where delete messages")
    }

    if (!userId) {
        throw new Error("You need to specify the ID of the owner user");
    }

    await page.evaluate((_channelId) => {
        location.assign(`https://discord.com/channels/@me/${_channelId}`)
    }, channelId)

    await page.waitForSelector(".homeIcon-r0w4ny");

    const wait = () => new Promise(resolve => setTimeout(() => resolve("Ok"), 7000))
    await wait()

    await page.waitForSelector("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g");
    await page.waitForSelector("div.message-2CShn3 div.contents-2MsGLg img.avatar-2e8lTP")

    // const userMessages = await page.$$eval("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g", (messages, _userId) => {
    //     console.log(`🚀 _userId ${_userId}`)
    //     const sameAuthMessages: HTMLElement[] = []
    //     // for (let message of messages) {
    //     //     const pfpElement = message.querySelector("div.message-2CShn3 div.contents-2MsGLg img.avatar-2e8lTP") as HTMLImageElement | null
    //     //     if (!pfpElement) continue

    //     //     const imageURL = pfpElement.src
    //     //     if (!imageURL.includes(_userId)) continue
    //     //     sameAuthMessages.push(message);
    //     // }

    //     // return sameAuthMessages
    //     console.log("🧡 typeof messages:", typeof messages)
    //     return messages
    // }, userId)

    // Fetching the loaded messgaes

    let allMessageDeleted = false

    while (!allMessageDeleted) {
        let messages = await page.$$("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g")

        if (!messages) {
            throw new Error("User messages array is null");
        }

        if (messages.length == 0) {
            return;
        }

        console.log("⚪ type of userMessages:", typeof messages)

        // const userMessagesHandleElements: ElementHandle<HTMLElement>[] = await Promise.all(userMessages.map(async (message) => await page.evaluateHandle(e => e, message)))

        // Start from the bottom of the array
        messages.reverse();

        // for every message, hover over it and click the delete button
        for (let index in messages) {
            const message = messages[index];
            const messageBoudingBox = await message.boundingBox()
            if (!messageBoudingBox) continue

            const messageX = messageBoudingBox.x + messageBoudingBox.width / 2;
            const messageY = messageBoudingBox.y + messageBoudingBox.height / 2

            await page.mouse.move(messageX, messageY)
            await page.keyboard.down("ShiftLeft");

            const deleteButtons = await message.$$(".buttonContainer-1502pf .buttons-3dF5Kd div.buttonsInner-1ynJCY div.button-3bklZh.dangerous-Y36ifs")

            if (!deleteButtons || deleteButtons.length == 0) {
                console.log("⚠️ Not a message from the user, skipping...")
                const previousMessage = messages[parseInt(index) + 1]
                const previousMessageBoundingBox = await previousMessage.boundingBox()

                if (!previousMessageBoundingBox) continue;

                const previousMessageY = previousMessageBoundingBox.y + previousMessageBoundingBox.height / 2

                const deltaHeight = messageY - previousMessageY
                console.log("🚀 ~ file: deleteMessages.ts:95 ~ deleteMessages ~ deltaHeight:", deltaHeight)

                page.evaluate((_deltaHeight) => {
                    const scroller = document.querySelector<HTMLElement>(".scroller-kQBbkU")
                    if (!scroller) return;

                    scroller.scrollBy(0, -_deltaHeight);
                    console.log(`⚪ ${_deltaHeight}`)
                }, deltaHeight)

                continue;
            };

            // const deleteButtonsHandleElements: ElementHandle<HTMLDivElement>[] = await Promise.all(deleteButtons.map(async (deleteButton) => await page.evaluateHandle(e => e, deleteButton)))
            const deleteButtonsHandleElements = deleteButtons;

            for (let deleteButton of deleteButtonsHandleElements) {
                const deleteButtonBoundingBox = await deleteButton.boundingBox();
                if (!deleteButtonBoundingBox) continue;

                const x = deleteButtonBoundingBox.x + deleteButtonBoundingBox.width / 2;
                const y = deleteButtonBoundingBox.y + deleteButtonBoundingBox.height / 2;

                await page.mouse.move(x, y);
                await page.mouse.click(x, y);

                const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve("Ok"), ms));
                await wait(1000);
            }
        }

        const updatedMessages = await page.$$("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g")
        updatedMessages.reverse();

        if (updatedMessages.length == 0) {
            allMessageDeleted = true
        } else if (messages == updatedMessages) {
            allMessageDeleted = true
        }
    }
}