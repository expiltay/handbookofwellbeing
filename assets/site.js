// Shared site behaviors for the Handbook of Well-Being
(function(){
  // Add stable chapter numbers to the index list so filtering doesn't renumber items.
  function enhanceIndex(){
    const list = document.getElementById('chapterList');
    if(!list) return;
    const items = Array.from(list.querySelectorAll('li'));
    // Remove native numbering and render our own stable number
    list.classList.add('chapter-list--stable');
    let chapterNum = 0;
    items.forEach((li) => {
      // Skip section headers
      if(li.classList.contains('section-header')) return;
      chapterNum++;
      li.dataset.chapterNumber = String(chapterNum);
      // Avoid duplicating if already present
      if(li.querySelector('.chapter-num')) return;
      const numSpan = document.createElement('span');
      numSpan.className = 'chapter-num';
      numSpan.textContent = String(chapterNum).padStart(2,'0');
      li.insertBefore(numSpan, li.firstChild);
    });
  }

  // Navigation rules:
  // - On chapter pages, keep the top bar focused on "Chapters" (and existing items like PDF).
  //   Remove any "Editors" link to reduce distraction.
  // - On non-chapter pages, leave existing nav as-is.
  function enhanceNav(){
    const nav = document.querySelector('header .nav');
    if(!nav) return;

    const isChapter = /\/chapters\//.test(window.location.pathname);
    const links = Array.from(nav.querySelectorAll('a'));

    if(isChapter){
      // Remove Editors links, if present.
      links
        .filter(a => ((a.getAttribute('href')||'').includes('editors.html')) || (a.textContent||'').trim().toLowerCase() === 'editors')
        .forEach(a => a.remove());

      // Ensure the first nav item is "Chapters".
      const firstLink = nav.querySelector('a');
      const chaptersHref = '../index.html#chapters';
      const hasChapters = Array.from(nav.querySelectorAll('a')).some(a => (a.textContent||'').trim().toLowerCase() === 'chapters');
      if(!hasChapters){
        const ch = document.createElement('a');
        ch.href = chaptersHref;
        ch.textContent = 'Chapters';
        nav.insertBefore(ch, firstLink || null);
      } else {
        // Normalize href for the existing Chapters link.
        Array.from(nav.querySelectorAll('a')).forEach(a => {
          if((a.textContent||'').trim().toLowerCase() === 'chapters') a.href = chaptersHref;
        });
      }
      return;
    }
  }

  // Lightweight SEO helpers for pages that don't already include common tags.
  function enhanceSEO(){
    const head = document.head;
    if(!head) return;

    function ensureMeta(name, content){
      if(!content) return;
      let m = head.querySelector('meta[name="'+name+'"]');
      if(!m){
        m = document.createElement('meta');
        m.setAttribute('name', name);
        head.appendChild(m);
      }
      if(!m.getAttribute('content')) m.setAttribute('content', content);
    }

    function ensureProperty(prop, content){
      if(!content) return;
      let m = head.querySelector('meta[property="'+prop+'"]');
      if(!m){
        m = document.createElement('meta');
        m.setAttribute('property', prop);
        head.appendChild(m);
      }
      if(!m.getAttribute('content')) m.setAttribute('content', content);
    }

    // Canonical URL
    let canonical = head.querySelector('link[rel="canonical"]');
    if(!canonical){
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      canonical.setAttribute('href', window.location.origin + window.location.pathname);
      head.appendChild(canonical);
    }

    // Description: use existing, else take first meaningful paragraph text.
    let desc = (head.querySelector('meta[name="description"]')||{}).content;
    if(!desc){
      const p = document.querySelector('main p') || document.querySelector('article p') || document.querySelector('p');
      if(p){
        desc = (p.textContent||'').replace(/\s+/g,' ').trim();
        if(desc.length > 170) desc = desc.slice(0, 167).trimEnd() + '…';
      }
    }
    ensureMeta('description', desc);
    ensureMeta('robots', 'index,follow');

    const title = document.title || 'Handbook of Well-Being';
    ensureProperty('og:title', title);
    ensureProperty('og:description', desc);
    ensureProperty('og:type', 'website');
    ensureProperty('og:url', window.location.origin + window.location.pathname);
  }

  // Add a visible chapter number on chapter pages.
  function enhanceChapter(){
    // Chapter pages live under /chapters/ and filenames begin with NN-
    const path = window.location.pathname;
    const m = path.match(/\/(?:chapters)\/(\d{1,2})-/);
    if(!m) return;
    const chNum = parseInt(m[1], 10);
    if(!Number.isFinite(chNum)) return;

    const h1 = document.querySelector('article header h1');
    if(!h1) return;

    // Avoid duplicating if already present
    if(document.querySelector('.chapter-badge')) return;

    const badgeWrap = document.createElement('div');
    badgeWrap.className = 'chapter-badge';
    badgeWrap.textContent = 'Chapter ' + chNum;

    h1.parentNode.insertBefore(badgeWrap, h1);
  }

  // Run after DOM is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => { enhanceIndex(); enhanceChapter(); enhanceNav(); enhanceSEO(); });
  } else {
    enhanceIndex(); enhanceChapter(); enhanceNav(); enhanceSEO();
  }
})();
