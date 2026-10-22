export const API_URL = 'http://localhost:3000/api/v1';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config: RequestInit = {
    ...options,
    credentials: 'include', // Obrigatorio para enviar os cookies HttpOnly de sessão
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    const mensagemErro = data?.error?.mensagem || data?.erro?.mensagem || 'Ocorreu um erro na requisição.';
    throw new Error(mensagemErro);
  }

  return data as T;
}