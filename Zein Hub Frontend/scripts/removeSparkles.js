import fs from 'fs';
import path from 'path';

function walkDir(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const srcDir = path.resolve('src');
const files = walkDir(srcDir);
let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Remove <Sparkles ... /> JSX tags
  content = content.replace(/<Sparkles\b[^>]*\/>/g, '');
  content = content.replace(/<Sparkles\b[^>]*>.*?<\/Sparkles>/gs, '');

  // 2. Remove Sparkles from lucide-react import
  content = content.replace(/,\s*Sparkles/g, '');
  content = content.replace(/Sparkles\s*,\s*/g, '');
  content = content.replace(/{\s*Sparkles\s*}/g, '{}');

  // 3. In fallback mappings like `iconMap[...] || Sparkles` replace with `Award` or `CheckCircle2`
  content = content.replace(/\|\|\s*Sparkles/g, '|| Award');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
    console.log(`Cleaned Sparkles from: ${path.relative(process.cwd(), file)}`);
  }
}

console.log(`\n🎉 Finished! Cleaned Sparkles from ${modifiedCount} files.`);
