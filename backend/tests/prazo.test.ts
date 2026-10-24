import { afterEach, describe, expect, it, vi } from "vitest";
import { calcularEstadoPrazo, inicioDoDiaUTC } from "../src/shared/utils/prazo";

const d = (iso: string) => new Date(`${iso}T00:00:00.000Z`);
const HOJE = d("2026-10-24");

afterEach(() => {
  vi.useRealTimers();
});

describe("calcularEstadoPrazo", () => {
  it("sem prazo => SEM_PRAZO_CONFIRMADO (mesmo com abertura definida)", () => {
    expect(calcularEstadoPrazo(null, null, HOJE)).toBe("SEM_PRAZO_CONFIRMADO");
    expect(calcularEstadoPrazo(d("2026-01-01"), null, HOJE)).toBe("SEM_PRAZO_CONFIRMADO");
    expect(calcularEstadoPrazo(d("2027-01-01"), null, HOJE)).toBe("SEM_PRAZO_CONFIRMADO");
  });

  it("prazo passado => EXPIRADO", () => {
    expect(calcularEstadoPrazo(d("2026-01-01"), d("2026-10-23"), HOJE)).toBe("EXPIRADO");
    expect(calcularEstadoPrazo(null, d("2020-01-01"), HOJE)).toBe("EXPIRADO");
  });

  it("abertura futura => FUTURO", () => {
    expect(calcularEstadoPrazo(d("2026-10-25"), d("2026-12-31"), HOJE)).toBe("FUTURO");
  });

  it("prazo hoje => ABERTO (o último dia ainda conta)", () => {
    expect(calcularEstadoPrazo(d("2026-09-01"), d("2026-10-24"), HOJE)).toBe("ABERTO");
    expect(calcularEstadoPrazo(null, d("2026-10-24"), HOJE)).toBe("ABERTO");
  });

  it("abertura hoje => ABERTO", () => {
    expect(calcularEstadoPrazo(d("2026-10-24"), d("2026-12-31"), HOJE)).toBe("ABERTO");
  });

  it("dados incoerentes (abertura depois do prazo, prazo já passado) => EXPIRADO, nunca FUTURO", () => {
    expect(calcularEstadoPrazo(d("2026-12-01"), d("2026-10-01"), HOJE)).toBe("EXPIRADO");
  });
});

describe("fuso horário: o 'hoje' é sempre o dia UTC", () => {
  it("inicioDoDiaUTC devolve 00:00 UTC", () => {
    expect(inicioDoDiaUTC(new Date("2026-10-24T23:59:59.999Z")).toISOString()).toBe("2026-10-24T00:00:00.000Z");
    expect(inicioDoDiaUTC(new Date("2026-10-25T00:00:00.000Z")).toISOString()).toBe("2026-10-25T00:00:00.000Z");
  });

  it("às 23:30 UTC de 24/10 (00:30 de 25/10 em Luanda) o prazo de 24/10 ainda está ABERTO", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-24T23:30:00.000Z"));
    expect(calcularEstadoPrazo(null, d("2026-10-24"))).toBe("ABERTO");
    expect(calcularEstadoPrazo(null, d("2026-10-23"))).toBe("EXPIRADO");
  });

  it("à 00:30 UTC de 25/10 o prazo de 24/10 já EXPIROU", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-25T00:30:00.000Z"));
    expect(calcularEstadoPrazo(null, d("2026-10-24"))).toBe("EXPIRADO");
    expect(calcularEstadoPrazo(d("2026-10-25"), d("2026-12-31"))).toBe("ABERTO");
    expect(calcularEstadoPrazo(d("2026-10-26"), d("2026-12-31"))).toBe("FUTURO");
  });
});
