const ORIGIN = 'https://www.dhlottery.co.kr';

export async function onRequest(context) {
  try {
    const res = await fetch(`${ORIGIN}/lt645/result`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Referer': `${ORIGIN}/`,
      },
    });

    let html = await res.text();

    // Rewrite root-relative URLs so resources resolve against dhlottery.co.kr
    html = html
      .replace(/(href|src|action)="(\/(?!\/))/g, `$1="${ORIGIN}/`)
      .replace(/(href|src|action)='(\/(?!\/))/g, `$1='${ORIGIN}/`)
      .replace(/url\(["']?(\/(?!\/))/g, `url('${ORIGIN}/`);

    // Inject base tag as extra safety net
    html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${ORIGIN}/">`);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (e) {
    return new Response(
      `<html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#888"><p>페이지를 불러올 수 없습니다.</p></body></html>`,
      { status: 502, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}
