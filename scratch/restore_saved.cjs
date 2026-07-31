const fs = require('fs');

const transcriptPath = 'C:/Users/strev/.gemini/antigravity/brain/8527db38-ab43-421b-92b6-6b70d14753fa/.system_generated/logs/transcript_full.jsonl';
const targetPath = 'C:/Users/strev/.gemini/antigravity/scratch/architex-app/src/views/SavedView.jsx';

const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('export default function SavedView')) {
    try {
      const parsed = JSON.parse(line);
      if (parsed.tool_calls) {
        for (const tc of parsed.tool_calls) {
          if ((tc.name === 'write_to_file' || tc.name === 'replace_file_content') && tc.args.TargetFile.includes('SavedView.jsx')) {
            console.log('Found SavedView step:', parsed.step_index);
            let code = tc.args.CodeContent;
            if (code.startsWith('"') && code.endsWith('"')) {
              code = JSON.parse(code);
            }
            fs.writeFileSync(targetPath, code, 'utf8');
            console.log('Successfully restored SavedView.jsx!');
            break;
          }
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }
}
