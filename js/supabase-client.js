const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== تولید نام فایل امن =====
function generateSafeFileName(originalName) {
  const dotIndex = originalName.lastIndexOf('.');
  const ext = dotIndex !== -1 ? originalName.substring(dotIndex + 1) : 'jpg';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `img-${timestamp}-${randomStr}.${ext.toLowerCase()}`;
}

// ===== فشرده‌سازی عکس =====
async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {
    if (file.size < 200 * 1024) { resolve(file); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (!blob) { resolve(file); return; }
            const newFile = new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(newFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

// ===== آپلود یک عکس =====
async function uploadImage(file) {
  const compressed = await compressImage(file);
  const fileName = generateSafeFileName(compressed.name);
  const { data, error } = await db.storage
    .from(BUCKET_NAME)
    .upload(fileName, compressed, {
      upsert: false,
      contentType: compressed.type || 'image/jpeg',
      cacheControl: '31536000'
    });
  if (error) throw error;
  const { data: urlData } = db.storage.from(BUCKET_NAME).getPublicUrl(fileName);
  return urlData.publicUrl;
}

// ===== آپلود چند عکس =====
async function uploadMultipleImages(files, onProgress) {
  let done = 0;
  const total = files.length;
  const promises = Array.from(files).map(async (file) => {
    try {
      const url = await uploadImage(file);
      done++;
      if (onProgress) onProgress(done, total);
      return url;
    } catch (err) {
      console.warn('خطا:', err);
      done++;
      if (onProgress) onProgress(done, total);
      return null;
    }
  });
  const results = await Promise.all(promises);
  return results.filter(u => u);
}

// ===== حذف عکس =====
async function deleteImage(imageUrl) {
  if (!imageUrl) return;
  try {
    const parts = imageUrl.split('/');
    const fileName = parts[parts.length - 1].split('?')[0];
    await db.storage.from(BUCKET_NAME).remove([fileName]);
  } catch (e) { console.warn('حذف عکس ناموفق:', e); }
}

async function deleteMultipleImages(urls) {
  if (!urls || urls.length === 0) return;
  for (const url of urls) { await deleteImage(url); }
}

// ===== اکانت‌های کلش =====
async function getAccounts() {
  const { data, error } = await db.from('accounts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addAccount(account) {
  const { data, error } = await db.from('accounts').insert([account]).select();
  if (error) throw error;
  return data;
}

async function updateAccount(id, account) {
  const { data, error } = await db.from('accounts').update(account).eq('id', id).select();
  if (error) throw error;
  return data;
}

async function deleteAccount(id) {
  const { error } = await db.from('accounts').delete().eq('id', id);
  if (error) throw error;
}

// ===== آیتم‌های کلش =====
async function getClashItems() {
  const { data, error } = await db.from('clash_items').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addClashItem(item) {
  const { data, error } = await db.from('clash_items').insert([item]).select();
  if (error) throw error;
  return data;
}

async function updateClashItem(id, item) {
  const { data, error } = await db.from('clash_items').update(item).eq('id', id).select();
  if (error) throw error;
  return data;
}

async function deleteClashItem(id) {
  const { error } = await db.from('clash_items').delete().eq('id', id);
  if (error) throw error;
}

// ===== اکانت‌های فری فایر =====
async function getFreefireAccounts() {
  const { data, error } = await db.from('freefire_accounts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

async function addFreefireAccount(account) {
  const { data, error } = await db.from('freefire_accounts').insert([account]).select();
  if (error) throw error;
  return data;
}

async function updateFreefireAccount(id, account) {
  const { data, error } = await db.from('freefire_accounts').update(account).eq('id', id).select();
  if (error) throw error;
  return data;
}

async function deleteFreefireAccount(id) {
  const { error } = await db.from('freefire_accounts').delete().eq('id', id);
  if (error) throw error;
}
