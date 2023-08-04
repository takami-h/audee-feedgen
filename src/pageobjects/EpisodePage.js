class EpisodePage {
  page;
  titleEl;
  publishedAtEl;
  audioUrlEl;

  /**
   * 
   * @param {import('playwright').Page} page 
   */
  constructor(page) {
    this.page = page;

    this.titleEl = page.locator('.ttl-inner');
    this.publishedAtEl = page.locator('.txt-date-01');
    this.audioUrlEl = page.locator('#jfn-audio');
  }

  async goto(episodeUrl) {
    await this.page.goto(episodeUrl);
  }

  async title() {
    return (await this.titleEl.innerText()).split('\n')[1];
  }
  async publishedAt() {
    const dateStr = await this.publishedAtEl.innerText();
    const date = new Date(dateStr);
    return date.toUTCString();
  }
  async audioUrl() {
    return await this.audioUrlEl.getAttribute('src');
  }
  async duration() {
    return await this.page.evaluate(() => {
      return document.getElementById('jfn-audio').duration;
    });
    
  }
}

module.exports = EpisodePage;