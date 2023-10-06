import { DiscordUser } from "./discordUser";

export interface DMChannels {
    id: string;
    type: number;
    last_message_id: string;
    flags: number;
    recipients: DiscordUser[]
}