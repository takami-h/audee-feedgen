const { findProgram } = require('./audeeprogram');
const { writeFeed } = require('./feedwriter');

const validProgramUrlPattern = new RegExp('^https://audee.jp/program/show/.+$');

async function main(args) {
  const programUrl = args[0];
  const feedFilename = args[1] || 'audee-podcast.xml';
  if (!programUrl || !validProgramUrlPattern.test(programUrl)) {
    console.error('specify url like https://audee.jp/program/show/12345');
    process.exit(1);
    return;
  }

  const audeeProgram = await findProgram(programUrl);

  await writeFeed(feedFilename, audeeProgram);
}

main(process.argv.slice(2));
