const fs = require('fs');

const transcriptPath = 'C:/Users/strev/.gemini/antigravity/brain/8527db38-ab43-421b-92b6-6b70d14753fa/.system_generated/logs/transcript_full.jsonl';
const targetPath = 'C:/Users/strev/.gemini/antigravity/scratch/architex-app/src/views/GroupsView.jsx';

const content = fs.readFileSync(transcriptPath, 'utf8');
const lines = content.split('\n');

for (const line of lines) {
  if (line.includes('"step_index":601')) {
    try {
      const parsed = JSON.parse(line);
      const call = parsed.tool_calls && parsed.tool_calls.find(c => c.name === 'write_to_file');
      if (call && call.args && call.args.CodeContent) {
        let code = call.args.CodeContent;
        if (code.startsWith('"') && code.endsWith('"')) {
          code = JSON.parse(code);
        }
        fs.writeFileSync(targetPath, code, 'utf8');
        console.log('Successfully restored complete untruncated GroupsView.jsx!');
        break;
      }
    } catch (e) {
      console.error('Failed parse:', e.message);
    }
  }
}
