/**
 * CNPJ alfanumérico — IN RFB nº 2.229/2024 (dígitos verificadores: módulo 11, valores ASCII − 48).
 * Compatível com CNPJ numérico legado.
 */

const WEIGHTS_DV1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const
const WEIGHTS_DV2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] as const

function asciiMinus48(c: string): number {
  return c.charCodeAt(0) - 48
}

/** Extrai até 14 caracteres válidos: 12 primeiros [A-Z0-9], 2 últimos [0-9]. */
export function parseCnpjInput(input: string): string {
  const upper = input.toUpperCase()
  let out = ""
  for (let i = 0; i < upper.length && out.length < 14; i++) {
    const c = upper[i]!
    if (out.length < 12) {
      if (/[A-Z0-9]/.test(c)) out += c
    } else if (/\d/.test(c)) {
      out += c
    }
  }
  return out
}

/** Remove formatação e retorna só o conteúdo válido (máx. 14 caracteres). */
export function normalizeCnpj(value: string): string {
  return parseCnpjInput(value.replace(/[^A-Za-z0-9]/g, ""))
}

export function maskCnpjInRfb2229(value: string): string {
  const raw = parseCnpjInput(value)
  if (raw.length <= 2) return raw
  if (raw.length <= 5) return `${raw.slice(0, 2)}.${raw.slice(2)}`
  if (raw.length <= 8) return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5)}`
  if (raw.length <= 12) {
    return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8)}`
  }
  return `${raw.slice(0, 2)}.${raw.slice(2, 5)}.${raw.slice(5, 8)}/${raw.slice(8, 12)}-${raw.slice(12)}`
}

export function isValidCnpjInRfb2229(value: string): boolean {
  const normalized = normalizeCnpj(value)
  if (normalized.length !== 14) return false
  if (!/^[A-Z0-9]{12}\d{2}$/.test(normalized)) return false

  const base = normalized.slice(0, 12)
  const dv = normalized.slice(12, 14)

  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += asciiMinus48(base[i]!) * WEIGHTS_DV1[i]!
  }
  let rest = sum % 11
  const d1 = rest < 2 ? 0 : 11 - rest

  sum = 0
  for (let i = 0; i < 12; i++) {
    sum += asciiMinus48(base[i]!) * WEIGHTS_DV2[i]!
  }
  sum += d1 * WEIGHTS_DV2[12]!
  rest = sum % 11
  const d2 = rest < 2 ? 0 : 11 - rest

  return dv === `${d1}${d2}`
}
