import { ElementHandle, JSHandle, Page } from "puppeteer";
import { installMouseHelper } from "../helpers/installMouseHelper";

export const deleteMessagesElementSibling = async (page: Page) => {
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

    const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve("Ok"), ms))
    await wait(5000)

    await page.waitForSelector("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g");
    await page.waitForSelector("div.message-2CShn3 div.contents-2MsGLg img.avatar-2e8lTP")


    let messages = await page.$$("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g")

    if (!messages) {
        throw new Error("User messages array is null");
    }

    if (messages.length == 0) {
        return;
    }
    messages.reverse();

    let message: ElementHandle<HTMLLIElement> | null = messages[0]
    while (message) {
        const getPreviouseMessage = async (message: ElementHandle<HTMLLIElement>): Promise<HTMLLIElement | null> => {
            const previousMessage: HTMLLIElement | null = await message.evaluate((message: Element) => {
                const previousMessage = message.previousElementSibling;
                if (!previousMessage) return null;
                if (previousMessage.tagName !== "LI") return null;

                return previousMessage as HTMLLIElement;
            })

            return previousMessage;
        }


        const messageBoudingBox = await message.boundingBox()
        if (!messageBoudingBox) continue

        const messageX = messageBoudingBox.x + messageBoudingBox.width / 2;
        const messageY = messageBoudingBox.y + messageBoudingBox.height / 2

        await page.mouse.move(messageX, messageY)
        await wait(250);  // Adding some delay to give time to discord to register the hover event
        await page.keyboard.down("ShiftLeft");

        // Add some orizzontal noise to the mouse pointer
        const noise = Math.round(Math.random() * 5)
        await page.mouse.move(messageX + noise, messageY)
        await page.mouse.move(messageX - noise, messageY);
        const deleteButtons = await message.$$(".buttonContainer-1502pf .buttons-3dF5Kd div.buttonsInner-1ynJCY div.button-3bklZh.dangerous-Y36ifs")

        if (!deleteButtons || deleteButtons.length == 0) {
            console.log("⚠️ Not a message from the user, skipping...")
            await page.keyboard.up("ShiftLeft");
            // await wait(500);

            // if (messages.length == parseInt(index) + 1) continue;
            // const previousMessage = messages[parseInt(index) + 1]

            const previousMessage = await getPreviouseMessage(message);

            if (!previousMessage) {
                message = null;
                continue;
            }

            const previousMessageHandleElement: ElementHandle<HTMLLIElement> = await page.evaluateHandle(_previousMessage => _previousMessage, previousMessage)

            const previousMessageBoundingBox = await previousMessageHandleElement.boundingBox()

            if (!previousMessageBoundingBox) continue;

            const previousMessageY = previousMessageBoundingBox.y + previousMessageBoundingBox.height / 2

            const deltaHeight = messageY - previousMessageY
            console.log("🚀 ~ file: deleteMessages.ts:95 ~ deleteMessages ~ deltaHeight:", deltaHeight)

            await page.evaluate((_deltaHeight) => {
                const scroller = document.querySelector<HTMLElement>(".scroller-kQBbkU")
                if (!scroller) return;

                scroller.scrollBy(0, -_deltaHeight);
                console.log(`⚪ ${_deltaHeight}`)
            }, deltaHeight)

            continue;
        };


        const deleteButtonsHandleElements = deleteButtons;

        for (let deleteButton of deleteButtonsHandleElements) {
            const deleteButtonBoundingBox = await deleteButton.boundingBox();
            if (!deleteButtonBoundingBox) continue;

            const x = deleteButtonBoundingBox.x + deleteButtonBoundingBox.width / 2;
            const y = deleteButtonBoundingBox.y + deleteButtonBoundingBox.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.click(x, y);
            await page.keyboard.up("ShiftLeft");

            const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve("Ok"), ms));
            await wait(500);
        }

        // While condition update
        const previousMessage = await getPreviouseMessage(message);

        if (!previousMessage) {
            message = null;
            continue;
        }

        const previousMessageHandleElement: ElementHandle<HTMLLIElement> = await page.evaluateHandle(_previousMessage => _previousMessage, previousMessage)
        message = previousMessageHandleElement;
    }
}