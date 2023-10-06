import axios from "axios"
import { DMChannels } from "../interfaces/DMChannel"

export const getDMChannelsIds = async (token: string): Promise<string[]> => {
    const discordAPIBaseURL = "https://discord.com/api/"

    const { data: DMChannels } = await axios.get<DMChannels[]>(`${discordAPIBaseURL}users/@me/channels`, {
        headers: {
            Authorization: token
        }
    })

    let channelsIds: string[] = []

    DMChannels.forEach(DMChannel => channelsIds.push(DMChannel.id))

    return channelsIds
}