const defaultBooks = [
  { id: 1, title: 'Engineering Statistics', author: 'Ross', course: 'Statistics', price: 420, condition: 5, conditionText: 'Excellent', cover: 'cover-a', tag: 'Fresh listing', seller: 'Aarav', location: 'Main library entrance', description: 'Clean pages, only a few pencil marks in the first chapter.' },
  { id: 2, title: 'Operating System Concepts', author: 'Silberschatz', course: 'OS', price: 650, condition: 4, conditionText: 'Very good', cover: 'cover-b', tag: 'Popular', seller: 'Riya', location: 'Student plaza', description: 'Good binding and highlighted definitions kept to a minimum.' },
  { id: 3, title: 'Data Structures in C', author: 'Lipschutz', course: 'DSA', price: 380, condition: 5, conditionText: 'Excellent', cover: 'cover-c', tag: 'Best value', seller: 'Kabir', location: 'Cafeteria steps', description: 'Almost unused. Great for the first two units.' },
  { id: 4, title: 'Computer Networks', author: 'Kurose', course: 'CN', price: 820, condition: 4, conditionText: 'Very good', cover: 'cover-d', tag: '2nd edition', seller: 'Mira', location: 'Lab block lobby', description: 'No torn pages; clean notes section at the back.' },
  { id: 5, title: 'Database System Concepts', author: 'Navathe', course: 'DBMS', price: 720, condition: 3, conditionText: 'Good', cover: 'cover-e', tag: 'Semester pick', seller: 'Dev', location: 'Main library entrance', description: 'Used for one semester. Some neat margin notes.' },
  { id: 6, title: 'Let Us C', author: 'Kanetkar', course: 'Programming', price: 300, condition: 4, conditionText: 'Very good', cover: 'cover-f', tag: 'Quick buy', seller: 'Nisha', location: 'Design studio', description: 'Solid copy with clean code examples.' },
  { id: 7, title: 'Software Engineering', author: 'Pressman', course: 'SEPM', price: 560, condition: 5, conditionText: 'Excellent', cover: 'cover-g', tag: 'Core subject', seller: 'Ishaan', location: 'Auditorium foyer', description: 'No markings. Previous owner kept it covered.' },
  { id: 8, title: 'Discrete Mathematics', author: 'Rosen', course: 'Maths', price: 490, condition: 4, conditionText: 'Very good', cover: 'cover-h', tag: 'Easy pickup', seller: 'Tara', location: 'Student plaza', description: 'Minor corner wear, otherwise in strong condition.' },
];
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const grid = $('#bookGrid'), searchInput = $('#searchInput'), conditionFilter = $('#conditionFilter'), sortSelect = $('#sortSelect');
const emptyState = $('#emptyState'), modal = $('#bookModal'), modalContent = $('#modalContent'), toast = $('#toast'), toastText = $('#toastText');
const sellForm = $('#sellForm'), preview = $('#preview');
const CONDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
const COVERS = 'abcdefgh'.split('').map(l => 'cover-' + l);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let view = 'shelf';
function getBooks() { try { return JSON.parse(localStorage.getItem('thriftkart_books')) || defaultBooks; } catch (e) { return defaultBooks; } }
function setBooks(b) { try { localStorage.setItem('thriftkart_books', JSON.stringify(b)); } catch (e) { } }

const coverHTML = (b, extra = '') => `<div class="cover ${esc(b.cover)}">${extra}<b>${esc(b.title)}</b><small>${esc(b.author || '')}</small></div>`;

function bookCard(b, i) {
  const top = `<span class="tag">${esc(b.tag)}</span><button class="heart" aria-label="Save book">♡</button>`;
  return `<article class="book" style="--i:${i % 8}" data-id="${b.id}">${coverHTML(b, top)}
    <div class="bi"><h3 title="${esc(b.title)}">${esc(b.title)}</h3>
    <div class="meta"><span>${esc(b.course)}</span><span>${esc(b.conditionText)}</span></div>
    <div class="price"><strong>₹${Number(b.price).toLocaleString('en-IN')}</strong><button class="view" data-id="${b.id}">View ↗</button></div></div></article>`;
}

function renderBooks() {
  let books = getBooks().filter(b => b.status !== 'pending_moderation');
  const q = searchInput.value.trim().toLowerCase(), c = conditionFilter.value;
  if (q) books = books.filter(b => [b.title, b.author, b.course].join(' ').toLowerCase().includes(q));
  if (c !== 'all') books = books.filter(b => b.condition === Number(c));
  if (sortSelect.value === 'price-low') books.sort((a, b) => a.price - b.price);
  if (sortSelect.value === 'price-high') books.sort((a, b) => b.price - a.price);
  if (view === 'shelf') {
    const per = Math.max(3, Math.floor(grid.clientWidth / 100)), rows = [];
    for (let i = 0; i < books.length; i += per) rows.push(books.slice(i, i + per));
    grid.className = 'shelf';
    grid.innerHTML = rows.map(r => `<div class="shelf-row">${r.map((b, i) => `<button class="spine ${esc(b.cover)}" style="--i:${i};--h:${190 + (b.id * 37) % 70}px;--w:${56 + (b.title.length * 3) % 26}px" data-id="${b.id}" aria-label="${esc(b.title)}, ₹${b.price}"><span>${esc(b.title)}</span><i>₹${b.price}</i></button>`).join('')}</div>`).join('');
  } else { grid.className = 'grid'; grid.innerHTML = books.map(bookCard).join(''); }
  emptyState.hidden = books.length !== 0;
  requestAnimationFrame(() => $$('.book,.spine').forEach(el => io.observe(el)));
}

grid.addEventListener('click', e => {
  const heart = e.target.closest('.heart');
  if (heart) {
    const on = heart.classList.toggle('on'); heart.textContent = on ? '♥' : '♡';
    return showToast(on ? 'Saved to favourites' : 'Removed from favourites');
  }
  const card = e.target.closest('.book,.spine'); if (card) openBook(Number(card.dataset.id));
});

function openBook(id) {
  const b = getBooks().find(x => x.id === id); if (!b) return;
  modalContent.innerHTML = `<div class="modal-inner">${coverHTML(b)}
    <div class="modal-detail"><h3 id="modalTitle">${esc(b.title)}</h3>
    <p>${esc(b.description || 'A student-listed textbook ready for a campus handover.')}</p>
    <div class="pills"><span class="pill">${esc(b.author || 'Student seller')}</span><span class="pill">${esc(b.course)}</span><span class="pill">${esc(b.conditionText)}</span><span class="pill">₹${Number(b.price).toLocaleString('en-IN')}</span></div>
    <p><b>Seller:</b> ${esc(b.seller || 'Student seller')}<br><b>Handover:</b> ${esc(b.location)}</p>
    <div class="modal-actions"><button class="btn dark request-btn">Request this book</button><button class="btn soft chat-btn">Message seller</button></div></div></div>`;
  modal.classList.add('show'); modal.setAttribute('aria-hidden', 'false'); document.body.classList.add('modal-open');
  $('.request-btn').onclick = () => { showToast('Request sent. The seller can now reply.'); closeModal(); };
  $('.chat-btn').onclick = () => showToast('Chat opened for this listing');
}
function closeModal() { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); document.body.classList.remove('modal-open'); }
$('.modal-close').onclick = closeModal; $('.modal-backdrop').onclick = closeModal;
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

function showToast(t) { toastText.textContent = t; toast.classList.add('show'); clearTimeout(window.__t); window.__t = setTimeout(() => toast.classList.remove('show'), 2600); }

[searchInput, conditionFilter, sortSelect].forEach(el => el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', renderBooks));
$$('[data-scroll]').forEach(b => b.addEventListener('click', () => $(b.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })));

$$('.view-toggle button').forEach(b => b.onclick = () => { view = b.dataset.view; $$('.view-toggle button').forEach(x => x.classList.toggle('on', x === b)); renderBooks(); });
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => view === 'shelf' && renderBooks(), 200); });

/* live preview in the sell form */
function updatePreview() {
  const d = new FormData(sellForm), c = Number(d.get('condition')) || 5;
  const b = { title: d.get('title') || 'Your book title', author: d.get('author') || 'Author', cover: COVERS[(String(d.get('title')).length + c) % 8] };
  preview.innerHTML = coverHTML(b) + `<div class="bi"><h3>${esc(b.title)}</h3><div class="meta"><span>${esc(d.get('course') || 'Course')}</span><span>${CONDS[c]}</span></div><div class="price"><strong>₹${Number(d.get('price') || 0).toLocaleString('en-IN')}</strong></div></div>`;
}
sellForm.addEventListener('input', updatePreview); updatePreview();

sellForm.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(sellForm), price = Number(d.get('price')), condition = Number(d.get('condition'));
  if (price < 1 || price > 20000) return showToast('Price must be between ₹1 and ₹20,000');
  if (condition < 1 || condition > 5) return showToast('Condition must be between 1 and 5');
  const books = getBooks();
  books.unshift({ id: Date.now(), status: 'pending_moderation', title: d.get('title'), author: d.get('author') || 'Student seller', course: d.get('course') || 'General', price, condition, conditionText: CONDS[condition], cover: COVERS[(String(d.get('title')).length + condition) % 8], tag: 'Pending moderation', seller: 'You', location: d.get('location'), description: d.get('description') || 'Seller added this listing through ThriftKart.' });
  setBooks(books); sellForm.reset(); updatePreview();
  conditionFilter.value = 'all'; sortSelect.value = 'featured'; searchInput.value = ''; renderBooks();
  showToast('Listing saved. Waiting for moderation.');
});

/* mobile menu */
const mt = $('.menu-toggle'), mn = $('.mobile-nav');
mt.onclick = () => { const s = mn.classList.toggle('show'); mt.setAttribute('aria-expanded', s); mn.setAttribute('aria-hidden', !s); };
$$('.mobile-nav a').forEach(a => a.onclick = () => { mn.classList.remove('show'); mt.setAttribute('aria-expanded', 'false'); });

/* hero headline: word-by-word rise */
(function split(root) {
  let i = 0;
  (function walk(n) {
    [...n.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const f = document.createDocumentFragment();
        c.textContent.split(/(\s+)/).forEach(t => {
          if (!t.trim()) return f.append(t);
          const w = document.createElement('span'); w.className = 'w';
          w.innerHTML = `<span style="--d:${150 + i++ * 80}ms">${t}</span>`; f.append(w);
        });
        c.replaceWith(f);
      } else if (c.nodeType === 1) walk(c);
    });
  })(root);
})($('[data-split]'));

/* reveal cards + count-up numbers */
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 });
const counter = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return; counter.unobserve(en.target);
  const end = +en.target.dataset.count, t0 = performance.now();
  const tick = t => { const p = Math.min(1, (t - t0) / 1400); en.target.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))).toString().padStart(end < 10 ? 2 : 0, '0'); if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: .6 });
$$('[data-count]').forEach(el => counter.observe(el));

/* smooth scroll loop: eased progress bar, parallax, stacked step cards, nav hide */
const bar = $('.progress i'), nav = $('.nav-wrap'), steps = $$('.step'), par = $$('[data-speed]');
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur = scrollY, last = scrollY;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function frame() {
  const y = scrollY; cur += (y - cur) * .1;
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? clamp(cur / max, 0, 1) : 0})`;
  if (!still && y < innerHeight * 1.2) par.forEach(el => {
    el.style.transform = el.matches('.pile') ? `translateY(${(cur * parseFloat(el.dataset.speed) * 1).toFixed(1)}px)` : '';
    if (!el.matches('.pile')) el.style.marginTop = `${(cur * parseFloat(el.dataset.speed) * 1).toFixed(1)}px`;
  });
  if (!still && innerWidth > 980) steps.forEach((s, i) => {
    const nx = steps[i + 1]; if (!nx) return;
    const t = clamp(1 - (nx.getBoundingClientRect().top - s.getBoundingClientRect().top - 22) / s.offsetHeight, 0, 1);
    s.style.transform = `scale(${1 - t * .06})`; s.style.filter = `brightness(${1 - t * .08})`;
  });
  nav.classList.toggle('hide', y > last + 4 && y > 300 && !mn.classList.contains('show') ? true : (y < last - 4 ? false : nav.classList.contains('hide')));
  last = y; requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

renderBooks();