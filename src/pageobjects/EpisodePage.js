class EpisodePage {
  page;
  titleEl;
  publishedAtEl;
  audioUrlEl;
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
    this.audioUrlEl = page.locator('#jfn-audio');
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
  async publishedAt() {
    const dateStr = await this.publishedAtEl.innerText();
    return new Date(dateStr);
  }
  async audioUrl() {
    return await this.audioUrlEl.getAttribute('src');
  }
  /** @type {() => Promise<number>} */
  async duration() {
    return await this.page.evaluate(() => {
      return document.getElementById('jfn-audio').duration;
    });
    
  }

  /**
   * @typedef {Object} Voice
   * @property {string} audioUrl
   * @property {number} duration
   */

  /** @type {() => Promise<Voice[]>} */
  async voices() {
    const voiceEls = await this.page.locator('.list-voice a').all();

    const voices = [];
    for (const [voiceIndex, voiceEl] of Object.entries(voiceEls)) {
      // 2件目からクリック・待ち
      if (parseInt(voiceIndex) > 0) {
        await voiceEl.click();
        // durationがNaNのことがあるので待ち時間を入れている
        await this.page.waitForTimeout(200);
      }

      const audioUrl = await this.audioUrl();
      const duration = await this.duration();
      voices.push({audioUrl, duration});
    }
    return voices;
  }
}

module.exports = EpisodePage;