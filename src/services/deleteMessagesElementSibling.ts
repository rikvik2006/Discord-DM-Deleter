import { ElementHandle, JSHandle, Page } from "puppeteer";
import { installMouseHelper } from "../helpers/installMouseHelper";

export const deleteMessagesElementSibling = async (page: Page, channelId: string): Promise<number> => {
    const userId = process.env.USER_ID
    let totalDeletedMessages = 0

    await installMouseHelper(page);

    await page.waitForSelector(".childWrapper-1j_1ub");

    if (!channelId) {
        throw new Error("You need to specify some DM chat where delete messages")
    }

    if (!userId) {
        throw new Error("You need to specify the ID of the owner user");
    }

    await page.evaluate((_channelId) => {
        location.assign(`https://discord.com/channels/@me/${_channelId}`)
    }, channelId)

    await page.waitForSelector(".childWrapper-1j_1ub");

    const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve("Ok"), ms))
    await wait(5000)

    await page.waitForSelector("ol.scrollerInner-2PPAp2");

    let messages = await page.$$("ol.scrollerInner-2PPAp2 li.messageListItem-ZZ7v6g")

    if (!messages) {
        throw new Error("User messages array is null");
    }

    if (messages.length == 0) {
        return totalDeletedMessages;
    }
    messages.reverse();

    let message: ElementHandle<HTMLLIElement> | null = messages[0]
    while (message) {
        const getPreviouseMessage = async (message: ElementHandle<HTMLLIElement>): Promise<ElementHandle<HTMLLIElement> | null> => {
            const previousMessage: ElementHandle<Element> | JSHandle<null> = await message.evaluateHandle((message: HTMLLIElement) => {
                try {
                    let previousMessage = message.previousElementSibling;
                    if (!previousMessage) return null;

                    // not(previousMessage.tagName == "LI")
                    while (previousMessage.tagName != "LI") {
                        // console.log(`🪫 previus message ${previousMessage}`);
                        previousMessage = previousMessage.previousElementSibling;
                        if (!previousMessage) return null;
                    }

                    // console.log("🪫 previus message is LI");
                    message.style.border = "1px solid red";
                    return previousMessage;
                } catch (err) {
                    console.log("❌ [Fetching Previus Message] callback error");
                    return null;
                }
            });

            // if type is JSHandle<null> return null, else return HTMLLIElement
            if (previousMessage.asElement() == null) return null;
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
            console.log(`⚠️ [${channelId}] Not a message from the user, skipping...`)
            await page.keyboard.up("ShiftLeft");

            const previousMessage = await getPreviouseMessage(message);

            if (!previousMessage) {
                message = null;
                continue;
            }

            const previousMessageHandleElement: ElementHandle<HTMLLIElement> = previousMessage;
            const previousMessageBoundingBox = await previousMessageHandleElement.boundingBox()

            if (!previousMessageBoundingBox) continue;

            const previousMessageY = previousMessageBoundingBox.y + previousMessageBoundingBox.height / 2

            const deltaHeight = messageY - previousMessageY

            await page.evaluate((_deltaHeight) => {
                const scroller = document.querySelector<HTMLElement>(".scroller-kQBbkU")
                if (!scroller) return;

                scroller.scrollBy(0, -_deltaHeight);
            }, deltaHeight)

            message = previousMessageHandleElement;
            continue;
        };

        // While condition update
        const previousMessage = await getPreviouseMessage(message);

        const deleteButtonsHandleElements = deleteButtons;

        for (let deleteButton of deleteButtonsHandleElements) {
            const deleteButtonBoundingBox = await deleteButton.boundingBox();
            if (!deleteButtonBoundingBox) continue;

            const x = deleteButtonBoundingBox.x + deleteButtonBoundingBox.width / 2;
            const y = deleteButtonBoundingBox.y + deleteButtonBoundingBox.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.click(x, y);
            await page.keyboard.up("ShiftLeft");
            totalDeletedMessages++
            console.log(`✅ [${channelId}] Succesfuly deleated the message`)

            await page.evaluate((_messageBoudingBox) => {
                const scroller = document.querySelector<HTMLElement>(".scroller-kQBbkU")
                if (!scroller) return;

                scroller.scrollBy(0, -_messageBoudingBox.height);
            }, messageBoudingBox)

            const wait = (ms: number) => new Promise(resolve => setTimeout(() => resolve("Ok"), ms));
            const minMilliseconds = 1500
            const maxMilliseconds = 10000
            const milliseconds = Math.floor(Math.random() * (maxMilliseconds - minMilliseconds + 1)) + minMilliseconds
            await wait(milliseconds);
        }

        if (!previousMessage) {
            message = null;
            continue;
        }

        const previousMessageHandleElement: ElementHandle<HTMLLIElement> = previousMessage;
        message = previousMessageHandleElement;
    }

    return totalDeletedMessages
}