import puppeteer, { Browser } from "puppeteer";

// ─────────────────────────────────────────────────────────────
// Shared Browser Instance
// ─────────────────────────────────────────────────────────────
// Launching a new Chromium browser per request is expensive.
// Reuse a single browser instance across requests, and only
// open/close a new "page" (tab) per PDF.
// ─────────────────────────────────────────────────────────────

let browserInstance: Browser | null = null;

const getBrowser = async (): Promise<Browser> => {
    if (browserInstance && browserInstance.connected) {
        return browserInstance;
    }

    browserInstance = await puppeteer.launch({
        headless: true,
        executablePath: await puppeteer.executablePath(),
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });

    return browserInstance;
};

// ─────────────────────────────────────────────────────────────
// Generate PDF Buffer from HTML
// ─────────────────────────────────────────────────────────────

export const generatePdfFromHtml = async (
    html: string
): Promise<Buffer> => {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(html, {
            waitUntil: "load",
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "0px",
                bottom: "0px",
                left: "0px",
                right: "0px",
            },
        });

        return Buffer.from(pdfBuffer);
    } finally {
        await page.close();
    }
};

// ─────────────────────────────────────────────────────────────
// Graceful Shutdown (call this on server shutdown / SIGTERM)
// ─────────────────────────────────────────────────────────────

export const closeBrowser = async (): Promise<void> => {
    if (browserInstance) {
        await browserInstance.close();
        browserInstance = null;
    }
};