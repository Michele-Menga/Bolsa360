import { apiFetch } from './api';

export interface LoginDados {
  email: string;
  palavraPasse: string;
}

export interface RegistoDados {
  nome: string;
  email: string;
  palavraPasse: string;
}

export interface Utilizador {
  id: string;
  nome: string;
  email: string;
  papel: 'CANDIDATO' | 'ADMIN';
}

// 1. Iniciar Sessão (Login)
export async function login(dados: LoginDados) {
  return apiFetch<{ data: Utilizador }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: dados.email,
      palavraPasse: dados.palavraPasse,
    }),
  });
}

// 2. Criar Conta (Registo)
export async function registar(dados: RegistoDados) {
  return apiFetch<{ data: Utilizador }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      nome: dados.nome,
      email: dados.email,
      palavraPasse: dados.palavraPasse,
    }),
  });
}

// 3. Encerrar Sessão (Logout)
export async function logout() {
  return apiFetch<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

// 4. Obter Utilizador Atual
export async function obterUtilizadorAtual() {
  return apiFetch<{ data: Utilizador }>('/auth/me', {
    method: 'GET',
  });
}