// Protege o painel inteiro com usuário e senha (aparece uma telinha de login
// do próprio navegador antes de abrir qualquer página).
//
// A senha NÃO fica escrita aqui no código (porque o repositório do GitHub é
// público, qualquer pessoa poderia ler o arquivo). Ela fica guardada nas
// configurações do projeto na Vercel, numa "variável de ambiente" chamada
// PAINEL_SENHA — veja o guia de publicação para o passo a passo.

import { next } from '@vercel/functions';

const USUARIO = 'gleice';

export default function middleware(request) {
  const senhaCorreta = process.env.PAINEL_SENHA;

  // Se a senha não foi configurada na Vercel ainda, bloqueia tudo por segurança
  // (em vez de deixar o painel aberto sem querer).
  if (!senhaCorreta) {
    return new Response(
      'O painel ainda não tem uma senha configurada. Veja o guia de publicação, seção "Definir a senha de acesso".',
      { status: 503 }
    );
  }

  const auth = request.headers.get('authorization');

  if (auth) {
    const [scheme, encoded] = auth.split(' ');
    if (scheme === 'Basic' && encoded) {
      let decoded = '';
      try {
        decoded = atob(encoded);
      } catch (e) {
        decoded = '';
      }
      const sep = decoded.indexOf(':');
      const user = sep >= 0 ? decoded.slice(0, sep) : '';
      const pass = sep >= 0 ? decoded.slice(sep + 1) : '';
      if (user === USUARIO && pass === senhaCorreta) {
        return next();
      }
    }
  }

  return new Response('Autenticação necessária para acessar o Painel Financeiro.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Painel Financeiro", charset="UTF-8"',
    },
  });
}
