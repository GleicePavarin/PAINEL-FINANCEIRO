// Função serverless da Vercel: busca o CSV publicado do Google Sheets no servidor
// (não no navegador), evitando o bloqueio de CORS que o Google aplica a pedidos
// feitos direto do navegador. O navegador chama /api/sheet?source=NOME, e essa
// função busca a URL real do Google e devolve o CSV como se fosse "da casa".

const SOURCES = {
  despesas2: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTeeHaxDs3fx75Y1fzwgOIZBX1SvP5IPp6SWZl5222whRbqxWEFebhcuW9l1Abf5GZbKwi6l2nUWtfe/pub?gid=1771415419&single=true&output=csv',
  pessoalDespesas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRApR7Ta5ZqjMtgnwpZCLIJ3ELTdHnmoAwNbpo4AmtfhN_5itGH2-DImdJf-kWrRhy2zKWniTHlPz_e/pub?gid=1771415419&single=true&output=csv',
  pessoalDL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRApR7Ta5ZqjMtgnwpZCLIJ3ELTdHnmoAwNbpo4AmtfhN_5itGH2-DImdJf-kWrRhy2zKWniTHlPz_e/pub?gid=0&single=true&output=csv',
  faturamento: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXi9AGIMt9R8GiF1498eaa2ONkDTJrAgtaHDoTsyKwWTc-l4bSPFxLi-w3jkqLjWN6AWu0tQ6w7ayW/pub?gid=1049922393&single=true&output=csv',
  fluxoCaixa: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSmkFhpqZtvPPU-vzvfrqEpGfPO3agRgo6Kl9Eg64A_fNhMJbPqSwnq8kPznp9yFDMZRY7KmDV-X28b/pub?gid=1019687700&single=true&output=csv',
  itensNF: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTXi9AGIMt9R8GiF1498eaa2ONkDTJrAgtaHDoTsyKwWTc-l4bSPFxLi-w3jkqLjWN6AWu0tQ6w7ayW/pub?gid=1086902459&single=true&output=csv',
};

export default async function handler(req, res) {
  const source = req.query.source;
  const url = SOURCES[source];

  if (!url) {
    res.status(400).send('Fonte desconhecida: ' + source);
    return;
  }

  try {
    const upstream = await fetch(url, { redirect: 'follow' });
    if (!upstream.ok) {
      res.status(502).send('Erro ao buscar a planilha no Google (HTTP ' + upstream.status + ')');
      return;
    }
    const text = await upstream.text();
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    // guarda em cache por 5 minutos para não sobrecarregar o Google a cada acesso ao painel
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(200).send(text);
  } catch (err) {
    res.status(502).send('Falha ao buscar a planilha: ' + (err && err.message ? err.message : String(err)));
  }
};
