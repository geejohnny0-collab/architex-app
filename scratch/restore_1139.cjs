const fs = require('fs');

const transcriptPath = 'C:/Users/strev/.gemini/antigravity/brain/8527db38-ab43-421b-92b6-6b70d14753fa/.system_generated/logs/transcript_full.jsonl';
const targetPath = 'C:/Users/strev/.gemini/antigravity/scratch/architex-app/src/components/GoogleOAuthModal.jsx';

const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('"step_index":1139')) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if (tc.name === 'write_to_file' && tc.args.TargetFile.includes('GoogleOAuthModal.jsx')) {
            let code = tc.args.CodeContent;
            if (code.startsWith('"') && code.endsWith('"')) {
              code = JSON.parse(code);
            }
            fs.writeFileSync(targetPath, code, 'utf8');
            console.log('Successfully restored exact GoogleOAuthModal.jsx from step 1139!');
            break;
          }
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}
