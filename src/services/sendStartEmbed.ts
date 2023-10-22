import { EmbedBuilder } from "@discordjs/builders"
import axios from "axios";

export const sendStartEmbed = async () => {
    const deleterInstanceName = process.env.INSTANCE_NAME ?? "No instance name";
    const startLogsWebhook = process.env.START_LOGS_WEBHOOK

    if (startLogsWebhook) {
        console.log(`🚀 ${deleterInstanceName} has just started`)

        const startEmbed = new EmbedBuilder()
            .setTitle("DM Deleater Just Started")
            .setAuthor({ name: deleterInstanceName, iconURL: "https://imgur.com/ishtmHQ.png" })
            .setTimestamp();

        await axios.post(startLogsWebhook, {
            embeds: [startEmbed]
        })
    } else {
        console.log(`🚀 ${deleterInstanceName} has just started`)
    }

}