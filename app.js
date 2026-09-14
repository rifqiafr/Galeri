/**
 * PixelVault — High Performance Local Dual-Asset Engine
 * Powered by Client-Side IndexedDB & HTML5 Canvas
 * 100% Instant Upload, Zero Network Delay, Master Resolution Preservation
 */

import { firebaseConfig, isFirebaseConfigured } from './firebase-config.js';

// -----------------------------------------------------------------------------
// IndexedDB Local Master Vault Engine (Menyimpan file master asli gigabytes di browser)
// -----------------------------------------------------------------------------
const IDB_NAME = 'PixelVaultLocalDB';
const IDB_VERSION = 1;
const IDB_STORE = 'photos_master';

function openVaultDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(IDB_NAME, IDB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveVaultBlob(id, originalBlob) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.put({ id, originalBlob, savedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Gagal menyimpan file asli ke IndexedDB:', err);
    return false;
  }
}

async function getVaultBlob(id) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.originalBlob : null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Gagal mengambil file asli dari IndexedDB:', err);
    return null;
  }
}

async function deleteVaultBlob(id) {
  try {
    const db = await openVaultDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      store.delete(id);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Gagal menghapus file dari IndexedDB:', err);
    return false;
  }
}

function blobToDataURL(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

// Inisialisasi status penyimpanan
function initFirebase() {
  updateCloudStatus('local', 'Penyimpanan Lokal (Instan)');
  // Optional: Firebase analytics if enabled
  if (isFirebaseConfigured()) {
    import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js')
      .then(({ initializeApp }) => {
        const app = initializeApp(firebaseConfig);
        import('https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js')
          .then(({ getAnalytics, isSupported }) => {
            isSupported().then(supported => {
              if (supported) getAnalytics(app);
            });
          }).catch(() => {});
      }).catch(() => {});
  }
}

function updateCloudStatus(status, text) {
  const cloudDivider = document.getElementById('cloudDivider');
  const cloudSyncStatus = document.getElementById('cloudSyncStatus');
  const cloudStatusText = document.getElementById('cloudStatusText');

  if (cloudDivider && cloudSyncStatus && cloudStatusText) {
    cloudDivider.style.display = 'inline';
    cloudSyncStatus.style.display = 'inline-flex';
    cloudStatusText.textContent = text;
    cloudSyncStatus.className = `cloud-sync-status ${status}`;
  }
}

// Clean up legacy dummy photos from localStorage if present
let storedPhotos = [];
try {
  const localData = localStorage.getItem('pixelvault_photos');
  if (localData) {
    const parsed = JSON.parse(localData);
    storedPhotos = parsed.filter(p => !p.id.startsWith('pv-00'));
    localStorage.setItem('pixelvault_photos', JSON.stringify(storedPhotos));
  }
} catch (e) {
  storedPhotos = [];
}

// App State
const state = {
  photos: storedPhotos,
  albums: ['Koleksi Utama', 'Liburan', 'Pribadi', 'Dokumentasi'],
  searchQuery: '',
  sortBy: 'newest',
  currentLightboxIndex: -1,
  filteredPhotos: [],
  zoomLevel: 100,
  uploadQueue: []
};

// DOM Elements
const galleryGrid = document.getElementById('galleryGrid');
const emptyState = document.getElementById('emptyState');
const emptyStateTitle = document.getElementById('emptyStateTitle');
const emptyStateDesc = document.getElementById('emptyStateDesc');
const emptyUploadBtn = document.getElementById('emptyUploadBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const sortSelect = document.getElementById('sortSelect');
const statsCountText = document.getElementById('statsCountText');
const statsSizeText = document.getElementById('statsSizeText');

// Upload Modal Elements
const uploadModal = document.getElementById('uploadModal');
const openUploadBtn = document.getElementById('openUploadBtn');
const closeUploadModalBtn = document.getElementById('closeUploadModalBtn');
const cancelUploadBtn = document.getElementById('cancelUploadBtn');
const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const browseFilesBtn = document.getElementById('browseFilesBtn');
const uploadAlbumSelect = document.getElementById('uploadAlbumSelect');
const uploadQueueContainer = document.getElementById('uploadQueueContainer');
const queueList = document.getElementById('queueList');
const queueCount = document.getElementById('queueCount');
const queueTotalSize = document.getElementById('queueTotalSize');
const startUploadBtn = document.getElementById('startUploadBtn');
const startUploadBtnText = document.getElementById('startUploadBtnText');

// Lightbox Elements
const lightboxModal = document.getElementById('lightboxModal');
const closeLightboxBtn = document.getElementById('closeLightboxBtn');
const closeLightboxTopBtn = document.getElementById('closeLightboxTopBtn');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxIndexCounter = document.getElementById('lightboxIndexCounter');
const lightboxMainImg = document.getElementById('lightboxMainImg');
const prevPhotoBtn = document.getElementById('prevPhotoBtn');
const nextPhotoBtn = document.getElementById('nextPhotoBtn');
const imageStage = document.getElementById('imageStage');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelText = document.getElementById('zoomLevelText');
const lightboxFullscreenBtn = document.getElementById('lightboxFullscreenBtn');

// Lightbox Drawer Elements
const detailTitleInput = document.getElementById('detailTitleInput');
const detailDescInput = document.getElementById('detailDescInput');
const detailAlbumSelect = document.getElementById('detailAlbumSelect');
const specFilename = document.getElementById('specFilename');
const specResolution = document.getElementById('specResolution');
const specOriginalSize = document.getElementById('specOriginalSize');
const specThumbSize = document.getElementById('specThumbSize');
const specDateInput = document.getElementById('specDateInput');
const drawerFormatBadge = document.getElementById('drawerFormatBadge');
const downloadOriginalBtn = document.getElementById('downloadOriginalBtn');
const downloadBtnSubtext = document.getElementById('downloadBtnSubtext');
const deletePhotoBtn = document.getElementById('deletePhotoBtn');

// Toast Notification
const toastContainer = document.getElementById('toastContainer');

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// -----------------------------------------------------------------------------
// Initialization & Core Rendering
// -----------------------------------------------------------------------------
function initApp() {
  renderAlbumSelects();
  updateFilteredPhotos();
  attachEventListeners();
  initFirebase();
}

function savePhotos() {
  localStorage.setItem('pixelvault_photos', JSON.stringify(state.photos));
  updateStats();
}

function updateStats() {
  const totalCount = state.photos.length;
  const totalSizeMB = state.photos.reduce((sum, p) => sum + (p.originalSizeMB || 0), 0);
  statsCountText.textContent = `${totalCount} Foto`;
  statsSizeText.textContent = totalSizeMB > 1024 
    ? `${(totalSizeMB / 1024).toFixed(2)} GB Tersimpan` 
    : `${totalSizeMB.toFixed(1)} MB Tersimpan`;
}

// Populate Album Dropdowns
function renderAlbumSelects() {
  const optionsHtml = state.albums.map(a => `<option value="${a}">${a}</option>`).join('');
  uploadAlbumSelect.innerHTML = optionsHtml;
  detailAlbumSelect.innerHTML = optionsHtml;
}

// Filter and Sort Engine (Pure Search & Sorting)
function updateFilteredPhotos() {
  let result = [...state.photos];

  // Search Filter: Title, Description, Filename, or Album
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase().trim();
    result = result.filter(p => {
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      const matchFile = (p.filename || '').toLowerCase().includes(q);
      const matchAlbum = (p.album || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchFile || matchAlbum;
    });
  }

  // Sorting
  if (state.sortBy === 'newest') {
    result.sort((a, b) => new Date(b.dateTaken || b.createdAt || 0) - new Date(a.dateTaken || a.createdAt || 0));
  } else if (state.sortBy === 'oldest') {
    result.sort((a, b) => new Date(a.dateTaken || a.createdAt || 0) - new Date(b.dateTaken || b.createdAt || 0));
  } else if (state.sortBy === 'name_asc') {
    result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (state.sortBy === 'size_desc') {
    result.sort((a, b) => (b.originalSizeMB || 0) - (a.originalSizeMB || 0));
  }

  state.filteredPhotos = result;
  renderGalleryGrid();
  updateStats();
}

// Render Gallery Grid Cards
function renderGalleryGrid() {
  galleryGrid.innerHTML = '';

  if (state.filteredPhotos.length === 0) {
    emptyState.style.display = 'block';
    if (state.photos.length === 0) {
      if (emptyStateTitle) emptyStateTitle.textContent = 'Belum Ada Foto Tersimpan';
      if (emptyStateDesc) emptyStateDesc.textContent = 'PixelVault siap digunakan. Unggah foto resolusi tinggi pertama Anda (proses instan & kualitas 100% asli).';
      if (emptyUploadBtn) emptyUploadBtn.style.display = 'inline-flex';
    } else {
      if (emptyStateTitle) emptyStateTitle.textContent = 'Tidak Ada Foto Ditemukan';
      if (emptyStateDesc) emptyStateDesc.textContent = `Tidak ada foto yang cocok dengan pencarian "${state.searchQuery}".`;
      if (emptyUploadBtn) emptyUploadBtn.style.display = 'none';
    }
    return;
  }
  emptyState.style.display = 'none';

  state.filteredPhotos.forEach((photo, index) => {
    const card = document.createElement('div');
    card.className = 'photo-card';
    card.setAttribute('data-id', photo.id);

    // Fast loading thumbnail with lazy attribute
    card.innerHTML = `
      <div class="card-img-wrap">
        <img class="card-thumb-img" src="${photo.thumbUrl || photo.originalUrl}" alt="${photo.title}" loading="lazy">
        <div class="card-badges">
          <span class="badge-format">${photo.format || 'JPG'}</span>
          <span class="badge-res">${photo.originalSizeMB ? photo.originalSizeMB.toFixed(1) + ' MB' : 'HD'}</span>
        </div>
      </div>
      <div class="card-overlay">
        <div class="card-meta">
          <h4 class="card-title" title="${photo.title}">${photo.title}</h4>
          <div class="card-submeta">
            <span>${photo.album}</span>
            <span>•</span>
            <span>${photo.resolution ? photo.resolution.split(' ')[0] : 'Original'}</span>
          </div>
        </div>
        <div class="card-actions-quick">
          <button class="btn-card-action btn-open-detail" data-index="${index}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <span>Detail</span>
          </button>
          <button class="btn-card-action btn-quick-download" data-id="${photo.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Unduh Asli</span>
          </button>
        </div>
      </div>
    `;

    // Click card opens Lightbox
    card.addEventListener('click', (e) => {
      if (e.target.closest('.btn-quick-download')) return;
      openLightbox(index);
    });

    // Quick download trigger
    const quickDlBtn = card.querySelector('.btn-quick-download');
    quickDlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadPhotoOriginal(photo);
    });

    galleryGrid.appendChild(card);
  });
}

// -----------------------------------------------------------------------------
// Client-Side Canvas Thumbnail Generator
// -----------------------------------------------------------------------------
async function createThumbnailBlob(file, maxWidth = 640) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg', 0.8);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // Fallback to original
    };
    img.src = url;
  });
}

// -----------------------------------------------------------------------------
// Upload Engine (Drag & Drop Batch Upload & Cloud Storage Sync)
// -----------------------------------------------------------------------------
function openUploadModal() {
  uploadModal.classList.add('open');
  uploadModal.setAttribute('aria-hidden', 'false');
  resetUploadQueue();
}

function closeUploadModal() {
  uploadModal.classList.remove('open');
  uploadModal.setAttribute('aria-hidden', 'true');
  resetUploadQueue();
}

function resetUploadQueue() {
  state.uploadQueue = [];
  queueList.innerHTML = '';
  uploadQueueContainer.style.display = 'none';
  startUploadBtn.disabled = true;
  startUploadBtnText.textContent = 'Mulai Unggah (0 File)';
  fileInput.value = '';
}

function handleFilesSelected(files) {
  const validFiles = Array.from(files).filter(file => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      showToast(`File ${file.name} dilewati (hanya mendukung format JPG, PNG, WebP).`, 'danger');
    }
    return isImage;
  });

  if (validFiles.length === 0) return;

  validFiles.forEach(file => {
    const queueItem = {
      file,
      id: 'queue-' + Math.random().toString(36).substr(2, 9),
      previewUrl: URL.createObjectURL(file),
      sizeMB: file.size / (1024 * 1024),
      status: 'ready'
    };
    state.uploadQueue.push(queueItem);
  });

  renderUploadQueue();
}

function renderUploadQueue() {
  if (state.uploadQueue.length === 0) {
    uploadQueueContainer.style.display = 'none';
    startUploadBtn.disabled = true;
    startUploadBtnText.textContent = 'Mulai Unggah (0 File)';
    return;
  }

  uploadQueueContainer.style.display = 'block';
  startUploadBtn.disabled = false;
  startUploadBtnText.textContent = `Mulai Unggah (${state.uploadQueue.length} File)`;
  queueCount.textContent = state.uploadQueue.length;

  const totalSize = state.uploadQueue.reduce((acc, item) => acc + item.sizeMB, 0);
  queueTotalSize.textContent = `${totalSize.toFixed(1)} MB Total`;

  queueList.innerHTML = '';
  state.uploadQueue.forEach(item => {
    const div = document.createElement('div');
    div.className = 'queue-item';
    div.id = `item-${item.id}`;
    div.innerHTML = `
      <img src="${item.previewUrl}" class="queue-thumb" alt="Preview">
      <div class="queue-details">
        <div class="queue-filename">${item.file.name}</div>
        <div class="queue-meta">
          <span>${item.sizeMB.toFixed(1)} MB</span>
          <span>•</span>
          <span class="queue-status-text" id="status-${item.id}">Siap diunggah</span>
        </div>
        <div class="queue-progress-bar">
          <div class="queue-progress-fill" id="fill-${item.id}"></div>
        </div>
      </div>
      <button class="queue-remove-btn" title="Hapus dari antrean" data-id="${item.id}">&times;</button>
    `;

    // Remove item from queue
    div.querySelector('.queue-remove-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      state.uploadQueue = state.uploadQueue.filter(q => q.id !== item.id);
      renderUploadQueue();
    });

    queueList.appendChild(div);
  });
}

// Process Batch Upload (Ultra-Fast Local Dual-Asset Engine via IndexedDB)
async function startBatchUpload() {
  if (state.uploadQueue.length === 0) return;

  startUploadBtn.disabled = true;
  startUploadBtnText.textContent = 'Menyimpan...';
  const targetAlbum = uploadAlbumSelect.value || 'Koleksi Utama';

  const uploadedNewPhotos = [];

  for (let i = 0; i < state.uploadQueue.length; i++) {
    const item = state.uploadQueue[i];
    const fillEl = document.getElementById(`fill-${item.id}`);
    const statusEl = document.getElementById(`status-${item.id}`);

    const photoId = 'pv-' + Date.now() + '-' + i;
    const formatName = item.file.type.split('/')[1]?.toUpperCase() || 'JPEG';

    if (statusEl) statusEl.textContent = 'Membuat thumbnail optimal...';
    if (fillEl) fillEl.style.width = '30%';

    // 1. Generate fast thumbnail blob & Data URL via Canvas
    const thumbBlob = await createThumbnailBlob(item.file, 640);
    const thumbDataUrl = await blobToDataURL(thumbBlob);

    if (statusEl) statusEl.textContent = 'Menyimpan master asli ke Vault...';
    if (fillEl) fillEl.style.width = '70%';

    // 2. Simpan file master asli 100% tanpa kompresi ke IndexedDB
    await saveVaultBlob(photoId, item.file);

    if (fillEl) fillEl.style.width = '100%';
    if (statusEl) statusEl.textContent = 'Tersimpan ✓';

    const photoData = {
      id: photoId,
      title: item.file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
      description: 'Foto tersimpan di album ' + targetAlbum + '.',
      album: targetAlbum,
      filename: item.file.name,
      format: formatName,
      resolution: 'Resolusi Penuh',
      originalSizeMB: parseFloat(item.sizeMB.toFixed(2)),
      thumbSizeKB: Math.round((thumbBlob.size || 150000) / 1024),
      dateTaken: new Date().toISOString().split('T')[0],
      thumbUrl: thumbDataUrl,
      originalUrl: thumbDataUrl,
      createdAt: Date.now()
    };

    uploadedNewPhotos.unshift(photoData);
  }

  // Prepend ke state lokal
  state.photos = [...uploadedNewPhotos, ...state.photos];
  savePhotos();
  updateFilteredPhotos();

  showToast(`Berhasil menyimpan ${uploadedNewPhotos.length} foto ke Vault lokal secara instan!`, 'success');

  setTimeout(() => {
    closeUploadModal();
  }, 350);
}

// -----------------------------------------------------------------------------
// Lightbox & Detail Viewer Engine
// -----------------------------------------------------------------------------
function openLightbox(index) {
  state.currentLightboxIndex = index;
  state.zoomLevel = 100;
  applyZoom();

  const photo = state.filteredPhotos[index];
  if (!photo) return;

  lightboxModal.classList.add('open');
  lightboxModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  loadLightboxPhoto(photo);
}

function closeLightbox() {
  lightboxModal.classList.remove('open');
  lightboxModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function loadLightboxPhoto(photo) {
  if (!photo) return;

  // Counter
  lightboxIndexCounter.textContent = `Foto ${state.currentLightboxIndex + 1} dari ${state.filteredPhotos.length}`;

  // Main Image: tampilkan thumbnail instan, kemudian ambil master blob resolusi tinggi dari IndexedDB
  lightboxMainImg.src = photo.thumbUrl || photo.originalUrl;
  getVaultBlob(photo.id).then(blob => {
    if (blob) {
      const highResUrl = URL.createObjectURL(blob);
      lightboxMainImg.src = highResUrl;
    }
  }).catch(() => {});

  // Drawer Information
  drawerFormatBadge.textContent = photo.format || 'JPEG';
  detailTitleInput.value = photo.title || '';
  detailDescInput.value = photo.description || '';
  detailAlbumSelect.value = photo.album || state.albums[0];

  // Tech Specs
  specFilename.textContent = photo.filename || 'photo.jpg';
  specResolution.textContent = photo.resolution || 'Resolusi Penuh';
  specOriginalSize.textContent = photo.originalSizeMB ? `${photo.originalSizeMB.toFixed(1)} MB (100% Asli)` : 'Ukuran Asli';
  specThumbSize.textContent = `${photo.thumbSizeKB || 150} KB (Fast Load)`;
  specDateInput.value = photo.dateTaken || '';

  // Download CTA subtext
  downloadBtnSubtext.textContent = `Kualitas Asli Tanpa Kompresi (${photo.originalSizeMB ? photo.originalSizeMB.toFixed(1) + ' MB' : 'Original'})`;
}

function navigateLightbox(direction) {
  const total = state.filteredPhotos.length;
  if (total <= 1) return;

  state.currentLightboxIndex = (state.currentLightboxIndex + direction + total) % total;
  state.zoomLevel = 100;
  applyZoom();
  loadLightboxPhoto(state.filteredPhotos[state.currentLightboxIndex]);
}

// Zoom Controls
function applyZoom() {
  imageStage.style.transform = `scale(${state.zoomLevel / 100})`;
  zoomLevelText.textContent = `${state.zoomLevel}%`;
}

// -----------------------------------------------------------------------------
// Original Resolution Download (PRD Core Feature)
// -----------------------------------------------------------------------------
async function downloadPhotoOriginal(photo) {
  if (!photo) return;

  showToast(`Mengunduh: ${photo.filename} (Resolusi Asli Tanpa Kompresi)...`, 'success');

  // Ambil file master asli langsung dari IndexedDB
  try {
    const blob = await getVaultBlob(photo.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      triggerBrowserDownload(url, photo.filename);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      return;
    }
  } catch (err) {
    console.warn('Gagal membaca dari IndexedDB:', err);
  }

  // Jika file object lokal masih ada di memori
  if (photo.originalFileObject) {
    const url = URL.createObjectURL(photo.originalFileObject);
    triggerBrowserDownload(url, photo.filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  // Fallback direct open
  if (photo.originalUrl) {
    triggerBrowserDownload(photo.originalUrl, photo.filename);
  }
}

function triggerBrowserDownload(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'pixelvault_original_photo.jpg';
  a.target = '_blank';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Delete Photo (Hapus metadata dan file master di IndexedDB)
async function deleteCurrentPhoto() {
  const photo = state.filteredPhotos[state.currentLightboxIndex];
  if (!photo) return;

  const confirmed = confirm(`Apakah Anda yakin ingin menghapus "${photo.title}" dari PixelVault?`);
  if (!confirmed) return;

  // Hapus dari IndexedDB
  await deleteVaultBlob(photo.id);

  state.photos = state.photos.filter(p => p.id !== photo.id);
  savePhotos();
  closeLightbox();
  updateFilteredPhotos();
  showToast('Foto berhasil dihapus.', 'info');
}

// -----------------------------------------------------------------------------
// Event Listeners
// -----------------------------------------------------------------------------
function attachEventListeners() {
  // Search
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    clearSearchBtn.style.display = state.searchQuery ? 'block' : 'none';
    updateFilteredPhotos();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    clearSearchBtn.style.display = 'none';
    updateFilteredPhotos();
  });

  // Sort
  sortSelect.addEventListener('change', (e) => {
    state.sortBy = e.target.value;
    updateFilteredPhotos();
  });

  // Upload Modal Open/Close
  openUploadBtn.addEventListener('click', openUploadModal);
  if (emptyUploadBtn) emptyUploadBtn.addEventListener('click', openUploadModal);
  closeUploadModalBtn.addEventListener('click', closeUploadModal);
  cancelUploadBtn.addEventListener('click', closeUploadModal);

  // File Picker
  browseFilesBtn.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', (e) => {
    if (e.target !== browseFilesBtn) fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    handleFilesSelected(e.target.files);
  });

  // Drag and Drop
  ['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files) {
      handleFilesSelected(dt.files);
    }
  });

  // Clipboard Paste Support (Ctrl+V / Paste gambar dari mana saja)
  window.addEventListener('paste', (e) => {
    const activeEl = document.activeElement;
    const isTextInput = activeEl && (
      activeEl.tagName === 'TEXTAREA' || 
      (activeEl.tagName === 'INPUT' && activeEl.type === 'text')
    );

    const clipboardData = e.clipboardData || window.clipboardData;
    if (!clipboardData) return;

    const items = clipboardData.items;
    const pastedFiles = [];

    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            const ext = blob.type.split('/')[1] || 'png';
            const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
            const fileName = `PASTE_${timestamp}_${i + 1}.${ext}`;
            const file = new File([blob], fileName, { type: blob.type });
            pastedFiles.push(file);
          }
        }
      }
    }

    if (pastedFiles.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
      for (let i = 0; i < clipboardData.files.length; i++) {
        const file = clipboardData.files[i];
        if (file.type.startsWith('image/')) {
          pastedFiles.push(file);
        }
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault();
      if (!uploadModal.classList.contains('open')) {
        openUploadModal();
      }
      handleFilesSelected(pastedFiles);
      showToast(`Berhasil menempelkan ${pastedFiles.length} foto dari clipboard (Paste)!`, 'success');
    }
  });

  startUploadBtn.addEventListener('click', startBatchUpload);

  // Lightbox Navigation & Modal Close
  closeLightboxBtn.addEventListener('click', closeLightbox);
  closeLightboxTopBtn.addEventListener('click', closeLightbox);
  lightboxBackdrop.addEventListener('click', closeLightbox);
  prevPhotoBtn.addEventListener('click', () => navigateLightbox(-1));
  nextPhotoBtn.addEventListener('click', () => navigateLightbox(1));

  // Lightbox Zoom Controls
  zoomInBtn.addEventListener('click', () => {
    if (state.zoomLevel < 300) {
      state.zoomLevel += 25;
      applyZoom();
    }
  });
  zoomOutBtn.addEventListener('click', () => {
    if (state.zoomLevel > 50) {
      state.zoomLevel -= 25;
      applyZoom();
    }
  });
  zoomResetBtn.addEventListener('click', () => {
    state.zoomLevel = 100;
    applyZoom();
  });

  // Lightbox Fullscreen
  lightboxFullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      lightboxModal.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  // Lightbox Live Metadata Editing
  detailTitleInput.addEventListener('input', (e) => {
    const p = state.filteredPhotos[state.currentLightboxIndex];
    if (p) {
      p.title = e.target.value;
      savePhotos();
      renderGalleryGrid();
    }
  });

  detailDescInput.addEventListener('input', (e) => {
    const p = state.filteredPhotos[state.currentLightboxIndex];
    if (p) {
      p.description = e.target.value;
      savePhotos();
    }
  });

  detailAlbumSelect.addEventListener('change', (e) => {
    const p = state.filteredPhotos[state.currentLightboxIndex];
    if (p) {
      p.album = e.target.value;
      savePhotos();
      updateFilteredPhotos();
    }
  });

  specDateInput.addEventListener('change', (e) => {
    const p = state.filteredPhotos[state.currentLightboxIndex];
    if (p) {
      p.dateTaken = e.target.value;
      savePhotos();
      updateFilteredPhotos();
    }
  });

  // Download Original Resolution
  downloadOriginalBtn.addEventListener('click', () => {
    const photo = state.filteredPhotos[state.currentLightboxIndex];
    downloadPhotoOriginal(photo);
  });

  // Delete Photo
  deletePhotoBtn.addEventListener('click', deleteCurrentPhoto);

  // Keyboard Navigation (Arrow Keys, Escape)
  window.addEventListener('keydown', (e) => {
    if (lightboxModal.classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    } else if (uploadModal.classList.contains('open')) {
      if (e.key === 'Escape') closeUploadModal();
    }
  });

  // Touch Swipe Navigation for Mobile & Tablet
  let touchStartX = 0;
  let touchStartY = 0;
  const viewerEl = document.getElementById('lightboxViewer');

  if (viewerEl) {
    viewerEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    viewerEl.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;
      const diffX = touchEndX - touchStartX;
      const diffY = touchEndY - touchStartY;

      if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX < 0) {
          navigateLightbox(1); // Swipe left -> Next photo
        } else {
          navigateLightbox(-1); // Swipe right -> Prev photo
        }
      }
    }, { passive: true });
  }

  // PWA Install Desktop/Mobile App Support
  const installAppBtn = document.getElementById('installAppBtn');
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installAppBtn) {
      installAppBtn.style.display = 'inline-flex';
    }
  });

  if (installAppBtn) {
    installAppBtn.addEventListener('click', async () => {
      if (!deferredPrompt) {
        showToast('Untuk memasang di Desktop: klik ikon Pasang (Install) di bilah alamat browser Anda.', 'info');
        return;
      }
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        showToast('PixelVault sedang dipasang ke Desktop / Beranda Anda!', 'success');
      }
      deferredPrompt = null;
      installAppBtn.style.display = 'none';
    });
  }

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    if (installAppBtn) installAppBtn.style.display = 'none';
    showToast('PixelVault berhasil dipasang di Desktop / Layar Utama!', 'success');
  });
}

// Register Service Worker for PWA Offline & Desktop App Capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

// Start Application on DOM Ready
document.addEventListener('DOMContentLoaded', initApp);
