import puppeteer from "puppeteer-extra";
import { createBrowser } from "./services/scraper";
import { sendStartEmbed } from "./services/sendStartEmbed";
import { config } from "dotenv";

const main = async () => {
    config()
    await sendStartEmbed()
    await createBrowser();
}

try {
    main()
} catch (err) {
    console.log(err);
}