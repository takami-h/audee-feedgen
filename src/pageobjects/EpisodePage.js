const {Duration} = require('luxon');

class EpisodePage {
  page;
  titleEl;
  publishedAtEl;
  jsonLd;
  descriptionEl;

  /**
   * 
   * @param {import('playwright').Page} page 
   */
  constructor(page) {
    this.page = page;

    this.titleEl = page.locator('.ttl-inner');
    this.descriptionEl = page.locator('.txt-detail');
    this.publishedAtEl = page.locator('.txt-date-01');
    this.jsonLd = page.locator('script[type="application/ld+json"]').nth(1);
  }

  async goto(episodeUrl) {
    await this.page.goto(episodeUrl);
  }

  async title() {
    return (await this.titleEl.innerText()).split('\n')[1];
  }
  async description() {
    return (await this.descriptionEl.innerHTML());
  }

  /**
   * @typedef {Object} Voice
   * @property {string} audioUrl
   * @property {number} duration
   * @property {Date} publishedAt
   */

  /** @type {() => Promise<Voice[]>} */
  async voices() {
    const json = await this.jsonLd.innerText()
    /** @type {Object[]} */
    const records = JSON.parse(json);
    const podcastEpisode = records.find(each => each['@type'] === 'PodcastEpisode');
    return podcastEpisode.audio.map(each => {
      return {
        audioUrl: each.contentUrl,
        duration: Duration.fromISO(each.duration).as('seconds'),
        publishedAt: new Date(each.uploadDate)
      };
    });
  }
}

module.exports = EpisodePage;