import { useEffect, useRef, useState } from 'react'

import { RXNAV_API_BASE_URL } from '@/config'

export type RxNormOption = {
  rxcui: string
  name: string
  rawName: string
}

const cleanDrugName = (raw: string): string => {
  if (!raw) return ''

  let working = raw.trim()

  // Case 1: content is wrapped in {...} Pack — extract what's inside
  const braceMatch = working.match(/^\{(.+)\}\s*Pack\s*$/i)
  if (braceMatch) {
    working = braceMatch[1]
  } else {
    // Case 2: simple {prefix} at start — strip it
    working = working
      .replace(/^\{[^}]*\}\s*/, '')
      .replace(/Pack$/i, '')
      .trim()
  }

  // Each segment is "1 (drug 500 MG / drug 2 MG Oral Tablet)" — extract ingredient names
  const segments = working
    .split('/')
    .map((s) => s.trim())
    // Remove leading count like "1 " or "2 "
    .map((s) => s.replace(/^\d+\s*/, ''))
    // Unwrap outer parens if present: "(acetaminophen 500 MG / ...)"
    .map((s) => (s.startsWith('(') && s.endsWith(')') ? s.slice(1, -1) : s))
    .flatMap((s) =>
      // Each paren group can itself contain slash-separated ingredients
      s.split('/').map((part) => part.trim()),
    )
    .map((part) =>
      part
        // Remove dosage: "500 MG", "2.5 ML", "10 mcg", "5%"
        .replace(/\d+(\.\d+)?\s*(MG|ML|mcg|g|%)/gi, '')
        // Remove dose forms
        .replace(/\b(Oral|Tablet|Capsule|Solution|Injection|Liquid|Powder|Patch|Cream|Syrup)\b/gi, '')
        // Remove salts/forms that follow the active name (maleate, hydrobromide, etc.)
        .replace(
          /\b(maleate|hydrobromide|hydrochloride|sodium|potassium|calcium|acetate|sulfate|phosphate|citrate|tartrate|gluconate|fumarate|succinate|besylate|mesylate)\b/gi,
          '',
        )
        .replace(/\s{2,}/g, ' ')
        .trim(),
    )
    .filter(Boolean)

  const unique = Array.from(new Set(segments.map((s) => s.toLowerCase())))
    .map((lower) => segments.find((s) => s.toLowerCase() === lower)!)
    // Restore original casing from first match, capitalise first letter
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())

  return unique.join(' + ')
}

type UseRxNormSearchResult = {
  options: Array<RxNormOption>
  loading: boolean
  error: string | null
}

export const useRxNormSearch = (searchTerm: string): UseRxNormSearchResult => {
  const [options, setOptions] = useState<Array<RxNormOption>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use a ref for the abort controller so we can cancel across renders
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    const keyword = searchTerm.trim()

    if (keyword.length < 2) {
      setOptions([])
      setLoading(false)
      setError(null)
      return
    }

    const timer = window.setTimeout(async () => {
      // Cancel any in-flight request before starting a new one
      controllerRef.current?.abort()
      controllerRef.current = new AbortController()

      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`${RXNAV_API_BASE_URL}/drugs.json?name=${encodeURIComponent(keyword)}`, {
          signal: controllerRef.current.signal,
        })

        if (!res.ok) throw new Error(`RxNorm API error: ${res.status}`)

        const payload = await res.json()

        const rawOptions: Array<{ rxcui: string; name: string }> =
          payload?.drugGroup?.conceptGroup?.flatMap(
            (group: { conceptProperties?: Array<{ rxcui: string; name: string }> }) => group.conceptProperties ?? [],
          ) ?? []

        // Deduplicate by rxcui
        const unique = Array.from(new Map(rawOptions.map((i) => [i.rxcui, i])).values())

        setOptions(
          unique.slice(0, 20).map((item) => ({
            rxcui: item.rxcui,
            rawName: item.name,
            name: cleanDrugName(item.name) || item.name, // fallback to raw if clean is empty
          })),
        )
      } catch (e) {
        if (e instanceof Error && e.name !== 'AbortError') {
          setOptions([])
          setError('Failed to fetch drug options. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => {
      clearTimeout(timer)
      // Don't abort here — let the ref handle cancellation on the next search
      // so a slow response for the final term isn't cancelled unnecessarily
    }
  }, [searchTerm]) // trimmed keyword comparison happens inside; dep on raw is fine

  return { options, loading, error }
}
