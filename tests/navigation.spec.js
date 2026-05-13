// @ts-check
const { test, expect } = require('@playwright/test');

const BASE = 'https://ailottoo.pages.dev';

// ──────────────────────────────────────────────
// 1. 페이지 로드 & 기본 구조
// ──────────────────────────────────────────────
test.describe('페이지 로드 & 기본 구조', () => {
  test('홈페이지가 정상 로드된다', async ({ page }) => {
    const res = await page.goto(BASE);
    expect(res.status()).toBe(200);
    await expect(page).toHaveTitle(/통계왕 AI Lotto/);
  });

  test('헤더 타이틀 이미지가 표시된다', async ({ page }) => {
    await page.goto(BASE);
    const titleImg = page.locator('h1 img[alt="통계왕 AI Lotto 번호 생성기"]');
    await expect(titleImg).toBeVisible();
  });

  test('테마 토글 버튼이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#themeToggle')).toBeVisible();
  });

  test('푸터가 존재하고 저작권 텍스트가 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.site-footer')).toBeVisible();
    await expect(page.locator('.footer-copy')).toContainText('© 2026 통계왕 AI Lotto');
  });

  test('다음 추첨 카운트다운이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#drawInfo')).toContainText('추첨');
  });
});

// ──────────────────────────────────────────────
// 2. 푸터 네비게이션
// ──────────────────────────────────────────────
test.describe('푸터 네비게이션', () => {
  test('홈 링크가 / 를 가리킨다', async ({ page }) => {
    await page.goto(BASE);
    const homeLink = page.locator('.footer-nav a[href="/"]');
    await expect(homeLink).toBeVisible();
    await expect(homeLink).toHaveText('홈');
  });

  test('홈 링크에 aria-current="page" 가 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.footer-nav a[href="/"]')).toHaveAttribute('aria-current', 'page');
  });

  test('꿈별 숫자 사전 링크가 정상 로드된다', async ({ page }) => {
    await page.goto(BASE);
    await Promise.all([
      page.waitForURL('**/dream-numbers.html'),
      page.locator('a[href="/dream-numbers.html"]').click(),
    ]);
    await expect(page.locator('body')).toContainText('꿈');
  });

  test('개인정보처리방침 링크가 정상 로드된다', async ({ page }) => {
    await page.goto(BASE);
    await Promise.all([
      page.waitForURL('**/privacy.html'),
      page.locator('a[href="/privacy.html"]').click(),
    ]);
    await expect(page.locator('body')).toContainText('개인정보');
  });

  test('동행복권 외부 링크에 noopener noreferrer 가 있다', async ({ page }) => {
    await page.goto(BASE);
    const dhLink = page.locator('a[href="https://www.dhlottery.co.kr"]');
    await expect(dhLink).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(dhLink).toHaveAttribute('target', '_blank');
  });
});

// ──────────────────────────────────────────────
// 3. 모드 전환
// ──────────────────────────────────────────────
test.describe('모드 전환', () => {
  const modes = [
    { id: 'btnFreq',    label: '빈도수 기반',    key: 'freq' },
    { id: 'btnRandom',  label: '순수 랜덤',      key: 'random' },
    { id: 'btnTopN',    label: 'Top 번호 고정',  key: 'topn' },
    { id: 'btnHotcold', label: 'Hot/Cold',       key: 'hotcold' },
    { id: 'btnCombo',   label: 'AI통계조합',     key: 'combo' },
    { id: 'btnDream',   label: '꿈번호 조합',    key: 'dream' },
  ];

  for (const m of modes) {
    test(`[${m.label}] 모드 버튼 클릭 시 active 상태가 된다`, async ({ page }) => {
      await page.goto(BASE);
      await page.locator(`#${m.id}`).click();
      await expect(page.locator(`#${m.id}`)).toHaveClass(/active/);
    });

    test(`[${m.label}] 모드 버튼 클릭 시 aria-pressed="true" 가 된다`, async ({ page }) => {
      await page.goto(BASE);
      await page.locator(`#${m.id}`).click();
      await expect(page.locator(`#${m.id}`)).toHaveAttribute('aria-pressed', 'true');
    });
  }

  test('모드 전환 시 다른 버튼의 aria-pressed 는 false 가 된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnRandom').click();
    await expect(page.locator('#btnTopN')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#btnFreq')).toHaveAttribute('aria-pressed', 'false');
  });

  test('Top N 모드: 서브 셀렉터가 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnTopN').click();
    await expect(page.locator('#topnWrap')).toBeVisible();
  });

  test('Top N 모드: N 값 변경이 동작한다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnTopN').click();
    await page.locator('.topn-btn', { hasText: '5' }).click();
    await expect(page.locator('#topnLabelNum')).toHaveText('5');
    await expect(page.locator('.topn-btn', { hasText: '5' })).toHaveClass(/active/);
  });

  test('꿈번호 모드: 드림 패널이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    await expect(page.locator('#dreamWrap')).toBeVisible();
  });

  test('비 Dream 모드에서 드림 패널이 숨겨진다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    await page.locator('#btnFreq').click();
    await expect(page.locator('#dreamWrap')).toBeHidden();
  });

  test('모드 설명 텍스트가 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnHotcold').click();
    await expect(page.locator('#modeDescTitle')).toContainText('Hot/Cold');
    await expect(page.locator('#modeDescText')).not.toBeEmpty();
  });
});

// ──────────────────────────────────────────────
// 4. 번호 생성 & 초기화
// ──────────────────────────────────────────────
test.describe('번호 생성 & 초기화', () => {
  test('행운번호 받기 버튼이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.btn-generate-img')).toBeVisible();
  });

  test('번호 생성 클릭 시 게임 행(A~E)이 나타난다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    // 볼 등장 애니메이션 대기
    await page.waitForTimeout(1500);
    const rows = page.locator('#board .game-row');
    await expect(rows).toHaveCount(5);
  });

  test('번호 생성 후 각 행에 볼이 6개씩 있다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    const firstRowBalls = page.locator('#board .game-row:first-child .ball');
    await expect(firstRowBalls).toHaveCount(6);
  });

  test('번호 생성 후 저장 버튼이 활성화된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#btnSave')).toBeEnabled();
  });

  test('번호 생성 후 로또 기입 용지가 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(2000);
    await expect(page.locator('#ticketSection')).toHaveClass(/visible/);
  });

  test('초기화 버튼 클릭 시 보드가 비워진다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("초기화")').click();
    const balls = page.locator('#board .ball');
    await expect(balls).toHaveCount(0);
  });

  test('초기화 후 저장 버튼이 비활성화된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("초기화")').click();
    await expect(page.locator('#btnSave')).toBeDisabled();
  });
});

// ──────────────────────────────────────────────
// 5. 통계 패널 (아코디언)
// ──────────────────────────────────────────────
test.describe('통계 패널 아코디언', () => {
  test('출현 통계 패널이 기본 닫힘 상태이다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#statsBody')).not.toHaveClass(/open/);
  });

  test('출현 통계 헤더 클릭 시 패널이 열린다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#statsToggleBtn').click();
    await expect(page.locator('#statsBody')).toHaveClass(/open/);
  });

  test('출현 통계 열리면 aria-expanded="true" 가 된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#statsToggleBtn').click();
    await expect(page.locator('#statsToggleBtn')).toHaveAttribute('aria-expanded', 'true');
  });

  test('출현 통계 다시 클릭 시 닫힌다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#statsToggleBtn').click();
    await page.locator('#statsToggleBtn').click();
    await expect(page.locator('#statsBody')).not.toHaveClass(/open/);
    await expect(page.locator('#statsToggleBtn')).toHaveAttribute('aria-expanded', 'false');
  });

  test('출현 통계 키보드(Enter)로 열 수 있다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#statsToggleBtn').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#statsBody')).toHaveClass(/open/);
  });

  test('정렬 탭 전환이 동작한다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#statsToggleBtn').click();
    await page.locator('.sort-tab', { hasText: '번호 오름차순' }).click();
    await expect(page.locator('.sort-tab', { hasText: '번호 오름차순' })).toHaveClass(/active/);
  });

  test('미출현 통계 패널이 기본 닫힘 상태이다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#absenceBody')).not.toHaveClass(/open/);
  });

  test('미출현 통계 헤더 클릭 시 열리고 aria-expanded 가 바뀐다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#absenceToggleBtn').click();
    await expect(page.locator('#absenceBody')).toHaveClass(/open/);
    await expect(page.locator('#absenceToggleBtn')).toHaveAttribute('aria-expanded', 'true');
  });
});

// ──────────────────────────────────────────────
// 6. FAQ 섹션
// ──────────────────────────────────────────────
test.describe('FAQ 섹션', () => {
  test('FAQ 항목이 10개 이상 렌더링된다', async ({ page }) => {
    await page.goto(BASE);
    const items = page.locator('.faq-item');
    await expect(items).toHaveCount(10);
  });

  test('FAQ 버튼 클릭 시 답변이 열린다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-1').click();
    await expect(page.locator('.faq-item:first-child')).toHaveClass(/open/);
  });

  test('FAQ 열리면 aria-expanded="true" 가 된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-1').click();
    await expect(page.locator('#faq-q-1')).toHaveAttribute('aria-expanded', 'true');
  });

  test('FAQ 다시 클릭 시 닫힌다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-1').click();
    await page.locator('#faq-q-1').click();
    await expect(page.locator('#faq-q-1')).toHaveAttribute('aria-expanded', 'false');
  });

  test('FAQ 하나 열면 다른 항목은 닫힌다 (accordion 동작)', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-1').click();
    await page.locator('#faq-q-2').click();
    await expect(page.locator('#faq-q-1')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#faq-q-2')).toHaveAttribute('aria-expanded', 'true');
  });

  test('Hot/Cold FAQ 항목(#faq-q-9)이 존재하고 열린다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-9').click();
    await expect(page.locator('#faq-a-9')).toBeVisible();
    await expect(page.locator('#faq-a-9')).toContainText('Hot');
  });

  test('AI통계조합 FAQ 항목(#faq-q-10)이 존재하고 열린다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#faq-q-10').click();
    await expect(page.locator('#faq-a-10')).toBeVisible();
    await expect(page.locator('#faq-a-10')).toContainText('홀짝');
  });
});

// ──────────────────────────────────────────────
// 7. 테마 전환 (다크모드)
// ──────────────────────────────────────────────
test.describe('테마 전환', () => {
  test('테마 토글 클릭 시 dark-mode 클래스가 토글된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#themeToggle').click();
    await expect(page.locator('body')).toHaveClass(/dark-mode/);
  });

  test('다크모드 → 다시 클릭 시 라이트모드로 돌아온다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#themeToggle').click();
    await page.locator('#themeToggle').click();
    await expect(page.locator('body')).not.toHaveClass(/dark-mode/);
  });

  test('다크모드 상태가 localStorage 에 저장된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#themeToggle').click();
    const theme = await page.evaluate(() => localStorage.getItem('theme'));
    expect(theme).toBe('dark');
  });
});

// ──────────────────────────────────────────────
// 8. 꿈번호 패널 상호작용
// ──────────────────────────────────────────────
test.describe('꿈번호 패널', () => {
  test('꿈 상징 버튼 클릭 시 active 상태가 된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    const pigBtn = page.locator('#dsym-돼지');
    await pigBtn.click();
    await expect(pigBtn).toHaveClass(/active/);
  });

  test('꿈 상징 다시 클릭 시 active 해제된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    const pigBtn = page.locator('#dsym-돼지');
    await pigBtn.click();
    await pigBtn.click();
    await expect(pigBtn).not.toHaveClass(/active/);
  });

  test('직접 본 숫자 입력 후 추가 버튼이 동작한다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    await page.locator('#dreamNumInput').fill('7');
    await page.locator('.dream-add-btn').click();
    await expect(page.locator('.dream-direct-tag')).toContainText('7');
  });

  test('직접 본 숫자 삭제(×) 버튼이 동작한다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    await page.locator('#dreamNumInput').fill('7');
    await page.locator('.dream-add-btn').click();
    await page.locator('.dream-tag-del').click();
    await expect(page.locator('.dream-direct-tag')).toHaveCount(0);
  });

  test('꿈번호 모드에서 번호 생성이 동작한다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('#btnDream').click();
    await page.locator('#dsym-돼지').click();
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#board .game-row')).toHaveCount(5);
  });
});

// ──────────────────────────────────────────────
// 9. 지도 섹션
// ──────────────────────────────────────────────
test.describe('지도 섹션', () => {
  test('지도 섹션이 페이지에 존재한다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.map-section')).toBeVisible();
  });

  test('"내 위치로 다시 찾기" 버튼이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.map-refresh-btn')).toBeVisible();
  });

  test('동행복권 1등 명당 링크가 noopener noreferrer 를 가진다', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('.map-dhlottery-btn');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
  });

  test('추첨 결과 링크가 noopener noreferrer 를 가진다', async ({ page }) => {
    await page.goto(BASE);
    const link = page.locator('.result-link-btn');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAttribute('target', '_blank');
  });
});

// ──────────────────────────────────────────────
// 10. 접근성 기본 검사
// ──────────────────────────────────────────────
test.describe('접근성', () => {
  test('<html> 에 lang="ko" 가 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
  });

  test('title.png 이미지에 alt 텍스트가 있다', async ({ page }) => {
    await page.goto(BASE);
    const img = page.locator('img[src="title.png"]');
    await expect(img).toHaveAttribute('alt', '통계왕 AI Lotto 번호 생성기');
  });

  test('꿈번호 입력 필드에 aria-label 이 있다', async ({ page }) => {
    await page.goto(BASE);
    const input = page.locator('#dreamNumInput');
    await expect(input).toHaveAttribute('aria-label');
  });

  test('통계 패널 헤더에 role="button" 이 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('#statsToggleBtn')).toHaveAttribute('role', 'button');
    await expect(page.locator('#absenceToggleBtn')).toHaveAttribute('role', 'button');
  });

  test('FAQ 버튼에 aria-expanded 속성이 있다', async ({ page }) => {
    await page.goto(BASE);
    const firstFaq = page.locator('#faq-q-1');
    await expect(firstFaq).toHaveAttribute('aria-expanded', 'false');
  });

  test('Open Graph 태그가 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /통계왕/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /ailottoo/);
  });

  test('canonical 링크 태그가 있다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /ailottoo/);
  });
});

// ──────────────────────────────────────────────
// 11. 서브 페이지 네비게이션
// ──────────────────────────────────────────────
test.describe('서브 페이지', () => {
  test('꿈별 숫자 사전 페이지가 정상 로드된다', async ({ page }) => {
    const res = await page.goto(`${BASE}/dream-numbers.html`);
    expect(res.status()).toBe(200);
    await expect(page.locator('body')).toContainText('꿈');
  });

  test('개인정보처리방침 페이지가 정상 로드된다', async ({ page }) => {
    const res = await page.goto(`${BASE}/privacy.html`);
    expect(res.status()).toBe(200);
    await expect(page.locator('body')).toContainText('개인정보');
  });

  test('존재하지 않는 페이지 접근 시 오류 응답이 온다', async ({ page }) => {
    const res = await page.goto(`${BASE}/nonexistent-page-xyz123.html`);
    // Cloudflare Pages는 404 또는 리디렉션 페이지 반환
    expect([404, 200]).toContain(res.status());
    // 200이면 커스텀 404 페이지 내용 확인
    if (res.status() === 200) {
      await expect(page.locator('body')).not.toBeEmpty();
    }
  });
});

// ──────────────────────────────────────────────
// 12. 모바일 뷰 기본 동작 (Pixel 5)
// ──────────────────────────────────────────────
test.describe('모바일 뷰 @mobile-chrome', () => {
  test('모바일에서 홈페이지가 정상 로드된다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/통계왕 AI Lotto/);
  });

  test('모바일에서 모드 버튼 6개가 모두 보인다', async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator('.mode-btn')).toHaveCount(6);
  });

  test('모바일에서 번호 생성 후 볼이 표시된다', async ({ page }) => {
    await page.goto(BASE);
    await page.locator('.btn-generate-img').click();
    await page.waitForTimeout(1500);
    await expect(page.locator('#board .game-row')).toHaveCount(5);
  });
});
