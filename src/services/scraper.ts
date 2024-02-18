import puppeteer from "puppeteer-extra"
import StealthPlugin from "puppeteer-extra-plugin-stealth"
import { EmbedBuilder } from "@discordjs/builders";
import { loginToDiscord } from "./loginToDiscord";
import { deleteMessagesElementSibling } from "./deleteMessagesElementSibling";
import { getDMChannelsIds } from "./getDMChannels";
import axios from "axios";
import { closeAboutBlank } from "../helpers/closeAboutBlank";
import { intervallScreenshot } from "../helpers/intervallScreenShoots";

export const createBrowser = async () => {
    let browser
    const isProductionEnv = process.env.PRODUCTION;
    const enableScreenshootEnv = process.env.INTERVALL_SCREENSHOT;
    const executablePath = process.env.EXECUTABLE_PATH;
    const userDataDir = process.env.USER_DATA_DIR;
    let excludeChannelsIds = process.env.EXCLUDE_CHANNELS_IDS;
    const selectChannelsIds = process.env.SELECT_CHANNELS_IDS ?? "";
    const errorLogsWebhook = process.env.ERROR_LOGS_WEBHOOK;
    const statsLogsWebhook = process.env.STATS_LOGS_WEBHOOK;
    const deleterInstanceName = process.env.INSTANCE_NAME ?? "No instance name";


    if (isProductionEnv == undefined) {
        throw new Error("You need to specirty a deploymed status (Production or Developing). Expected: Boolean")
    }

    if (!executablePath) {
        throw new Error("You need to specify an executable path")
    }

    if (!userDataDir) {
        throw new Error("You need to specify a user data dir")
    }

    if (!excludeChannelsIds) {
        excludeChannelsIds = "";
    }

    const isProduction = isProductionEnv == "true" ? true : false
    const enableScreenshoot = enableScreenshootEnv == "true" ? true : false

    let totalChatDeleted = 0
    let totalDeletedMessages = 0
    try {
        puppeteer.use(StealthPlugin());
        browser = await puppeteer.launch({
            executablePath: executablePath,
            userDataDir: userDataDir,
            headless: isProduction ? "new" : false,
            devtools: !isProduction,
            defaultViewport: isProduction ? { width: 2560, height: 1440 } : null,
            args: ["--start-maximized"]
        })

        const page = await browser.newPage();

        page.on('console', (msg) => {
            for (let i = 0; i < msg.args().length; ++i)
                console.log(`${i}: ${msg.args()[i]}`);
        });

        const pages = await browser.pages()
        await closeAboutBlank(pages)

        const token = process.env.DISCORD_USER_TOKEN

        if (!token) {
            throw new Error("You need to specify a user token");
        }

        await page.goto("https://discord.com/login")

        await loginToDiscord(page, token)

        let channelsIds: string[] = []
        if (selectChannelsIds.length > 0) {
            selectChannelsIds.split(",").forEach(id => channelsIds.push(id));
        } else {
            channelsIds = await getDMChannelsIds(token)
        }

        const excludeChannelsIdsArray = excludeChannelsIds.split(",");

        if (enableScreenshoot) {
            intervallScreenshot(page, 700)
        }

        for (let channelId of channelsIds) {
            if (excludeChannelsIdsArray.includes(channelId)) {
                console.log(`*️⃣ Excluding channel id ${channelId}`)
                continue
            }

            const chatDeletedMessages = await deleteMessagesElementSibling(page, channelId);
            totalChatDeleted++
            totalDeletedMessages += chatDeletedMessages
        }

        const table = {
            "🔢 Deleted messages": totalDeletedMessages,
            "🔢 Deleted chats": totalChatDeleted
        }

        if (errorLogsWebhook && statsLogsWebhook) {
            console.log(`✅ Finished \n🔢Total deleted messages: ${totalDeletedMessages}\n🔢 Deleted chats: ${totalChatDeleted}`)
            console.table(table)

            const statsEmbed = new EmbedBuilder()
                .setTitle("🔢 Last deletion stats")
                .setAuthor({ name: deleterInstanceName, iconURL: "https://imgur.com/ishtmHQ.png" })
                .setDescription("Successfully completed generation, sending deletion statistics")
                .addFields(
                    { name: "Deleted messages", value: totalDeletedMessages.toString() },
                    { name: "Deleted chats", value: totalChatDeleted.toString() }
                )
                .setTimestamp()

            await axios.post(statsLogsWebhook, {
                embeds: [statsEmbed]
            });
        } else {
            console.log(`✅ Finished (not sending embed) \n🔢 Total deleted messages: ${totalDeletedMessages}\n🔢 Deleted chats: ${totalChatDeleted}`)
            console.table(table, ["Type", "Quantity"])
        }
    } catch (err) {
        console.log(err);

        const table = {
            "🔢 Deleted messages": totalDeletedMessages,
            "🔢 Deleted chats": totalChatDeleted
        }
        if (errorLogsWebhook && statsLogsWebhook) {
            console.log(`❌ Crashed \n🔢Total deleted messages: ${totalDeletedMessages}\n🔢 Deleted chats: ${totalChatDeleted}`)
            console.table(table)

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ An erorr occured")
                .setAuthor({ name: deleterInstanceName, iconURL: "https://imgur.com/ishtmHQ.png" })
                .setTimestamp()

            const statsEmbed = new EmbedBuilder()
                .setTitle("🔢 Last deletion stats")
                .setAuthor({ name: deleterInstanceName, iconURL: "https://imgur.com/ishtmHQ.png" })
                .setDescription(`THIS IS GENERATED BY AN ERROR, THE DELETION IS NOT FINISHED`)
                .addFields(
                    { name: "Deleted messages", value: totalDeletedMessages.toString() },
                    { name: "Deleted chats", value: totalChatDeleted.toString() }
                )
                .setTimestamp()

            await axios.post(errorLogsWebhook, {
                embeds: [errorEmbed]
            });
            await axios.post(statsLogsWebhook, {
                embeds: [statsEmbed]
            });
        } else {
            console.log(`❌ Crashed (not sending embed) \n🔢Total deleted messages: ${totalDeletedMessages}\n🔢 Deleted chats: ${totalChatDeleted}`)
            console.table(table, ["Type", "Quantity"])
        }

    } finally {
        await browser?.close()
    }
}