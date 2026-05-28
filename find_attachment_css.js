const fs = require('fs');
const css = fs.readFileSync('C:/Users/VICTUS/OneDrive/Desktop/مشاريع البرمجة/world love/styles.css', 'utf8');
const lines = css.split('\n');

lines.forEach((line, idx) => {
  if (line.includes('attachment-menu')) {
    console.log(`${idx + 1}: ${line.trim()}`);
  }
});
