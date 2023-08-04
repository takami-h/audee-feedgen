const fs = require('fs');


/**
 * write RSS Feed into file.
 * @param {string} filename 
 * @param {import('./audeeprogram').AudeeProgram} audeeProgram
 */
async function writeFeed(filename, {channel, items}) {
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
    <itunes:duration>${i.duration}</itunes:duration>
    <itunes:explicit>no</itunes:explicit>
    <media:thumbnail url="${channel.thumbnailUrl}"/>
  </item>`;
  }).join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:media="http://search.yahoo.com/mrss/" xml:lang="ja">
    <channel>
      <link>${channel.programUrl}</link>
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

  console.log(`save feed as '${filename}'`);
  await fs.writeFileSync(filename, feed);
}

module.exports = {
  writeFeed
}