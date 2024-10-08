import { ElementHandle, JSHandle, Page } from "puppeteer";
import { installMouseHelper } from "../helpers/installMouseHelper";

declare global {
    interface CSSStyleDeclaration {
        zoom: string;
    }
}

export const deleteMessagesElementSibling = async (
    page: Page,
    channelId: string
): Promise<number> => {
    const userId = process.env.USER_ID;
    let totalDeletedMessages = 0;

    // page.setViewport({ width: 2560, height: 1440 })
    await page.evaluate((zoom: string) => {
        document.body.style.zoom = zoom;
    }, "0.8");

    await installMouseHelper(page);

    await page.waitForSelector(".childWrapper_f90abb");

    if (!channelId) {
        throw new Error(
            "You need to specify some DM chat where delete messages"
        );
    }

    if (!userId) {
        throw new Error("You need to specify the ID of the owner user");
    }

    await page.evaluate((_channelId) => {
        location.assign(`https://discord.com/channels/@me/${_channelId}`);
    }, channelId);

    await page.waitForSelector(".childWrapper_f90abb");

    const wait = (ms: number) =>
        new Promise((resolve) => setTimeout(() => resolve("Ok"), ms));
    await wait(5000);

    await page.waitForSelector("ol.scrollerInner_e2e187");

    let messages = await page.$$(
        "ol.scrollerInner_e2e187 li.messageListItem_d5deea"
    );

    if (!messages) {
        throw new Error("User messages array is null");
    }

    if (messages.length == 0) {
        return totalDeletedMessages;
    }
    messages.reverse();

    let message: ElementHandle<HTMLLIElement> | null = messages[0];
    while (message) {
        const getPreviouseMessage = async (
            message: ElementHandle<HTMLLIElement>
        ): Promise<ElementHandle<HTMLLIElement> | null> => {
            /* IMPORTANT: Whe use evaluateHandle, sice we are returning a DOM Node (Element). evaluate by default if the returned element is a primitive type, it gets automatically converted by Puppeteer to a primitive type in the script context. 
            If the script returns an object, Puppeteer serializes it to a JSON and reconstructs it on the script side. This process might not always yield correct results, for example, when you return a DOM node
            In other words all data returned by evaluate get converted to string, and after get converted by Puppetear into primitive type or object. For this reason you can't return DOM Node with evaluate
            */
            const previousMessage: ElementHandle<Element> | JSHandle<null> =
                await message.evaluateHandle((message: HTMLLIElement) => {
                    try {
                        let previousMessage = message.previousElementSibling;
                        if (!previousMessage) return null;

                        // not(previousMessage.tagName == "LI")
                        while (previousMessage.tagName != "LI") {
                            // console.log(`🪫 previus message ${previousMessage}`);
                            previousMessage =
                                previousMessage.previousElementSibling;
                            if (!previousMessage) return null;
                        }

                        // console.log("🪫 previus message is LI");
                        // message.style.border = "1px solid red";
                        return previousMessage;
                    } catch (err) {
                        console.log(
                            "❌ [Fetching Previus Message] callback error"
                        );
                        return null;
                    }
                });

            // if type is JSHandle<null> return null, else return HTMLLIElement
            if (previousMessage.asElement() == null) return null;
            const previousMessageHandleElement =
                previousMessage.asElement() as ElementHandle<HTMLLIElement>;
            return previousMessageHandleElement;
        };

        const messageBoudingBox = await message.boundingBox();
        if (!messageBoudingBox) continue;

        const messageX = messageBoudingBox.x + messageBoudingBox.width / 2;
        const messageY = messageBoudingBox.y + messageBoudingBox.height / 2;

        await page.mouse.move(messageX, messageY);
        await wait(250); // Adding some delay to give time to discord to register the hover event
        await page.keyboard.down("ShiftLeft");
        await wait(100);

        // Add some orizzontal noise to the mouse pointer
        const noise = Math.round(Math.random() * 5);
        await page.mouse.move(messageX + noise, messageY);
        await page.mouse.move(messageX - noise, messageY);
        const deleteButtons = await message.$$(
            ".buttonContainer_f9f2ca .buttons_d5deea div.buttonsInner_d5deea div.button_f7e168.dangerous_f7e168"
        );

        if (!deleteButtons || deleteButtons.length == 0) {
            console.log(
                `⚠️ [${channelId}] Not a message from the user, skipping...`
            );
            await page.keyboard.up("ShiftLeft");

            const previousMessage = await getPreviouseMessage(message);

            if (!previousMessage) {
                message = null;
                continue;
            }

            const previousMessageHandleElement: ElementHandle<HTMLLIElement> =
                previousMessage;
            const previousMessageBoundingBox =
                await previousMessageHandleElement.boundingBox();

            if (!previousMessageBoundingBox) continue;

            const previousMessageY =
                previousMessageBoundingBox.y +
                previousMessageBoundingBox.height / 2;

            const deltaHeight = messageY - previousMessageY;

            await page.evaluate((_deltaHeight) => {
                const scroller =
                    document.querySelector<HTMLElement>(".scroller_e2e187");
                if (!scroller) return;

                scroller.scrollBy(0, -_deltaHeight);
            }, deltaHeight);

            message = previousMessageHandleElement;
            continue;
        }

        // While condition update
        const previousMessage = await getPreviouseMessage(message);

        const deleteButtonsHandleElements = deleteButtons;

        for (let deleteButton of deleteButtonsHandleElements) {
            const deleteButtonBoundingBox = await deleteButton.boundingBox();
            if (!deleteButtonBoundingBox) continue;

            const x =
                deleteButtonBoundingBox.x + deleteButtonBoundingBox.width / 2;
            const y =
                deleteButtonBoundingBox.y + deleteButtonBoundingBox.height / 2;

            await page.mouse.move(x, y);
            await page.mouse.click(x, y);
            await wait(250);
            await page.keyboard.up("ShiftLeft");
            totalDeletedMessages++;
            console.log(`✅ [${channelId}] Succesfuly deleated the message`);

            await page.evaluate((_messageBoudingBox) => {
                const scroller =
                    document.querySelector<HTMLElement>(".scroller_e2e187");
                if (!scroller) return;

                scroller.scrollBy(0, -_messageBoudingBox.height);
            }, messageBoudingBox);

            const minMilliseconds = 1500;
            const maxMilliseconds = 10000;
            const milliseconds =
                Math.floor(
                    Math.random() * (maxMilliseconds - minMilliseconds + 1)
                ) + minMilliseconds;
            await wait(milliseconds);
        }

        if (!previousMessage) {
            message = null;
            continue;
        }

        const previousMessageHandleElement: ElementHandle<HTMLLIElement> =
            previousMessage;
        message = previousMessageHandleElement;
    }

    return totalDeletedMessages;
};
