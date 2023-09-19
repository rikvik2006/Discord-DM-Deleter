import puppeteer from "puppeteer-extra";
import { createBrowser } from "./services/scraper";

const main = async () => {
    createBrowser();
}

main()