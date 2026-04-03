/**
 * Password Generator Logic
 * Cryptographically secure, zero storage.
 */

const state = { 
    upper: true, 
    lower: true, 
    digits: true, 
    special: false, 
    usman: false 
};

let currentPw = '';

const CHARS = {
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lower: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
};

const FACES = [
  '(-_-)', '{-_-}', '[-=-]', '(0_0)', '(>_<)', '(^_^)',
  '(T_T)', '(*_*)', '(o_O)', '(._.)','(=_=)', '[@_@]',
  '{>_<}', '[o_o]', '(+_+)', '(x_x)', '(#_#)', '(-.-)',
  '(u_u)', '(~_~)', '{0_0}', '[^_^]', '(;_;)', '(v_v)'
];

/**
 * Toggle character sets or special modes
 * @param {string} key - The state key to toggle
 */
function toggle(key) {
  const btnUsman = document.getElementById('btn-usman');
  
  if (key === 'usman') {
    state.usman = !state.usman;
    btnUsman.classList.toggle('active', state.usman);
    
    if (state.usman) {
      // Disable others if Usman's mode is active
      ['upper','lower','digits','special'].forEach(k => {
        state[k] = false;
        document.getElementById('btn-' + k).classList.remove('active');
      });
    }
  } else {
    // If enabling a normal set, disable Usman's mode
    if (state.usman) {
      state.usman = false;
      btnUsman.classList.remove('active');
    }
    state[key] = !state[key];
    document.getElementById('btn-' + key).classList.toggle('active', state[key]);
  }
}

/**
 * Update length display on slider input
 */
function onSlider(value) {
  document.getElementById('lenVal').textContent = value;
}

/**
 * Cryptographically secure random integer
 */
function secureRandInt(max) {
  const arr = new Uint32Array(1);
  let res;
  do { 
    crypto.getRandomValues(arr); 
    res = arr[0]; 
  } while (res >= Math.floor(4294967296 / max) * max);
  return res % max;
}

/**
 * Main Generation Logic
 */
function generate() {
  const len = parseInt(document.getElementById('lenSlider').value);
  const display = document.getElementById('pwDisplay');

  // Handle Usman's Special Mode
  if (state.usman) {
    const parts = [];
    let totalLen = 0;
    
    while (totalLen < len) {
      const face = FACES[secureRandInt(FACES.length)];
      if (totalLen + face.length <= len) { 
        parts.push(face); 
        totalLen += face.length; 
      } else if (totalLen === 0) { 
        parts.push(face.slice(0, len)); 
        totalLen = len; 
      } else {
        break;
      }
    }
    
    // Fill remaining with special chars if faces don't fit perfectly
    if (totalLen < len) {
      const pad = '!@#$%^&*+-=|;:,.?~`';
      while (totalLen < len) {
        parts.push(pad[secureRandInt(pad.length)]);
        totalLen++;
      }
    }
    
    currentPw = parts.join('');
    display.textContent = currentPw;
    display.className = 'pw-text special-face';
    display.style.color = 'var(--amber)';
    
    setStrength(0, 'special');
    document.getElementById('entropyInfo').textContent = 'entropy: ∞ faces';
    document.getElementById('charsetInfo').textContent = 'charset: faces';
    return;
  }

  // Handle Standard Mode
  let pool = '';
  if (state.upper) pool += CHARS.upper;
  if (state.lower) pool += CHARS.lower;
  if (state.digits) pool += CHARS.digits;
  if (state.special) pool += CHARS.special;

  // Default to lowercase if nothing selected
  if (!pool) {
    state.lower = true;
    document.getElementById('btn-lower').classList.add('active');
    pool = CHARS.lower;
  }

  const pw = Array.from({length: len}, () => pool[secureRandInt(pool.length)]).join('');
  currentPw = pw;

  display.textContent = pw;
  display.className = 'pw-text';
  display.style.color = 'var(--green)';

  // Calculate Entropy & Strength
  const entropy = Math.floor(len * Math.log2(pool.length));
  const activeCount = [state.upper, state.lower, state.digits, state.special].filter(Boolean).length;
  
  let level = 0;
  if (len >= 8 && activeCount >= 1) level = 1;
  if (len >= 12 && activeCount >= 2) level = 2;
  if (len >= 16 && activeCount >= 3) level = 3;
  if (len >= 24 && activeCount >= 3) level = 4;
  if (len >= 32 && activeCount >= 4) level = 5;

  setStrength(level, ['', 'weak', 'fair', 'good', 'strong', 'elite'][level]);
  document.getElementById('entropyInfo').textContent = `entropy: ${entropy} bits`;
  document.getElementById('charsetInfo').textContent = `charset: ${pool.length} chars`;
}

/**
 * Update Strength UI
 */
function setStrength(level, label) {
  const colors = ['', 'var(--red)', 'var(--amber)', 'var(--amber)', 'var(--green)', 'var(--green)'];
  const labels = { 
    '': '--', 
    weak: 'WEAK', 
    fair: 'FAIR', 
    good: 'GOOD', 
    strong: 'STRONG', 
    elite: 'ELITE', 
    special: 'SPECIAL' 
  };
  
  for (let i = 1; i <= 5; i++) {
    const bar = document.getElementById('b' + i);
    bar.style.background = i <= level
      ? (colors[level] || 'var(--green)')
      : 'var(--color-border-tertiary)';
  }
  
  const lbl = document.getElementById('strengthLabel');
  lbl.textContent = labels[label] || label;
  
  if (label === 'special') {
    lbl.style.color = 'var(--amber)';
  } else {
    lbl.style.color = level >= 4 ? 'var(--green)' : level >= 2 ? 'var(--amber)' : 'var(--red)';
  }
}

/**
 * Copy to Clipboard
 */
function copyPw() {
  if (!currentPw) return;
  navigator.clipboard.writeText(currentPw).then(() => {
    const btn = document.getElementById('copyBtn');
    const originalText = btn.textContent;
    btn.textContent = 'COPIED!';
    btn.classList.add('copied');
    setTimeout(() => { 
        btn.textContent = originalText; 
        btn.classList.remove('copied'); 
    }, 1800);
  });
}

// Initial Generation
generate();
