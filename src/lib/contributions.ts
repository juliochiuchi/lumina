import { formatCurrency } from "@/lib/currency"

export const TITHE_CONTRIBUTION_TYPE = "dizimo"
export const OFFER_CONTRIBUTION_TYPE = "oferta"

function normalizeContributionKey(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
}

export function normalizeContributionType(value: string | null | undefined) {
  const normalizedValue = normalizeContributionKey(value)

  if (normalizedValue === "dizimo") {
    return TITHE_CONTRIBUTION_TYPE
  }

  if (normalizedValue === "oferta") {
    return OFFER_CONTRIBUTION_TYPE
  }

  return normalizedValue
}

export function isTitheContribution(value: string | null | undefined) {
  return normalizeContributionType(value) === TITHE_CONTRIBUTION_TYPE
}

export function isOfferContribution(value: string | null | undefined) {
  return normalizeContributionType(value) === OFFER_CONTRIBUTION_TYPE
}

export function formatContributionValue(value: number) {
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatContributionCurrency(value: number) {
  return formatCurrency(value)
}

function getContributionInputDigits(value: string) {
  return value.replace(/\D/g, "")
}

export function sanitizeContributionInput(value: string) {
  const digits = getContributionInputDigits(value)

  if (!digits) {
    return ""
  }

  const numericValue = Number(digits) / 100

  return formatContributionValue(numericValue)
}

export function parseContributionInput(value: string) {
  const digits = getContributionInputDigits(value)

  if (!digits) {
    return null
  }

  const numericValue = Number(digits) / 100

  if (!Number.isFinite(numericValue)) {
    return null
  }

  return Math.round(numericValue * 100) / 100
}
