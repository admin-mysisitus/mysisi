document.addEventListener('DOMContentLoaded', () => {
  const ctaContainers = document.querySelectorAll('.global-bottom-cta');
  
  ctaContainers.forEach(container => {
    const title = container.getAttribute('data-title') || 'Wujudkan Website Impian Bisnis Anda Bersama Tim Kami.';
    const desc = container.getAttribute('data-desc') || 'Amankan slot konsultasi gratis Anda hari ini dan mari diskusikan solusi digital terbaik untuk meningkatkan kredibilitas bisnis Anda dengan website berkinerja tinggi.';
    
    const btn1Text = container.getAttribute('data-btn1-text') || 'Konsultasi Gratis via WA';
    const btn1Url = container.getAttribute('data-btn1-url') || 'https://wa.me/62882010067695';
    const btn1Class = container.getAttribute('data-btn1-class') || 'btn btn-primary';
    const btn1Target = container.getAttribute('data-btn1-target') || '';
    
    const btn2Text = container.getAttribute('data-btn2-text') || 'Lihat Semua Layanan';
    const btn2Url = container.getAttribute('data-btn2-url') || '/layanan/website/';
    const btn2Class = container.getAttribute('data-btn2-class') || 'btn btn-secondary';
    const btn2Target = container.getAttribute('data-btn2-target') || '';
    
    const target1Attr = btn1Target ? `target="${btn1Target}" rel="noopener noreferrer"` : '';
    const target2Attr = btn2Target ? `target="${btn2Target}" rel="noopener noreferrer"` : '';
    
    const html = `
      <section class="bottom-cta-section">
        <div class="container">
          <div class="team-cta">
            <div class="team-cta-content">
              <h2>${title}</h2>
              <p>${desc}</p>
            </div>
            <div class="cta-buttons">
              <a href="${btn1Url}" class="${btn1Class}" ${target1Attr}>${btn1Text}</a>
              <a href="${btn2Url}" class="${btn2Class}" ${target2Attr}>${btn2Text}</a>
            </div>
          </div>
        </div>
      </section>
    `;
    
    container.innerHTML = html;
  });
});
