/* ── 역대 출현 횟수 (lottolyzer.com, 2002.12 ~ 2026.05) ── */
const FREQ = {
   1:131,  2:114,  3:131,  4:119,  5:117,
   6:130,  7:132,  8:125,  9:108, 10:129,
  11:129, 12:147, 13:143, 14:133, 15:136,
  16:133, 17:132, 18:135, 19:127, 20:132,
  21:130, 22:117, 23:115, 24:130, 25:111,
  26:127, 27:141, 28:125, 29:122, 30:123,
  31:128, 32:113, 33:137, 34:144, 35:124,
  36:121, 37:124, 38:142, 39:128, 40:128,
  41:119, 42:116, 43:129, 44:125, 45:140
};

const GAMES = 5;
const MAX_FREQ = Math.max(...Object.values(FREQ));

/* 번호 → 볼 색상 */
function ballColor(n) {
  if (n <= 10) return 'y';
  if (n <= 20) return 'b';
  if (n <= 30) return 'r';
  if (n <= 40) return 's';
  return 'g';
}

/* 순위 (빈도 내림차순) */
const BY_FREQ = Object.keys(FREQ).map(Number).sort((a, b) => FREQ[b] - FREQ[a]);
function rankOf(n) { return BY_FREQ.indexOf(n) + 1; }

/* Hot/Cold 풀 */
const HOT_SET  = new Set(BY_FREQ.slice(0, 15));
const COLD_SET = new Set(BY_FREQ.slice(-15));

/* ── 뽑기 알고리즘 ── */
function pickWeighted() {
  const nums = Object.keys(FREQ).map(Number);
  const weights = nums.map(n => FREQ[n]);
  const total = weights.reduce((a, b) => a + b, 0);
  const picked = new Set();
  let tries = 0;
  while (picked.size < 6 && tries++ < 1000) {
    let r = Math.random() * total;
    for (let i = 0; i < nums.length; i++) {
      r -= weights[i];
      if (r <= 0) { if (!picked.has(nums[i])) picked.add(nums[i]); break; }
    }
  }
  return [...picked].sort((a, b) => a - b);
}

function pickRandom() {
  const pool = Array.from({ length: 45 }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 6).sort((a, b) => a - b);
}

/* Top N 고정 + 나머지 빈도수 기반 */
function pickTopN(n) {
  const fixed = BY_FREQ.slice(0, n);
  const fixedSet = new Set(fixed);
  const remaining = Object.keys(FREQ).map(Number).filter(x => !fixedSet.has(x));
  const weights = remaining.map(x => FREQ[x]);
  const total = weights.reduce((a, b) => a + b, 0);

  const extra = new Set();
  let tries = 0;
  while (extra.size < 6 - n && tries++ < 1000) {
    let r = Math.random() * total;
    for (let i = 0; i < remaining.length; i++) {
      r -= weights[i];
      if (r <= 0) { if (!extra.has(remaining[i])) extra.add(remaining[i]); break; }
    }
  }
  return [...fixed, ...extra].sort((a, b) => a - b);
}

/* Hot/Cold: 상위 15개(Hot) 3개 + 중립 15개 1개 + 하위 15개(Cold) 2개 */
function pickHotCold() {
  function pickFrom(pool, count) {
    const weights = pool.map(n => FREQ[n]);
    const total = weights.reduce((a, b) => a + b, 0);
    const picked = new Set();
    let tries = 0;
    while (picked.size < count && tries++ < 1000) {
      let r = Math.random() * total;
      for (let i = 0; i < pool.length; i++) {
        r -= weights[i];
        if (r <= 0) { if (!picked.has(pool[i])) picked.add(pool[i]); break; }
      }
    }
    return [...picked];
  }
  const hotPool     = BY_FREQ.slice(0, 15);
  const neutralPool = BY_FREQ.slice(15, 30);
  const coldPool    = BY_FREQ.slice(30);
  return [...pickFrom(hotPool, 3), ...pickFrom(neutralPool, 1), ...pickFrom(coldPool, 2)].sort((a, b) => a - b);
}

/* ── 꿈 번호 사전 ── */
const DREAM_DICT = {
  '돼지':     [4,9,14,24],  '호랑이': [3,8,38],   '용':     [8,18,28,38],
  '뱀':       [2,12,22],    '소':     [5,15,25],   '말':     [6,16,26],
  '개':       [1,11,21],    '고양이': [10,20],     '물고기': [7,17,27],
  '독수리':   [9,29],       '토끼':   [2,12],      '원숭이': [13,23],
  '거북이':   [8,18],       '사자':   [1,31],
  '돈 줍기':  [1,11,21],    '금덩이': [7,17,37],   '반지':   [8,18],
  '보석':     [3,13,33],    '복권':   [5,15,25],   '지갑':   [2,12],
  '통장':     [4,14],       '집 매입':[10,30],     '은행':   [5,35],
  '대통령':   [1,15,35],    '조상':   [4,14,24],   '결혼':   [2,22],
  '아기':     [3,13],       '승진':   [6,16],      '하늘비행':[9,19,39],
  '산 정상':  [8,28],       '무지개': [7,17],
  '맑은물':   [1,11],       '폭포':   [9,19],      '바다':   [5,15,25],
  '홍수':     [4,14],       '비':     [6,16],      '수영':   [3,23],
  '똥':       [1,7,9],      '똥 묻음':[17,27],     '똥 가득':[9,19,29],
  '피':       [4,9,19],     '코피':   [14],        '피 흘림':[29],
  '장례식':   [4,44],       '죽은 사람':[2,12],    '관':     [8,18],
  '묘지':     [5,15],
};
const DREAM_CATS = [
  { label: '🐷 동물', keys: ['돼지','호랑이','용','뱀','소','말','개','고양이','물고기','독수리','토끼','원숭이','거북이','사자'] },
  { label: '💰 재물', keys: ['돈 줍기','금덩이','반지','보석','복권','지갑','통장','집 매입','은행'] },
  { label: '🌟 길몽', keys: ['대통령','조상','결혼','아기','승진','하늘비행','산 정상','무지개'] },
  { label: '🌊 물',   keys: ['맑은물','폭포','바다','홍수','비','수영'] },
  { label: '💩 기타', keys: ['똥','똥 묻음','똥 가득','피','코피','피 흘림','장례식','죽은 사람','관','묘지'] },
];

/* 꿈번호 조합 */
let dreamSymbols    = new Set();
let dreamDirectNums = [];
let dreamRepeatSet  = new Set();
let dreamDirectSet  = new Set();

function pickDream() {
  const numCount = {};
  [...dreamSymbols].forEach(sym => {
    (DREAM_DICT[sym] || []).forEach(n => { numCount[n] = (numCount[n] || 0) + 1; });
  });
  dreamRepeatSet = new Set(Object.keys(numCount).map(Number).filter(n => numCount[n] >= 2));

  const direct = dreamDirectNums.filter(n => n >= 1 && n <= 45).slice(0, 3);
  dreamDirectSet = new Set(direct);

  const symbolNums = Object.keys(numCount).map(Number)
    .filter(n => !dreamDirectSet.has(n))
    .sort((a, b) => numCount[b] - numCount[a] || FREQ[b] - FREQ[a]);
  const symbolSet = new Set(symbolNums);
  const hotExtra  = BY_FREQ.slice(0, 15).filter(n => !dreamDirectSet.has(n) && !symbolSet.has(n));
  const hotSet    = new Set(hotExtra);
  const rest      = Object.keys(FREQ).map(Number).filter(n => !dreamDirectSet.has(n) && !symbolSet.has(n) && !hotSet.has(n));

  const pool = [], weights = [];
  symbolNums.forEach(n => { pool.push(n); weights.push(numCount[n] * 4 + FREQ[n] * 0.05); });
  hotExtra.forEach(n =>   { pool.push(n); weights.push(FREQ[n] * 0.04); });
  rest.forEach(n =>       { pool.push(n); weights.push(FREQ[n] * 0.01); });

  const totalW = weights.reduce((a, b) => a + b, 0);
  const picked = new Set(direct);
  let tries = 0;
  while (picked.size < 6 && tries++ < 2000) {
    let r = Math.random() * totalW;
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) { if (!picked.has(pool[i])) picked.add(pool[i]); break; }
    }
  }
  return [...picked].sort((a, b) => a - b);
}

function toggleDreamSymbol(key) {
  dreamSymbols.has(key) ? dreamSymbols.delete(key) : dreamSymbols.add(key);
  renderDreamSummary();
}

function addDreamDirectNum() {
  const input = document.getElementById('dreamNumInput');
  const v = parseInt(input.value, 10);
  input.value = '';
  if (!v || v < 1 || v > 45 || dreamDirectNums.includes(v) || dreamDirectNums.length >= 3) return;
  dreamDirectNums.push(v);
  renderDreamSummary();
}

function removeDreamDirectNum(n) {
  dreamDirectNums = dreamDirectNums.filter(x => x !== n);
  renderDreamSummary();
}

function renderDreamSummary() {
  DREAM_CATS.forEach(cat => {
    cat.keys.forEach(key => {
      const el = document.getElementById('dsym-' + key.replace(/\s/g, '_'));
      if (el) el.classList.toggle('active', dreamSymbols.has(key));
    });
  });

  const dd = document.getElementById('dreamDirectDisplay');
  if (dd) dd.innerHTML = dreamDirectNums.map(n =>
    `<span class="dream-direct-tag">${n}<button class="dream-tag-del" onclick="removeDreamDirectNum(${n})">×</button></span>`
  ).join('');

  const sm = document.getElementById('dreamSummary');
  if (!sm) return;
  const numCount = {};
  [...dreamSymbols].forEach(s => (DREAM_DICT[s]||[]).forEach(n => { numCount[n]=(numCount[n]||0)+1; }));
  const repeats = Object.keys(numCount).filter(n => numCount[n] >= 2).map(Number);
  if (dreamSymbols.size === 0 && dreamDirectNums.length === 0) {
    sm.className = 'dream-summary empty';
    sm.textContent = '상징 또는 직접 본 숫자를 선택 후 행운번호를 받아보세요.';
  } else {
    sm.className = 'dream-summary';
    let parts = [];
    if (dreamDirectNums.length > 0) parts.push(`직접 본 숫자 ${dreamDirectNums.join(', ')} 고정`);
    if (repeats.length > 0) parts.push(`반복 번호 ${repeats.join(', ')} 우선`);
    parts.push('HOT 번호 혼합');
    sm.textContent = parts.join(' · ');
  }
}

function renderDreamCats() {
  const c = document.getElementById('dreamCats');
  if (!c) return;
  c.innerHTML = DREAM_CATS.map(cat => `
    <div class="dream-cat">
      <div class="dream-cat-label">${cat.label}</div>
      <div class="dream-tags">${cat.keys.map(key =>
        `<button class="dream-tag-btn" id="dsym-${key.replace(/\s/g,'_')}" data-key="${key}" onclick="toggleDreamSymbol(this.dataset.key)">${key}</button>`
      ).join('')}</div>
    </div>`).join('');
}

/* 통계 조합 최적화: 실제 홀짝 비율 가중 선택 + 저고·합계·끝수 필터 */
function pickCombo() {
  /* 실제 통계: 3:3≈33.6%, 4:2≈26.7%, 2:4≈22.2%, 나머지≈17.5% */
  function targetOdds() {
    const r = Math.random() * 100;
    if (r < 33.6) return 3;
    if (r < 60.3) return 4;
    if (r < 82.5) return 2;
    return 3;
  }
  function isValid(nums, targetOdd) {
    if (nums.filter(n => n % 2 !== 0).length !== targetOdd) return false;
    const lows = nums.filter(n => n <= 22).length;
    if (lows < 2 || lows > 4) return false;
    const sum = nums.reduce((a, b) => a + b, 0);
    if (sum < 100 || sum > 170) return false;
    const tailMap = {};
    nums.forEach(n => { const t = n % 10; tailMap[t] = (tailMap[t] || 0) + 1; });
    if (Object.values(tailMap).some(c => c > 2)) return false;
    return true;
  }
  const target = targetOdds();
  for (let i = 0; i < 500; i++) {
    const nums = pickWeighted();
    if (isValid(nums, target)) return nums;
  }
  return pickWeighted();
}

/* 모드별 설명 */
const MODE_DESC = {
  freq:    { title: '📊 빈도수 기반', text: '2002년 12월 ~ 2026년 5월 전체 회차의 1등 당첨 번호 출현 횟수에 비례한 가중 확률로 번호를 추출합니다. 많이 등장한 번호일수록 더 높은 확률로 선택됩니다.' },
  random:  { title: '🎲 순수 랜덤', text: '1~45 모든 번호를 완전히 동일한 확률로 추출합니다. 통계와 무관하게 순수하게 운에 맡기는 방식으로, 매 게임 독립적인 조합이 생성됩니다.' },
  topn:    { title: '🏆 Top 번호 고정', text: '역대 가장 많이 출현한 상위 N개 번호를 매 게임에 반드시 포함하고, 나머지는 빈도수 기반으로 추출합니다. N은 1~6 중 선택할 수 있습니다.' },
  hotcold: { title: '🔥 Hot/Cold 분석', text: '빈도 상위 15개(Hot 🔥) 3개 + 중립 15개 1개 + 하위 15개(Cold ❄️) 2개를 조합합니다. "흐름이 이어진다"는 Hot 가설과 "안 나온 번호는 곧 나온다"는 Cold 가설, 중립 번호까지 균형 있게 반영한 혼합 전략입니다.' },
  combo:   { title: '🎯 AI통계조합 최적화', text: '실제 통계 기반 홀짝 비율(3:3 약 34% · 4:2 약 27% · 2:4 약 22%)로 가중 선택 후, 저고 비율(1~22 / 23~45), 합계값(100~170), 끝수 중복(2개 이하) 조건을 추가 적용합니다. 극단 조합(6홀 · 6짝)은 자동 제외됩니다.' },
  dream:   { title: '🌙 꿈번호 조합', text: '꿈의 핵심 상징을 선택하면 반복 등장 번호를 우선 추출합니다. 꿈에서 직접 본 숫자는 최우선 고정되며, 나머지 슬롯은 역대 HOT 번호와 혼합해 6개를 완성합니다.' },
};

function updateModeDesc() {
  const d = MODE_DESC[mode];
  document.getElementById('modeDescTitle').textContent = d.title;
  document.getElementById('modeDescText').textContent = d.text;
}

/* ── 상태 ── */
let mode = 'topn';
let topN = 3;
let lastPicked = [];
let statsOpen = false;
let statSort = 'freq';

function setMode(m) {
  mode = m;
  ['Freq','Random','TopN','Hotcold','Combo','Dream'].forEach(k => {
    document.getElementById('btn' + k).classList.toggle('active', m === k.toLowerCase());
  });
  document.getElementById('topnWrap').classList.toggle('visible', m === 'topn');
  document.getElementById('dreamWrap').classList.toggle('visible', m === 'dream');
  updateModeDesc();
  clearBoard();
}

function setTopN(n) {
  topN = n;
  document.getElementById('topnLabelNum').textContent = n;
  document.querySelectorAll('.topn-btn').forEach((btn, i) => {
    btn.classList.toggle('active', i + 1 === n);
  });
  clearBoard();
}

/* ── 생성 ── */
function generate() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  lastPicked = [];

  const fixedNums = mode === 'topn' ? new Set(BY_FREQ.slice(0, topN)) : new Set();

  for (let g = 0; g < GAMES; g++) {
    const nums = mode === 'freq'    ? pickWeighted()
               : mode === 'random'  ? pickRandom()
               : mode === 'topn'    ? pickTopN(topN)
               : mode === 'hotcold' ? pickHotCold()
               : mode === 'combo'   ? pickCombo()
               : mode === 'dream'   ? pickDream()
               :                      pickWeighted();

    lastPicked.push(...nums);

    const row = document.createElement('div');
    row.className = 'game-row';

    const ballsHTML = nums.map(n => {
      const rank = rankOf(n);
      const isFixed      = mode === 'topn'    && fixedNums.has(n);
      const isHotBall    = mode === 'hotcold' && HOT_SET.has(n);
      const isColdBall   = mode === 'hotcold' && COLD_SET.has(n);
      const isDreamDirect= mode === 'dream'   && dreamDirectSet.has(n);
      const isDreamRepeat= mode === 'dream'   && !isDreamDirect && dreamRepeatSet.has(n);
      const isDreamHot   = mode === 'dream'   && !isDreamDirect && !isDreamRepeat && HOT_SET.has(n);
      const isHot = rank <= 5;
      const rankLabel = isDreamDirect ? '✍️ 직접'
                      : isDreamRepeat ? '✦ 반복'
                      : isDreamHot    ? `🔥 ${rank}위`
                      : isFixed       ? '📌 고정'
                      : isHotBall     ? `🔥 ${rank}위`
                      : isColdBall    ? `❄️ ${rank}위`
                      : isHot         ? `🔥 ${rank}위`
                      :                 `${rank}위`;
      const rankClass = isDreamDirect ? 'dream-direct'
                      : isDreamRepeat ? 'dream-repeat'
                      : isFixed || isHot || isHotBall || isDreamHot ? 'hot'
                      : isColdBall ? 'cold' : '';
      const ballExtra = isFixed ? 'fixed-ball' : isDreamDirect ? 'dream-fixed-ball' : '';
      const showRank = mode !== 'random';
      const titleExtra = isDreamDirect ? ' · 직접 본 숫자' : isDreamRepeat ? ' · 반복 상징' : isDreamHot ? ' · HOT 혼합' : isFixed ? ' · 고정번호' : isHotBall ? ' · Hot' : isColdBall ? ' · Cold' : '';
      return `
        <div class="ball-wrap">
          <div class="ball ${ballColor(n)} ${ballExtra}"
               title="${n}번 · 역대 ${FREQ[n]}회 (${rank}위)${titleExtra}">${n}</div>
          <span class="ball-rank ${rankClass}">${showRank ? rankLabel : ''}</span>
        </div>`;
    }).join('');

    row.innerHTML = `<span class="game-label">${'ABCDE'[g]}</span><div class="balls">${ballsHTML}</div>`;
    board.appendChild(row);

    /* 볼 순차 등장 */
    row.querySelectorAll('.ball').forEach((ball, i) => {
      setTimeout(() => ball.classList.add('show'), g * 90 + i * 65);
    });

    /* 순위 뱃지 등장 */
    if (mode !== 'random') {
      row.querySelectorAll('.ball-rank').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), g * 90 + i * 65 + 350);
      });
    }
  }

  updateStatsHighlight();
  const delay = GAMES * 90 + 6 * 65 + 100;
  setTimeout(() => {
    document.getElementById('btnSave').disabled = false;
    renderTicket(lastPicked.reduce((acc, _, i) => {
      if (i % 6 === 0) acc.push([]);
      acc[acc.length - 1].push(lastPicked[i]);
      return acc;
    }, []));
  }, delay);
}

/* ── 초기화 ── */
function clearBoard() {
  lastPicked = [];
  const board = document.getElementById('board');
  board.innerHTML = '';
  for (let g = 0; g < GAMES; g++) {
    const row = document.createElement('div');
    row.className = 'game-row';
    row.innerHTML = `
      <span class="game-label">${'ABCDE'[g]}</span>
      <div class="balls">${Array(6).fill('<div class="ball-placeholder"></div>').join('')}</div>`;
    board.appendChild(row);
  }
  document.getElementById('btnSave').disabled = true;
  const ts = document.getElementById('ticketSection');
  ts.classList.remove('visible');
  document.getElementById('ticketGames').innerHTML = '';
  updateStatsHighlight();
}

/* ── 통계 패널 ── */
function toggleStats() {
  statsOpen = !statsOpen;
  document.getElementById('statsBody').classList.toggle('open', statsOpen);
  document.getElementById('statsIcon').classList.toggle('open', statsOpen);
}

function sortStats(by) {
  statSort = by;
  document.querySelectorAll('.sort-tab').forEach((el, i) => {
    el.classList.toggle('active', ['freq','asc','rare'][i] === by);
  });
  renderStats();
}

function renderStats() {
  const order = statSort === 'asc'  ? Object.keys(FREQ).map(Number)
              : statSort === 'rare' ? [...BY_FREQ].reverse()
              :                       BY_FREQ;

  const picked = new Set(lastPicked);
  document.getElementById('statsGrid').innerHTML = order.map(n => `
    <div class="stat-card ${picked.has(n) ? 'picked' : ''}" id="sc-${n}">
      <div class="stat-num">${n}</div>
      <div class="stat-bar-wrap">
        <div class="stat-bar" style="width:${(FREQ[n] / MAX_FREQ * 100).toFixed(1)}%"></div>
      </div>
      <div class="stat-count">${FREQ[n]}회</div>
    </div>`).join('');
}

function updateStatsHighlight() {
  const picked = new Set(lastPicked);
  document.querySelectorAll('.stat-card').forEach(el => {
    const n = parseInt(el.id.replace('sc-', ''));
    el.classList.toggle('picked', picked.has(n));
  });
}

/* ── 테마 토글 ── */
function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    document.getElementById('themeIcon').textContent = '☀️';
  } else {
    document.body.classList.remove('dark-mode');
    document.getElementById('themeIcon').textContent = '🌙';
  }
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
}

/* ── 로또 기입 용지 ── */
function renderTicket(gameNums) {
  const container = document.getElementById('ticketGames');
  const LABELS = ['A', 'B', 'C', 'D', 'E'];

  container.innerHTML = gameNums.map((nums, g) => {
    const sel = new Set(nums);
    let cells = '';
    for (let n = 1; n <= 49; n++) {
      if (n <= 45) {
        const c = ballColor(n);
        const picked = sel.has(n);
        cells += `<div class="tg-cell${picked ? ' tg-' + c : ''}">${n}</div>`;
      } else {
        cells += '<div class="tg-cell tg-empty"></div>';
      }
    }
    return `
      <div class="ticket-game">
        <div class="tg-header">
          <span class="tg-label">${LABELS[g]}</span>
          <span class="tg-price">1,000원</span>
        </div>
        <div class="tg-grid">${cells}</div>
        <div class="tg-footer">자동 및 번호선택</div>
      </div>`;
  }).join('');

  document.getElementById('ticketSection').classList.add('visible');
}

/* ── 이미지 저장 ── */
function ballGradientColors(n) {
  if (n <= 10) return ['#ffe566', '#f9a800'];
  if (n <= 20) return ['#90caf9', '#1565c0'];
  if (n <= 30) return ['#ef9a9a', '#c62828'];
  if (n <= 40) return ['#cfd8dc', '#546e7a'];
  return ['#dce775', '#558b2f'];
}

function drawLottoCanvas(gameNums) {
  const isDark = document.body.classList.contains('dark-mode');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = 800;
  const ROW_H = 108;
  const HEADER_H = 100;
  const FOOTER_H = 44;

  // 티켓 상수
  const BRAND_W = 36;
  const CELL = 18, CELL_GAP = 2;
  const GRID_W = 7 * CELL + 6 * CELL_GAP;  // 138
  const GRID_H = GRID_W;
  const GH_H = 28, GF_H = 16, GP_Y = 5;
  const GAME_H = GH_H + GP_Y + GRID_H + GP_Y + GF_H;  // 197
  const GAME_W = (W - BRAND_W) / 5;  // 152.8
  const TICKET_LABEL_H = 32;
  const TICKET_H = TICKET_LABEL_H + GAME_H;

  const H = HEADER_H + gameNums.length * ROW_H + 16 + TICKET_H + FOOTER_H;

  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // Background
  ctx.fillStyle = isDark ? '#0d1117' : '#f6f8fa';
  ctx.fillRect(0, 0, W, H);

  // Header bg strip
  ctx.fillStyle = isDark ? '#161b22' : '#ffffff';
  ctx.fillRect(0, 0, W, HEADER_H);

  // Title
  ctx.textAlign = 'center';
  ctx.fillStyle = isDark ? '#e6edf3' : '#1f2328';
  ctx.font = 'bold 20px system-ui,-apple-system,sans-serif';
  ctx.fillText('통계왕 AI Lotto 번호 생성기', W / 2, 36);

  // Subtitle
  const today = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  ctx.fillStyle = isDark ? '#8b949e' : '#636c76';
  ctx.font = '12px system-ui,-apple-system,sans-serif';
  ctx.fillText(`${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${days[today.getDay()]}) 생성`, W / 2, 58);

  // Separator
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(24, HEADER_H - 1);
  ctx.lineTo(W - 24, HEADER_H - 1);
  ctx.stroke();

  // Rows
  const LABEL_W = 50;
  const PAD_X = 32;
  const BALL_R = 30;
  const availW = W - PAD_X * 2 - LABEL_W;
  const spacing = availW / 6;
  const firstCX = PAD_X + LABEL_W + spacing / 2;

  gameNums.forEach((nums, g) => {
    const rowY = HEADER_H + g * ROW_H;
    const cy = rowY + ROW_H / 2;

    // Row bg (alternating)
    ctx.fillStyle = isDark
      ? (g % 2 === 0 ? '#161b22' : '#1c2230')
      : (g % 2 === 0 ? '#ffffff' : '#f6f8fa');
    ctx.fillRect(0, rowY, W, ROW_H);

    // Label
    ctx.fillStyle = '#cc1f2b';
    ctx.font = 'bold 26px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('ABCDE'[g], PAD_X, cy);

    // Balls
    nums.forEach((n, i) => {
      const cx = firstCX + i * spacing;
      const [c1, c2] = ballGradientColors(n);

      // Ball fill
      const grad = ctx.createRadialGradient(cx - BALL_R * 0.2, cy - BALL_R * 0.25, 0, cx, cy, BALL_R);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Shine
      const shine = ctx.createRadialGradient(cx - BALL_R * 0.18, cy - BALL_R * 0.22, 0, cx - BALL_R * 0.1, cy - BALL_R * 0.15, BALL_R * 0.5);
      shine.addColorStop(0, 'rgba(255,255,255,0.3)');
      shine.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(cx, cy, BALL_R, 0, Math.PI * 2);
      ctx.fillStyle = shine;
      ctx.fill();

      // Number
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${n >= 10 ? 18 : 20}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(n, cx, cy + 0.5);
      ctx.shadowBlur = 0;
    });
  });

  // ── 로또 기입 용지 ──
  const tBase = HEADER_H + gameNums.length * ROW_H + 12;

  // 섹션 라벨
  ctx.fillStyle = isDark ? '#8b949e' : '#636c76';
  ctx.font = 'bold 11px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('📋  로또 기입 용지', W / 2, tBase + 13);

  const tY = tBase + TICKET_LABEL_H;

  // 티켓 배경
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, tY, W, GAME_H);
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, tY + 0.5, W - 1, GAME_H - 1);

  // 브랜드 스트립
  ctx.fillStyle = '#cc1f2b';
  ctx.fillRect(0, tY, BRAND_W, GAME_H);
  ctx.save();
  ctx.translate(BRAND_W / 2, tY + GAME_H / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = '#fff';
  ctx.font = 'italic bold 10px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Lotto 6/45', 0, 0);
  ctx.restore();

  const GAME_LABELS = ['A', 'B', 'C', 'D', 'E'];
  gameNums.forEach((nums, g) => {
    const sel = new Set(nums);
    const gX = BRAND_W + g * GAME_W;

    // 게임 구분선
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gX + 0.5, tY);
    ctx.lineTo(gX + 0.5, tY + GAME_H);
    ctx.stroke();

    // 헤더 배경
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(gX, tY, GAME_W, GH_H);
    ctx.strokeStyle = '#e0e0e0';
    ctx.beginPath();
    ctx.moveTo(gX, tY + GH_H);
    ctx.lineTo(gX + GAME_W, tY + GH_H);
    ctx.stroke();

    // 게임 레이블
    ctx.fillStyle = '#cc1f2b';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(GAME_LABELS[g], gX + 6, tY + GH_H / 2);

    // 가격
    ctx.fillStyle = '#666';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText('1,000원', gX + GAME_W - 5, tY + GH_H / 2);

    // 숫자 그리드
    const gridX = gX + (GAME_W - GRID_W) / 2;
    const gridY = tY + GH_H + GP_Y;

    for (let n = 1; n <= 45; n++) {
      const row = Math.floor((n - 1) / 7);
      const col = (n - 1) % 7;
      const cx = gridX + col * (CELL + CELL_GAP) + CELL / 2;
      const cy = gridY + row * (CELL + CELL_GAP) + CELL / 2;
      const r = CELL / 2 - 0.5;

      if (sel.has(n)) {
        const [c1, c2] = ballGradientColors(n);
        const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.25, 0, cx, cy, r);
        grad.addColorStop(0, c1);
        grad.addColorStop(1, c2);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.fillStyle = n <= 10 ? '#5a3800' : '#fff';
        ctx.font = `bold ${n >= 10 ? 9 : 10}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n, cx, cy + 0.5);
      } else {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.fillStyle = '#999';
        ctx.font = `9px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n, cx, cy + 0.5);
      }
    }

    // 게임 푸터
    ctx.fillStyle = '#aaa';
    ctx.font = '9px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('자동 및 번호선택', gX + GAME_W / 2, tY + GH_H + GP_Y + GRID_H + GP_Y + GF_H / 2);
  });

  // Footer
  ctx.fillStyle = isDark ? '#8b949e' : '#636c76';
  ctx.font = '10px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('재미용 서비스 · 당첨 보장 없음 · ailottoo.pages.dev', W / 2, tY + GAME_H + FOOTER_H / 2);

  return canvas;
}

function triggerDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showToast(msg) {
  let toast = document.getElementById('saveToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'saveToast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2500);
}

async function saveAsImage() {
  if (lastPicked.length === 0) return;

  const gameNums = [];
  document.querySelectorAll('#board .game-row').forEach(row => {
    const nums = [...row.querySelectorAll('.ball')].map(b => parseInt(b.textContent));
    if (nums.length === 6) gameNums.push(nums);
  });
  if (gameNums.length === 0) return;

  const canvas = drawLottoCanvas(gameNums);
  canvas.toBlob(async (blob) => {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const datePart = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
    const timePart = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `lotto-${datePart}_${timePart}.png`;

    // 1. 다운로드 폴더에 저장
    triggerDownload(blob, fileName);

    // 2. 클립보드에 복사 (카카오톡 등 붙여넣기용)
    let clipboardOk = false;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      clipboardOk = true;
    } catch (e) {
      // 클립보드 API 미지원 환경 무시
    }

    showToast(clipboardOk ? '📋 저장 완료! 카카오톡에 바로 붙여넣기 가능합니다.' : '💾 다운로드 폴더에 저장되었습니다.');

    // 3. 모바일 공유 시트 (추가 옵션)
    try {
      const file = new File([blob], fileName, { type: 'image/png' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: '통계왕 AI Lotto 번호로 운수대통!' });
      }
    } catch (e) {
      // AbortError(사용자 취소)는 무시
    }
  }, 'image/png');
}

/* ── 초기 렌더 ── */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    renderDreamCats();
    setMode('topn');
    renderStats();
});
