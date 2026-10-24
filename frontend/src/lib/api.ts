// Cliente HTTP: cookie de sessão HttpOnly (bolsa360_sessao) => credentials "include".
const BASE = import.meta.env.VITE_API_URL ?? "/api/v1";
const TEMPO_LIMITE_MS = 15_000;

export class ApiError extends Error {
  constructor(public status: number, public codigo: string, mensagem: string) {
    super(mensagem);
  }
}

const MSG_SEM_LIGACAO = "Não foi possível contactar o servidor. Verifica a tua ligação ou tenta de novo daqui a pouco.";

type Query = Record<string, string | number | undefined | null>;

export function qs(params?: Query): string {
  const p = new URLSearchParams();
  Object.entries(params ?? {}).forEach(([k, v]) => v !== undefined && v !== null && v !== "" && p.set(k, String(v)));
  const s = p.toString();
  return s ? `?${s}` : "";
}

// Chamado quando uma rota protegida responde 401 (sessão expirada ou revogada).
// O AuthProvider regista aqui a limpeza do estado, para a interface não ficar "autenticada" sem estar.
let aoPerderSessao: (() => void) | null = null;
export const definirAoPerderSessao = (fn: (() => void) | null) => { aoPerderSessao = fn; };

async function pedir<T>(metodo: string, caminho: string, corpo?: unknown): Promise<T> {
  const controlo = new AbortController();
  const temporizador = setTimeout(() => controlo.abort(), TEMPO_LIMITE_MS);
  let res: Response;
  try {
    res = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      credentials: "include",
      headers: corpo !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: corpo !== undefined ? JSON.stringify(corpo) : undefined,
      signal: controlo.signal,
    });
  } catch {
    throw new ApiError(0, "SEM_LIGACAO", MSG_SEM_LIGACAO);
  } finally {
    clearTimeout(temporizador);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const e = json?.erro;
    // Sem o envelope { erro } da nossa API e com 5xx, quem respondeu foi um intermediário
    // (o proxy do Vite devolve 500 sem corpo quando o backend está em baixo; um proxy reverso devolve 502/503/504).
    if (!e && res.status >= 500) throw new ApiError(res.status, "SEM_LIGACAO", MSG_SEM_LIGACAO);
    if (res.status === 401 && !caminho.startsWith("/auth/")) aoPerderSessao?.();
    throw new ApiError(res.status, e?.codigo ?? "ERRO_INTERNO", e?.mensagem ?? "Ocorreu um erro inesperado.");
  }
  return json as T;
}

export const api = {
  get: <T>(c: string, q?: Query) => pedir<T>("GET", c + qs(q)),
  post: <T>(c: string, b?: unknown) => pedir<T>("POST", c, b ?? {}),
  put: <T>(c: string, b: unknown) => pedir<T>("PUT", c, b),
  patch: <T>(c: string, b: unknown) => pedir<T>("PATCH", c, b),
  del: <T>(c: string) => pedir<T>("DELETE", c),
};
