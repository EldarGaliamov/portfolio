const gate = document.querySelector('.office-access');
const form = gate.querySelector('form');
const input = form.querySelector('input');
const submit = form.querySelector('button');
const status = form.querySelector('[role="status"]');
const frame = document.querySelector('.office-access__case');
const subtle = globalThis.crypto?.subtle;
let caseUrl;
let encryptedCase;

function loadCase() {
  encryptedCase ??= fetch('./office-assignment.bin')
    .then((response) => {
      if (!response.ok) throw new Error('Case download failed.');
      return response.arrayBuffer();
    })
    .then((buffer) => {
      if (buffer.byteLength <= 44) throw new Error('Invalid case file.');
      return buffer;
    })
    .catch((error) => {
      encryptedCase = undefined;
      throw error;
    });
  return encryptedCase;
}

async function openCase(password, buffer) {
  // Salt and IV precede the AES-GCM ciphertext and its authentication tag.
  const salt = new Uint8Array(buffer, 0, 16);
  const iv = new Uint8Array(buffer, 16, 12);
  const material = await subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 600_000 },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  );
  const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv }, key, new Uint8Array(buffer, 28));

  const base = document.createElement('base');
  base.href = new URL('.', location.href).href;
  base.target = '_top';
  const html = new TextDecoder().decode(decrypted).replace('<head>', '<head>' + base.outerHTML);
  caseUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
  frame.src = caseUrl;
  frame.hidden = false;
  gate.hidden = true;
  frame.focus();
}

input.addEventListener('input', () => {
  input.removeAttribute('aria-invalid');
  status.textContent = '';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (submit.disabled) return;

  const password = input.value;
  input.readOnly = true;
  submit.disabled = true;
  input.removeAttribute('aria-invalid');
  status.textContent = 'Открываем кейс…';

  try {
    const buffer = await loadCase();
    await openCase(password, buffer);
    form.reset();
    status.textContent = '';
  } catch (error) {
    if (error.name === 'OperationError') {
      input.setAttribute('aria-invalid', 'true');
      status.textContent = 'Неверный пароль. Попробуйте ещё раз.';
    } else {
      status.textContent = 'Не удалось загрузить кейс. Попробуйте ещё раз.';
    }
    input.focus();
    input.select();
  } finally {
    input.readOnly = false;
    submit.disabled = false;
  }
});

window.addEventListener('pagehide', () => {
  form.reset();
  input.removeAttribute('aria-invalid');
  status.textContent = '';
  if (!caseUrl) return;
  frame.hidden = true;
  frame.removeAttribute('src');
  gate.hidden = false;
  URL.revokeObjectURL(caseUrl);
  caseUrl = undefined;
});

if (subtle) {
  input.disabled = false;
  submit.disabled = false;
} else {
  status.textContent = 'Откройте эту страницу по HTTPS в современном браузере.';
}
