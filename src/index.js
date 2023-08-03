const fs = require('fs');
const { chromium } = require('playwright');

const ProgramPage = require('./pageobjects/ProgramPage');
const EpisodePage = require('./pageobjects/EpisodePage');

/* 
 * TODO
 * - audeeの番組トップページのURLを受け取る。
 * - 番組トップからfeed用の情報を抜く。
 *   - title, description, keyword, author, thumbnail url, 
 * - 番組トップの下部の音声一覧から、エピソードのURLを抜く。ページ送りがあるので、最後のページまで抜く。
 * - エピソードページからfeed用の情報を抜く。
 *   - title, pubDate, mp3 url, duration, 
 * - feed生成
 */

async function main(args) {
  const programUrl = args[0];
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const programPage = new ProgramPage(page);
  await programPage.goto(programUrl);
  const channel = {
    title: await programPage.title(),
    description: await programPage.description(),
    keywords: await programPage.keywords(),
    author: await programPage.author(),
    thumbnailUrl: await programPage.thumbnailUrl()
  };

  /**
   * @typedef Item
   * @property {string} episodeUrl
   * @property {string} title
   * @property {string} publishedAt
   * @property {string} audioUrl
   */

  /** @type{Item[]} */
  const items = [];
  const urls = await programPage.allEpisodeUrls();

  for (const url of urls) {
    console.log(`start ${url}`);
    const episodePage = new EpisodePage(page);
    await episodePage.goto(url);

    items.push({
      episodeUrl: url,
      title: await episodePage.title(),
      publishedAt: await episodePage.publishedAt(),
      audioUrl: await episodePage.audioUrl()
    });
  }
  await browser.close();

  const itemsFeed = items.map(i => {
    return `
  <item>
    <title>${i.title}</title>
    <link>${i.episodeUrl}</link>
    <pubDate>${i.publishedAt}</pubDate>
    <description>${i.title}</description>
    <guid isPermaLink="true">${i.episodeUrl}</guid>
    <enclosure url="${i.audioUrl}" length="0" type="audio/mp3"/>
    <itunes:author>${channel.author}</itunes:author>
    <itunes:subtitle>${i.title}</itunes:subtitle>
    <itunes:explicit>no</itunes:explicit>
    <media:thumbnail url="${channel.thumbnailUrl}"/>
  </item>`;
  }).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xml:lang="ja">
    <channel>
      <link>${programUrl}</link>
      <title>${channel.title}</title>
      <description>${channel.description}</description>
      <media:keywords>${channel.keywords}</media:keywords>
      <language>ja</language>
      <itunes:subtitle>${channel.description}</itunes:subtitle>
      <itunes:author>${channel.author}</itunes:author>
      <itunes:summary>${channel.description}</itunes:summary>
      <itunes:keywords>${channel.keywords}</itunes:keywords>
      <itunes:owner>
        <itunes:name>${channel.author}</itunes:name>
      </itunes:owner>
      <itunes:image href="${channel.thumbnailUrl}" />
      <itunes:explicit>no</itunes:explicit>
      ${itemsFeed}
    </channel>
  </rss>
    `;

  await fs.writeFileSync('audee-podcast.xml', feed);
}

main(process.argv.slice(2));
