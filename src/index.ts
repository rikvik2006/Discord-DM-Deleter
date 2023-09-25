import puppeteer from "puppeteer-extra";
import { createBrowser } from "./services/scraper";
import { config } from "dotenv";

const main = async () => {
    config()
    createBrowser();
}

main()