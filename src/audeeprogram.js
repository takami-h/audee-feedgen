const { chromium } = require('playwright');

const ProgramPage = require('./pageobjects/ProgramPage');
const EpisodePage = require('./pageobjects/EpisodePage');

/**
 * @typedef Channel
 * @property {string} programUrl
 * @property {string} title
 * @property {string} description
 * @property {string} author
 * @property {string} thumbnailUrl
 */

/**
 * @typedef Item
 * @property {string} episodeUrl
 * @property {string} title
 * @property {string} description
 * @property {Date} publishedAt
 * @property {number} duration
 * @property {string} audioUrl
 */

/**
 * @typedef AudeeProgram
 * @property {Channel} channel
 * @property {Item[]} items
 */

/** @type {number} */
const BATCH_SIZE = 20;

/**
 * fetch audee program data.
 * @param {string} programUrl 
 * @returns {Promise<AudeeProgram>} audee program data
 */
async function findProgram(programUrl) {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const programPage = new ProgramPage(page);
  await programPage.goto(programUrl);

  /** @type {Channel} */
  const channel = {
    programUrl,
    title: await programPage.title(),
    description: await programPage.description(),
    author: await programPage.author(),
    thumbnailUrl: await programPage.thumbnailUrl()
  };

  /** @type {Item[]} */
  const items = [];

  const indexUrls = (await programPage.allEpisodeUrls()).map((url, index) => {return {index, url}});
  const episodeCount = indexUrls.length;
  console.log(`${episodeCount} episodes found`);

  const processedUrls = [];
  while (indexUrls.length > 0) {
    const batchIndexUrls = indexUrls.splice(0, BATCH_SIZE);
    /** @type {Promise<Item[]>[]} */
    const fetchings = batchIndexUrls.map(indexUrl => {
      return fetchItems(indexUrl, context);
    });
    const itemsFetched = await Promise.all(fetchings).then(i => i.flat());
    items.push(...itemsFetched);

    processedUrls.push(...batchIndexUrls);
    console.log(`${processedUrls.length} / ${episodeCount}`);
  }
  await browser.close();

  return {
    channel, items
  };
}

/** @type {(indexUrl: {index: number, url: string}, context: import('playwright').BrowserContext) => Promise<Item[]>} */
async function fetchItems({index, url}, context) {
  /** @type {Item[]} */
  const items = [];

  const page = await context.newPage();
  const episodePage = new EpisodePage(page);
  await episodePage.goto(url);
  const voices = await episodePage.voices();
  for (const [voiceIndex, voice] of Object.entries(voices)) {

    items.push({
      episodeUrl: url,
      title: await episodePage.title(),
      description: await episodePage.description(),
      publishedAt: voice.publishedAt,
      duration: voice.duration,
      audioUrl: voice.audioUrl
    });
  }

  await page.close();
  return items;
}

module.exports = {
  findProgram
}
