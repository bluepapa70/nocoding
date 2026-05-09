export async function onRequest(context) {
  const { searchParams } = new URL(context.request.url);
  const drwNo = searchParams.get('drwNo');

  if (!drwNo || isNaN(drwNo)) {
    return json({ error: 'invalid drwNo' }, 400);
  }

  const url = `https://www.dhlottery.co.kr/common.do?method=getLottoNumber&drwNo=${drwNo}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': 'https://www.dhlottery.co.kr/gameResult.do?method=byWin',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const text = await res.text();
    const data = JSON.parse(text);

    if (data.returnValue !== 'success') return json({ error: 'not_found' }, 404);

    return json(data);
  } catch (e) {
    return json({ error: e.message }, 502);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
