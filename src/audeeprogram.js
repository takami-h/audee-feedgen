const { chromium } = require('playwright');

const ProgramPage = require('./pageobjects/ProgramPage');
const EpisodePage = require('./pageobjects/EpisodePage');

/**
 * @typedef Channel
 * @property {string} programUrl
 * @property {string} title
 * @property {string} description
 * @property {string} keywords
 * @property {string} author
 * @property {string} thumbnailUrl
 */

/**
 * @typedef Item
 * @property {string} episodeUrl
 * @property {string} title
 * @property {string} description
 * @property {string} publishedAt
 * @property {string} duration
 * @property {string} audioUrl
 */

/**
 * @typedef AudeeProgram
 * @property {Channel} channel
 * @property {Item[]} items
 */

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
    keywords: await programPage.keywords(),
    author: await programPage.author(),
    thumbnailUrl: await programPage.thumbnailUrl()
  };

  /** @type {Item[]} */
  const items = [];

  const urls = await programPage.allEpisodeUrls();
  console.log(`${urls.length} episodes found`);

  for (const [index, url] of Object.entries(urls)) {
    const episodePage = new EpisodePage(page);
    await episodePage.goto(url);

    items.push({
      episodeUrl: url,
      title: await episodePage.title(),
      description: await episodePage.description(),
      publishedAt: await episodePage.publishedAt(),
      duration: await episodePage.duration(),
      audioUrl: await episodePage.audioUrl()
    });

    const seq = parseInt(index) + 1;
    if (seq % 5 === 0 || seq === urls.length) {
      console.log(`${seq} / ${urls.length}`);
    }
  }
  await browser.close();

  return {
    channel, items
  };
}

module.exports = {
  findProgram
}
