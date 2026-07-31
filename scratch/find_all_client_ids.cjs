const fs = require('fs');

const transcriptPath = 'C:/Users/strev/.gemini/antigravity/brain/8527db38-ab43-421b-92b6-6b70d14753fa/.system_generated/logs/transcript_full.jsonl';
const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

console.log('Searching all steps for google client ID...');

for (const line of lines) {
  if (line.includes('googleusercontent') || line.includes('GOOGLE_CLIENT_ID') || line.includes('GOCSPX')) {
    try {
      const p = JSON.parse(line);
      console.log('Step:', p.step_index, 'Source:', p.source, 'Type:', p.type);
      const str = JSON.stringify(p);
      const matches = str.match(/([0-9a-zA-Z_-]+\.apps\.googleusercontent\.com)/g);
      if (matches) {
        console.log('  Found Client ID matches:', Array.from(new Set(matches)));
      }
      const secrets = str.match(/(GOCSPX-[0-9a-zA-Z_-]+)/g);
      if (secrets) {
        console.log('  Found Client Secret matches:', Array.from(new Set(secrets)));
      }
    } catch (e) {
      // ignore
    }
  }
}
