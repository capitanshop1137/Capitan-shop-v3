// ===== بررسی لاگین =====
if (sessionStorage.getItem('capitan_admin') !== 'true') {
  window.location.href = 'index.html';
}

function logout() {
  sessionStorage.removeItem('capitan_admin');
  window.location.href = 'index.html';
}

// ===== پیش‌نمایش چند عکس =====
function previewImages(input, previewId) {
  const container = document.getElementById(previewId);
  if (!container) return;
  container.innerHTML = '';
  if (!input.files || input.files.length === 0) return;

  Array.from(input.files).forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'preview-item';
      wrapper.innerHTML = `<img src="${e.target.result}">`;
      container.appendChild(wrapper);
    };
    reader.readAsDataURL(file);
  });
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = 'msg ' + type;
  setTimeout(() => { el.className = 'msg'; }, 4000);
}

// ===== آمار =====
async function updateStats() {
  try {
    const clash = await getAccounts();
    const items = await getClashItems();
    const ff = await getFreefireAccounts();
    const s1 = document.getElementById('statClash');
    const s2 = document.getElementById('statItems');
    const s3 = document.getElementById('statFreefire');
    const s4 = document.getElementById('statAll');
    if (s1) s1.textContent = clash.length;
    if (s2) s2.textContent = items.length;
    if (s3) s3.textContent = ff.length;
    if (s4) s4.textContent = clash.length + items.length + ff.length;
  } catch (e) { console.warn('آمار:', e); }
}

// ===== تب‌های اصلی =====
document.querySelectorAll('.main-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    ['clash', 'items', 'freefire', 'all'].forEach(t => {
      const el = document.getElementById('tab-' + t);
      if (el) el.classList.toggle('hidden', t !== target);
    });
    if (target === 'all') loadAllList();
  });
});

// ===== تب‌های داخلی =====
document.querySelectorAll('.section-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const section = tab.dataset.section;
    const tabId = tab.closest('[id^="tab-"]')?.id.replace('tab-', '');
    if (!tabId) return;

    const parent = document.getElementById('tab-' + tabId);
    parent.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const addSection = document.getElementById(tabId + '-add-section');
    const listSection = document.getElementById(tabId + '-list-section');

    if (addSection) addSection.classList.toggle('hidden', section !== 'add');
    if (listSection) listSection.classList.toggle('hidden', section !== 'list');

    if (section === 'list') {
      if (tabId === 'clash') loadClashList();
      if (tabId === 'items') loadItemsList();
      if (tabId === 'freefire') loadFFList();
    }
  });
});

// ===== ثبت اکانت کلش =====
const clashForm = document.getElementById('clashForm');
if (clashForm) {
  clashForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('cSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ در حال ثبت...';

    try {
      const files = Array.from(document.getElementById('cImages').files || []);
      let imageUrls = [];
      if (files.length > 0) {
        btn.textContent = `⏳ آپلود عکس...`;
        imageUrls = await uploadMultipleImages(files, (d, t) => {
          btn.textContent = `⏳ آپلود عکس ${d}/${t}...`;
        });
      }

      const account = {
        title: document.getElementById('cTitle').value.trim(),
        tagline: document.getElementById('cTagline').value.trim(),
        townhall: parseInt(document.getElementById('cTownhall').value) || null,
        builder: parseInt(document.getElementById('cBuilder').value) || null,
        name_change: parseInt(document.getElementById('cNameChange').value) || null,
        price: parseInt(document.getElementById('cPrice').value),
        code: document.getElementById('cCode').value.trim(),
        description: document.getElementById('cDescription').value.trim(),
        status: document.getElementById('cStatus').value,
        image_url: imageUrls[0] || null,
        image_urls: imageUrls
      };

      await addAccount(account);
      showMsg('clashAddMsg', '✅ اکانت با موفقیت ثبت شد!', 'success');
      clashForm.reset();
      document.getElementById('cPreview').innerHTML = '';
      updateStats();
    } catch (err) {
      showMsg('clashAddMsg', '❌ خطا: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 ثبت اکانت';
    }
  });
}

// ===== ثبت آیتم کلش =====
const itemForm = document.getElementById('itemForm');
if (itemForm) {
  itemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('iSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ در حال ثبت...';

    try {
      const files = Array.from(document.getElementById('iImages').files || []);
      let imageUrls = [];
      if (files.length > 0) {
        imageUrls = await uploadMultipleImages(files, (d, t) => {
          btn.textContent = `⏳ آپلود عکس ${d}/${t}...`;
        });
      }

      const item = {
        title: document.getElementById('iTitle').value.trim(),
        item_type: document.getElementById('iType').value,
        price_toman: parseInt(document.getElementById('iPriceToman').value),
        price_dollar: parseFloat(document.getElementById('iPriceDollar').value) || null,
        code: document.getElementById('iCode').value.trim(),
        description: document.getElementById('iDescription').value.trim(),
        status: document.getElementById('iStatus').value,
        image_url: imageUrls[0] || null,
        image_urls: imageUrls
      };

      await addClashItem(item);
      showMsg('itemAddMsg', '✅ آیتم با موفقیت ثبت شد!', 'success');
      itemForm.reset();
      document.getElementById('iPreview').innerHTML = '';
      updateStats();
    } catch (err) {
      showMsg('itemAddMsg', '❌ خطا: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 ثبت آیتم';
    }
  });
}

// ===== ثبت اکانت فری فایر =====
const ffForm = document.getElementById('ffForm');
if (ffForm) {
  ffForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ffSubmitBtn');
    btn.disabled = true;
    btn.textContent = '⏳ در حال ثبت...';

    try {
      const files = Array.from(document.getElementById('ffImages').files || []);
      let imageUrls = [];
      if (files.length > 0) {
        imageUrls = await uploadMultipleImages(files, (d, t) => {
          btn.textContent = `⏳ آپلود عکس ${d}/${t}...`;
        });
      }

      const account = {
        title: document.getElementById('ffTitle').value.trim(),
        rank: document.getElementById('ffRank').value.trim(),
        level: parseInt(document.getElementById('ffLevel').value) || null,
        price_toman: parseInt(document.getElementById('ffPriceToman').value),
        price_dollar: parseFloat(document.getElementById('ffPriceDollar').value) || null,
        code: document.getElementById('ffCode').value.trim(),
        description: document.getElementById('ffDescription').value.trim(),
        status: document.getElementById('ffStatus').value,
        image_url: imageUrls[0] || null,
        image_urls: imageUrls
      };

      await addFreefireAccount(account);
      showMsg('ffAddMsg', '✅ اکانت فری فایر ثبت شد!', 'success');
      ffForm.reset();
      document.getElementById('ffPreview').innerHTML = '';
      updateStats();
    } catch (err) {
      showMsg('ffAddMsg', '❌ خطا: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = '🚀 ثبت اکانت';
    }
  });
}

// ===== لیست اکانت‌های کلش =====
async function loadClashList() {
  const list = document.getElementById('clashList');
  if (!list) return;
  list.innerHTML = 'در حال بارگذاری...';
  try {
    const accounts = await getAccounts();
    if (accounts.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#94A3B8;padding:30px;">هنوز اکانتی ثبت نشده</p>';
      return;
    }
    list.innerHTML = accounts.map(acc => `
      <div class="account-row">
        ${acc.image_url ? `<img src="${acc.image_url}">` : `<div class="no-img">🎮</div>`}
        <div class="info">
          <h3>${acc.title}</h3>
          <div class="meta">
            <span class="badge">کد ${acc.code}</span>
            <span class="badge">${acc.price.toLocaleString('fa-IR')} تومان</span>
            <span class="badge">تاون ${acc.townhall || '-'}</span>
            ${acc.status === 'available' ? '<span class="badge" style="background:rgba(0,255,136,0.15);color:#00FF88;">✅ موجود</span>' : '<span class="badge" style="background:rgba(255,46,136,0.15);color:#FF2E88;">❌ فروش رفته</span>'}
          </div>
        </div>
        <div class="account-actions">
          <button onclick="toggleStatus('${acc.id}', '${acc.status}', 'clash')" title="تغییر وضعیت">🔄</button>
          <button class="btn-edit" onclick="openEdit('${acc.id}', 'clash')" title="ویرایش">✏️</button>
          <button onclick="removeItem('${acc.id}', 'clash', '${(acc.image_urls || []).join(',')}')" title="حذف">🗑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:#FF2E88;">خطا: ' + err.message + '</p>';
  }
}

// ===== لیست آیتم‌های کلش =====
async function loadItemsList() {
  const list = document.getElementById('itemsList');
  if (!list) return;
  list.innerHTML = 'در حال بارگذاری...';
  try {
    const items = await getClashItems();
    if (items.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#94A3B8;padding:30px;">هنوز آیتمی ثبت نشده</p>';
      return;
    }
    list.innerHTML = items.map(item => `
      <div class="account-row">
        ${item.image_url ? `<img src="${item.image_url}">` : `<div class="no-img">🏆</div>`}
        <div class="info">
          <h3>${item.title} ${item.item_type ? `<span style="font-size:11px;color:#FFB800;">[${item.item_type}]</span>` : ''}</h3>
          <div class="meta">
            <span class="badge">کد ${item.code}</span>
            <span class="badge">${item.price_toman.toLocaleString('fa-IR')} تومان</span>
            ${item.price_dollar ? `<span class="badge">$${parseFloat(item.price_dollar).toFixed(2)}</span>` : ''}
            ${item.status === 'available' ? '<span class="badge" style="background:rgba(0,255,136,0.15);color:#00FF88;">✅ موجود</span>' : '<span class="badge" style="background:rgba(255,46,136,0.15);color:#FF2E88;">❌ فروش رفته</span>'}
          </div>
        </div>
        <div class="account-actions">
          <button onclick="toggleStatus('${item.id}', '${item.status}', 'items')" title="تغییر وضعیت">🔄</button>
          <button class="btn-edit" onclick="openEdit('${item.id}', 'items')" title="ویرایش">✏️</button>
          <button onclick="removeItem('${item.id}', 'items', '${(item.image_urls || []).join(',')}')" title="حذف">🗑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:#FF2E88;">خطا: ' + err.message + '</p>';
  }
}

// ===== لیست فری فایر =====
async function loadFFList() {
  const list = document.getElementById('ffList');
  if (!list) return;
  list.innerHTML = 'در حال بارگذاری...';
  try {
    const accounts = await getFreefireAccounts();
    if (accounts.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:#94A3B8;padding:30px;">هنوز اکانتی ثبت نشده</p>';
      return;
    }
    list.innerHTML = accounts.map(acc => `
      <div class="account-row">
        ${acc.image_url ? `<img src="${acc.image_url}">` : `<div class="no-img">🔫</div>`}
        <div class="info">
          <h3>${acc.title} ${acc.rank ? `<span style="font-size:11px;color:#FF6B00;">[${acc.rank}]</span>` : ''}</h3>
          <div class="meta">
            <span class="badge">کد ${acc.code}</span>
            <span class="badge">${acc.price_toman.toLocaleString('fa-IR')} تومان</span>
            ${acc.level ? `<span class="badge">لول ${acc.level}</span>` : ''}
            ${acc.status === 'available' ? '<span class="badge" style="background:rgba(0,255,136,0.15);color:#00FF88;">✅ موجود</span>' : '<span class="badge" style="background:rgba(255,46,136,0.15);color:#FF2E88;">❌ فروش رفته</span>'}
          </div>
        </div>
        <div class="account-actions">
          <button onclick="toggleStatus('${acc.id}', '${acc.status}', 'freefire')" title="تغییر وضعیت">🔄</button>
          <button class="btn-edit" onclick="openEdit('${acc.id}', 'freefire')" title="ویرایش">✏️</button>
          <button onclick="removeItem('${acc.id}', 'freefire', '${(acc.image_urls || []).join(',')}')" title="حذف">🗑</button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    list.innerHTML = '<p style="color:#FF2E88;">خطا: ' + err.message + '</p>';
  }
}

// ===== لیست همه =====
async function loadAllList() {
  const list = document.getElementById('allList');
  if (!list) return;
  list.innerHTML = 'در حال بارگذاری...';
  try {
    const [clash, items, ff] = await Promise.all([
      getAccounts(),
      getClashItems(),
      getFreefireAccounts()
    ]);

    let html = '';

    if (clash.length > 0) {
      html += `<h3 style="color:#B026FF;font-family:'Bebas Neue';font-size:18px;margin:16px 0 10px;">🎮 اکانت‌های کلش (${clash.length})</h3>`;
      html += clash.map(acc => `
        <div class="account-row">
          ${acc.image_url ? `<img src="${acc.image_url}">` : `<div class="no-img">🎮</div>`}
          <div class="info">
            <h3>${acc.title}</h3>
            <div class="meta">
              <span class="badge">کد ${acc.code}</span>
              <span class="badge">${acc.price.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    if (items.length > 0) {
      html += `<h3 style="color:#FFB800;font-family:'Bebas Neue';font-size:18px;margin:16px 0 10px;">🏆 آیتم‌های کلش (${items.length})</h3>`;
      html += items.map(item => `
        <div class="account-row">
          ${item.image_url ? `<img src="${item.image_url}">` : `<div class="no-img">🏆</div>`}
          <div class="info">
            <h3>${item.title} <span style="font-size:11px;color:#FFB800;">[${item.item_type || '-'}]</span></h3>
            <div class="meta">
              <span class="badge">کد ${item.code}</span>
              <span class="badge">${item.price_toman.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    if (ff.length > 0) {
      html += `<h3 style="color:#FF6B00;font-family:'Bebas Neue';font-size:18px;margin:16px 0 10px;">🔫 فری فایر (${ff.length})</h3>`;
      html += ff.map(acc => `
        <div class="account-row">
          ${acc.image_url ? `<img src="${acc.image_url}">` : `<div class="no-img">🔫</div>`}
          <div class="info">
            <h3>${acc.title} <span style="font-size:11px;color:#FF6B00;">[${acc.rank || '-'}]</span></h3>
            <div class="meta">
              <span class="badge">کد ${acc.code}</span>
              <span class="badge">${acc.price_toman.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>
        </div>
      `).join('');
    }

    if (!html) html = '<p style="text-align:center;color:#94A3B8;padding:30px;">هنوز چیزی ثبت نشده</p>';
    list.innerHTML = html;
  } catch (err) {
    list.innerHTML = '<p style="color:#FF2E88;">خطا: ' + err.message + '</p>';
  }
}

// ===== تغییر وضعیت =====
async function toggleStatus(id, currentStatus, type) {
  const newStatus = currentStatus === 'available' ? 'sold' : 'available';
  try {
    if (type === 'clash') {
      await updateAccount(id, { status: newStatus });
      loadClashList();
    } else if (type === 'items') {
      await updateClashItem(id, { status: newStatus });
      loadItemsList();
    } else if (type === 'freefire') {
      await updateFreefireAccount(id, { status: newStatus });
      loadFFList();
    }
  } catch (err) {
    alert('خطا: ' + err.message);
  }
}

// ===== حذف =====
async function removeItem(id, type, imageUrlsStr) {
  if (!confirm('مطمئنی می‌خوای حذف کنی؟')) return;
  try {
    const urls = imageUrlsStr ? imageUrlsStr.split(',').filter(u => u) : [];
    if (urls.length > 0) await deleteMultipleImages(urls);

    if (type === 'clash') {
      await deleteAccount(id);
      loadClashList();
    } else if (type === 'items') {
      await deleteClashItem(id);
      loadItemsList();
    } else if (type === 'freefire') {
      await deleteFreefireAccount(id);
      loadFFList();
    }
    updateStats();
  } catch (err) {
    alert('خطا: ' + err.message);
  }
}

// ===== ویرایش =====
let editingId = null;
let editingType = null;

async function openEdit(id, type) {
  editingId = id;
  editingType = type;

  try {
    let data;
    if (type === 'clash') {
      const all = await getAccounts();
      data = all.find(a => a.id === id);
    } else if (type === 'items') {
      const all = await getClashItems();
      data = all.find(a => a.id === id);
    } else if (type === 'freefire') {
      const all = await getFreefireAccounts();
      data = all.find(a => a.id === id);
    }

    if (!data) { alert('پیدا نشد'); return; }

    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    const title = document.getElementById('editModalTitle');

    if (type === 'clash') {
      title.textContent = '✏️ ویرایش اکانت کلش';
      form.innerHTML = `
        <div class="row-2">
          <div class="field"><label>عنوان</label><input type="text" id="ecTitle" value="${data.title || ''}"></div>
          <div class="field"><label>شعار</label><input type="text" id="ecTagline" value="${data.tagline || ''}"></div>
        </div>
        <div class="row-3">
          <div class="field"><label>تاون هال</label><input type="number" id="ecTownhall" value="${data.townhall || ''}"></div>
          <div class="field"><label>بیلدر</label><input type="number" id="ecBuilder" value="${data.builder || ''}"></div>
          <div class="field"><label>تغییر نام</label><input type="number" id="ecNameChange" value="${data.name_change || ''}"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>قیمت</label><input type="number" id="ecPrice" value="${data.price || ''}"></div>
          <div class="field"><label>کد</label><input type="text" id="ecCode" value="${data.code || ''}"></div>
        </div>
        <div class="field"><label>توضیحات</label><textarea id="ecDescription">${data.description || ''}</textarea></div>
        <div class="field"><label>وضعیت</label>
          <select id="ecStatus">
            <option value="available" ${data.status === 'available' ? 'selected' : ''}>موجود</option>
            <option value="sold" ${data.status === 'sold' ? 'selected' : ''}>فروش رفته</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary">💾 ذخیره</button>
      `;
    } else if (type === 'items') {
      title.textContent = '✏️ ویرایش آیتم کلش';
      form.innerHTML = `
        <div class="row-2">
          <div class="field"><label>عنوان</label><input type="text" id="eiTitle" value="${data.title || ''}"></div>
          <div class="field"><label>نوع</label><input type="text" id="eiType" value="${data.item_type || ''}"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>قیمت تومان</label><input type="number" id="eiPriceToman" value="${data.price_toman || ''}"></div>
          <div class="field"><label>قیمت دلار</label><input type="number" id="eiPriceDollar" step="0.01" value="${data.price_dollar || ''}"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>کد</label><input type="text" id="eiCode" value="${data.code || ''}"></div>
          <div class="field"><label>وضعیت</label>
            <select id="eiStatus">
              <option value="available" ${data.status === 'available' ? 'selected' : ''}>موجود</option>
              <option value="sold" ${data.status === 'sold' ? 'selected' : ''}>فروش رفته</option>
            </select>
          </div>
        </div>
        <div class="field"><label>توضیحات</label><textarea id="eiDescription">${data.description || ''}</textarea></div>
        <button type="submit" class="btn btn-primary btn-gold">💾 ذخیره</button>
      `;
    } else if (type === 'freefire') {
      title.textContent = '✏️ ویرایش اکانت فری فایر';
      form.innerHTML = `
        <div class="row-2">
          <div class="field"><label>عنوان</label><input type="text" id="effTitle" value="${data.title || ''}"></div>
          <div class="field"><label>رنک</label><input type="text" id="effRank" value="${data.rank || ''}"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>لول</label><input type="number" id="effLevel" value="${data.level || ''}"></div>
          <div class="field"><label>کد</label><input type="text" id="effCode" value="${data.code || ''}"></div>
        </div>
        <div class="row-2">
          <div class="field"><label>قیمت تومان</label><input type="number" id="effPriceToman" value="${data.price_toman || ''}"></div>
          <div class="field"><label>قیمت دلار</label><input type="number" id="effPriceDollar" step="0.01" value="${data.price_dollar || ''}"></div>
        </div>
        <div class="field"><label>توضیحات</label><textarea id="effDescription">${data.description || ''}</textarea></div>
        <div class="field"><label>وضعیت</label>
          <select id="effStatus">
            <option value="available" ${data.status === 'available' ? 'selected' : ''}>موجود</option>
            <option value="sold" ${data.status === 'sold' ? 'selected' : ''}>فروش رفته</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-fire">💾 ذخیره</button>
      `;
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = '⏳ ذخیره...';

      try {
        if (type === 'clash') {
          await updateAccount(id, {
            title: document.getElementById('ecTitle').value.trim(),
            tagline: document.getElementById('ecTagline').value.trim(),
            townhall: parseInt(document.getElementById('ecTownhall').value) || null,
            builder: parseInt(document.getElementById('ecBuilder').value) || null,
            name_change: parseInt(document.getElementById('ecNameChange').value) || null,
            price: parseInt(document.getElementById('ecPrice').value),
            code: document.getElementById('ecCode').value.trim(),
            description: document.getElementById('ecDescription').value.trim(),
            status: document.getElementById('ecStatus').value
          });
          loadClashList();
        } else if (type === 'items') {
          await updateClashItem(id, {
            title: document.getElementById('eiTitle').value.trim(),
            item_type: document.getElementById('eiType').value.trim(),
            price_toman: parseInt(document.getElementById('eiPriceToman').value),
            price_dollar: parseFloat(document.getElementById('eiPriceDollar').value) || null,
            code: document.getElementById('eiCode').value.trim(),
            description: document.getElementById('eiDescription').value.trim(),
            status: document.getElementById('eiStatus').value
          });
          loadItemsList();
        } else if (type === 'freefire') {
          await updateFreefireAccount(id, {
            title: document.getElementById('effTitle').value.trim(),
            rank: document.getElementById('effRank').value.trim(),
            level: parseInt(document.getElementById('effLevel').value) || null,
            price_toman: parseInt(document.getElementById('effPriceToman').value),
            price_dollar: parseFloat(document.getElementById('effPriceDollar').value) || null,
            code: document.getElementById('effCode').value.trim(),
            description: document.getElementById('effDescription').value.trim(),
            status: document.getElementById('effStatus').value
          });
          loadFFList();
        }

        showMsg('editMsg', '✅ ذخیره شد!', 'success');
        setTimeout(() => closeEditModal(), 800);
      } catch (err) {
        showMsg('editMsg', '❌ خطا: ' + err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = '💾 ذخیره';
      }
    };

    modal.classList.add('active');
  } catch (err) {
    alert('خطا: ' + err.message);
  }
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('active');
  editingId = null;
  editingType = null;
}

// ===== شروع =====
updateStats();
