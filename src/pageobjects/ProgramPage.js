
class ProgramPage {
  page;
  titleEl;
  descriptionEl;
  keywordsEl;
  authorEl;
  thumbnailUrlEl;
  urlsAtPageEl;
  nextLinkEl;
  
  /**
   * 
   * @param {import('playwright').Page} page 
   */
  constructor(page) {
    this.page = page;

    this.titleEl = page.locator('#analysis_program-top');
    this.descriptionEl = page.locator('.box-program-txt');
    this.keywordsEl = page.locator('meta[name=keywords]');
    this.authorEl = page.locator('meta[name=smartbanner\\:author]');
    this.thumbnailUrlEl = page.locator('.box-program-img-wrapper img');

    this.urlsAtPageEl = page.locator('#content_tab_voice .box-article a');
    this.nextLinkEl = page.locator('#content_tab_voice .box-pagination-item:last-child a');
  }

  async goto(programUrl) {
    await this.page.goto(programUrl);
  }

  async title() {
    return await this.titleEl.innerText();
  }
  async description() {
    return await this.descriptionEl.innerText();
  }
  async keywords() {
    return await this.keywordsEl.getAttribute('content');
  }
  async author() {
    return await this.authorEl.getAttribute('content');
  }
  async thumbnailUrl() {
    return await this.thumbnailUrlEl.getAttribute('src');
  }

  /** @type {() => Promise<string[]>} */
  async allEpisodeUrls() {
    await this.page.locator('#tab_voice').click();

    let urls = [];
    while (true) {
      const urlsAtPage = await Promise.all((await this.urlsAtPageEl.all()).map(a => a.getAttribute('href')));
      urls = urls.concat(urlsAtPage);

      // ページ送りの次へ（>）リンクが無くなるまで1ページずつ進める
      if (await this.nextLinkEl.isVisible()) {
        await this.nextLinkEl.click();
        // ページがロードされるまで待つ
        await this.page.waitForTimeout(500);
      } else {
        break;
      }
    }

    return urls;
  }
}

module.exports = ProgramPage;