const fs = require('fs');
const path = require('path');
const rootDir = path.resolve(__dirname, '..');
const blogJsonPath = path.join(rootDir, 'assets', 'data', 'blog.json');
// Read JSON
const rawData = fs.readFileSync(blogJsonPath, 'utf8');
const blogData = JSON.parse(rawData);
// Sort array by date descending
const sortedData = blogData.sort((a, b) => new Date(b.date) - new Date(a.date));
const formatDate = (dateString) => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};
// Generate HTML for blog/index.html (Featured Post Style)
const createFeaturedCardHTML = (post) => {
  return `          <article class="featured-post">
            <div class="featured-image">
              <img src="${post.img}" alt="${post.title}" loading="lazy">
              <span class="post-category">${post.category}</span>
            </div>
            <div class="featured-content">
              <time datetime="${post.date}">${formatDate(post.date)}</time>
              <h3>${post.title}</h3>
              <p>${post.summary}</p>
              <a href="${post.link}" class="link-arrow">Baca Selengkapnya</a>
            </div>
          </article>`;
};
// Generate HTML for blog/artikel/index.html and blog/tips-website/index.html (Artikel Card Style)
const createArtikelCardHTML = (post) => {
  const readingTime = post.readingTime || "5 min read";
  const tags = post.tags || ["Website", "Digital", "Marketing"];
  const tagsHtml = tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                  ');
  return `          <article class="artikel-card">
            <img src="${post.img}" alt="${post.title}" class="artikel-card-img" loading="lazy">
            <div class="artikel-card-content">
              <div class="artikel-header">
                <h3>${post.title}</h3>
                <div class="artikel-meta">
                  <time datetime="${post.date}">${formatDate(post.date)}</time>
                  <span class="reading-time">${readingTime}</span>
                </div>
              </div>
              <p>${post.summary}</p>
              <div class="artikel-tags">
                  ${tagsHtml}
              </div>
              <a href="${post.link}" class="link-arrow">Baca Selengkapnya</a>
            </div>
          </article>`;
};

function injectIntoFile(filePath, startMarker, endMarker, contentToInject) {
  const fullPath = path.join(rootDir, filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  const startIndex = content.indexOf(startMarker);
  const endIndex = content.indexOf(endMarker, startIndex);
  if (startIndex === -1 || endIndex === -1) {
    void(`Markers not found in ${filePath}`);
    return;
  }
  const pre = content.substring(0, startIndex + startMarker.length);
  const post = content.substring(endIndex);
  const newContent = pre + '\n' + contentToInject + '\n' + ' '.repeat(10) + post;
  fs.writeFileSync(fullPath, newContent, 'utf8');
  void(`Successfully injected into ${filePath}`);
}
// 1. Process blog/index.html (Recent 3 of each)
const artikelRecent = sortedData.filter(post => post.category === 'Artikel').slice(0, 3);
const tipsRecent = sortedData.filter(post => post.category === 'Tips & Trik').slice(0, 3);
const artikelRecentHTML = artikelRecent.map(createFeaturedCardHTML).join('\n');
const tipsRecentHTML = tipsRecent.map(createFeaturedCardHTML).join('\n');
injectIntoFile('blog/index.html', '<!-- BLOG_INJECT_START: artikel_recent -->', '<!-- BLOG_INJECT_END -->', artikelRecentHTML);
injectIntoFile('blog/index.html', '<!-- BLOG_INJECT_START: tips_recent -->', '<!-- BLOG_INJECT_END -->', tipsRecentHTML);
// 2. Process blog/artikel/index.html (All Artikel)
const artikelAll = sortedData.filter(post => post.category === 'Artikel');
const artikelAllHTML = artikelAll.map(createArtikelCardHTML).join('\n');
injectIntoFile('blog/artikel/index.html', '<!-- BLOG_INJECT_START: artikel_all -->', '<!-- BLOG_INJECT_END -->', artikelAllHTML);
// 3. Process blog/tips-website/index.html (All Tips)
const tipsAll = sortedData.filter(post => post.category === 'Tips & Trik');
const tipsAllHTML = tipsAll.map(createArtikelCardHTML).join('\n');
injectIntoFile('blog/tips-website/index.html', '<!-- BLOG_INJECT_START: tips_all -->', '<!-- BLOG_INJECT_END -->', tipsAllHTML);
void('Blog generation complete!');