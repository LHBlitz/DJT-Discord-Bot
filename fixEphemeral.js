import fs from 'fs';
import path from 'path';

const COMMANDS_DIR = path.join(process.cwd(), 'commands');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if nothing to replace
  if (!content.includes('ephemeral: true')) return;

  // Replace all "ephemeral: true" with "flags: MessageFlags.Ephemeral"
  content = content.replace(/ephemeral:\s*true/g, 'flags: MessageFlags.Ephemeral');

  // Ensure import exists
  if (!content.includes('MessageFlags')) {
    // If file already uses ES imports
    if (/^import /m.test(content)) {
      content = `import { MessageFlags } from 'discord.js';\n` + content;
    } else {
      // For CommonJS files
      content = `const { MessageFlags } = require('discord.js');\n` + content;
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Fixed: ${filePath}`);
}

function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'deploy'].includes(entry.name)) continue;
      walkDir(entryPath);
    } else if (entry.name.endsWith('.js')) {
      fixFile(entryPath);
    }
  }
}

console.log('🔍 Scanning for ephemeral: true in', COMMANDS_DIR);
walkDir(COMMANDS_DIR);
console.log('🎉 All done! Ephemeral replies converted to MessageFlags.Ephemeral.');