import fs from 'fs/promises';
import path from 'path';

async function walkDir(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const result = [];
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      result.push(...await walkDir(fullPath));
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('ui/input')) {
      result.push(fullPath);
    }
  }
  return result;
}

async function run() {
  const files = await walkDir('src');
  let count = 0;
  
  for (const file of files) {
    let content = await fs.readFile(file, 'utf8');
    let original = content;

    content = content.replace(/<input(\s|>|\n)/g, '<Input$1');
    content = content.replace(/<\/input>/g, '</Input>');
    
    content = content.replace(/<textarea(\s|>|\n)/g, '<Textarea$1');
    content = content.replace(/<\/textarea>/g, '</Textarea>');
    
    // Attempt to convert type="password" to PasswordInput
    content = content.replace(/<Input([^>]*?)type=["']password["']([^>]*?)>/g, '<PasswordInput$1$2>');
    content = content.replace(/<\/PasswordInput>/g, '</PasswordInput>'); // unlikely since self-closing

    // Convert type="search" to SearchInput
    content = content.replace(/<Input([^>]*?)type=["']search["']([^>]*?)>/g, '<SearchInput$1$2>');

    if (content !== original) {
      // Add imports
      const needsInput = content.includes('<Input');
      const needsTextarea = content.includes('<Textarea');
      const needsPassword = content.includes('<PasswordInput');
      const needsSearch = content.includes('<SearchInput');
      
      const importsToAdd = [];
      if (needsInput) importsToAdd.push('Input');
      if (needsTextarea) importsToAdd.push('Textarea');
      if (needsPassword) importsToAdd.push('PasswordInput');
      if (needsSearch) importsToAdd.push('SearchInput');
      
      if (importsToAdd.length > 0 && !content.includes('@/components/ui/input')) {
        const importStr = `import { ${importsToAdd.join(', ')} } from '@/components/ui/input';\n`;
        // Insert after first line or last import
        const lines = content.split('\n');
        let lastImport = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) {
            lastImport = i;
          }
        }
        
        if (lastImport > -1) {
          lines.splice(lastImport + 1, 0, importStr);
        } else {
          lines.splice(1, 0, importStr); // After 'use client'
        }
        content = lines.join('\n');
      }
      
      await fs.writeFile(file, content);
      count++;
    }
  }
  console.log(`Migrated ${count} files.`);
}

run().catch(console.error);
