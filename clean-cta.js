const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('e:/web-projects/mysisi', function(filePath) {
  if (filePath.endsWith('.html')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('team-cta')) {
      let newContent = content.replace(/<div class="team-cta">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/g, (match) => {
        let cleanMatch = match.replace(/ style="[^"]*"/g, '');
        return cleanMatch;
      });
      newContent = newContent.replace(/<section class="bottom-cta-section" style="[^"]*">/g, '<section class="bottom-cta-section">');
      
      if (content !== newContent) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log('Cleaned CTA in:', filePath);
      }
    }
  }
});
console.log('Done cleaning CTA styles!');
