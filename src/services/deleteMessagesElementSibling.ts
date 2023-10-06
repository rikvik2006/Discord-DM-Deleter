import { ElementHandle, JSHandle, Page } from "puppeteer";
import { installMouseHelper } from "../helpers/installMouseHelper";

export const deleteMessagesElementSibling = async (page: Page, channelId: string) => {
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
        const getPreviouseMessage = async (message: ElementHandle<HTMLLIElement>): Promise<ElementHandle<HTMLLIElement> | null> => {
            const previousMessage: ElementHandle<Element> | JSHandle<null> = await message.evaluateHandle((message: HTMLLIElement) => {
                try {
                    let previousMessage = message.previousElementSibling;
                    if (!previousMessage) return null;
                    // not(previousMessage) or not(previousMessage.tagName == "LI")
                    while (previousMessage.tagName != "LI") {
                        console.log(`🪫 previus message ${previousMessage}`);
                        previousMessage = previousMessage.previousElementSibling;
                        if (!previousMessage) return null;
                    }

                    console.log("🪫 previus message is LI");
                    message.style.border = "1px solid red";
                    return previousMessage;
                } catch (err) {
                    console.log("❌🪫 callback error");
                    return null;
                }
            });

            // if type is JSHandle<null> return null, else return HTMLLIElement
            if (previousMessage.asElement() == null) return null;
            // return previousMessage.asElement() as HTMLLIElement;
            const previousMessageHandleElement = previousMessage.asElement() as ElementHandle<HTMLLIElement>;
            return previousMessageHandleElement;
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

            const previousMessage = await getPreviouseMessage(message);
            console.log("🚀 ~ file: deleteMessagesElementSibling.ts:88 ~ deleteMessagesElementSibling ~ previousMessage:", previousMessage)

            if (!previousMessage) {
                message = null;
                continue;
            }

            // const previousMessageHandleElement: ElementHandle<HTMLLIElement> = await page.evaluateHandle(_previousMessage => _previousMessage, previousMessage)
            const previousMessageHandleElement: ElementHandle<HTMLLIElement> = previousMessage;
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

            message = previousMessageHandleElement;
            continue;
        };

        // While condition update
        const previousMessage = await getPreviouseMessage(message);
        console.log("🚀 ~ file: deleteMessagesElementSibling.ts:119 ~ deleteMessagesElementSibling ~ previousMessage:", previousMessage)

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

        if (!previousMessage) {
            message = null;
            continue;
        }

        // const previousMessageHandleElement: ElementHandle<HTMLLIElement> = await page.evaluateHandle(_previousMessage => _previousMessage, previousMessage)
        const previousMessageHandleElement: ElementHandle<HTMLLIElement> = previousMessage;
        message = previousMessageHandleElement;
    }
}