import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, SearchX, TriangleAlert } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useMemo, useState } from 'react'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common'
import { Section } from '@/components/layout'
import { listMedications } from '@/hooks'
import type { IMedication } from '@/type'
import { getErrorMessage } from '@/utilities'

const Medications = () => {
  const [query, setQuery] = useState('')

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const normalizedQuery = useMemo((): string => query.trim(), [query])
  const {
    data: medications = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery<Array<IMedication>>({
    queryKey: ['medications', normalizedQuery],
    queryFn: () => listMedications(normalizedQuery),
    staleTime: 30_000,
  })
  const rxNormSystem = medications[0]?.system || 'http://www.nlm.nih.gov/research/umls/rxnorm'

  return (
    <Section>
      <header className="space-y-1">
        <h3 className="font-semibold tracking-tight">Medications</h3>
        <p className="text-body-2 text-theme-gray">
          FHIR Medication catalog (system: <span className="text-theme-primary">RxNorm</span>)
        </p>
      </header>

      <Card className="gap-5 py-5">
        <CardHeader className="gap-4 pb-0">
          <CardTitle className="text-heading-3 leading-tight">RxNorm Catalog</CardTitle>

          <Input
            value={query}
            onChange={handleSearch}
            placeholder="Search by name or RxNorm code..."
            prefix={<Search className="size-4 text-theme-gray" />}
            suffix={isFetching ? <Loader2 className="size-4 animate-spin text-theme-gray" /> : undefined}
          />

          <p className="font-mono text-body-3 text-theme-gray">
            system: <span className="text-theme-primary">{rxNormSystem}</span>
          </p>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-theme-gray">
              <Loader2 className="size-10 animate-spin opacity-40" />
              <p className="text-body-2">Loading medications...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-theme-gray">
              <TriangleAlert className="size-10 text-destructive opacity-80" />
              <p className="text-body-2">{getErrorMessage(error, 'Failed to load medications.')}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : medications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No medications match "{query}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code (RXCUI)</TableHead>
                  <TableHead>Display</TableHead>
                  <TableHead>Strength</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((medication) => (
                  <TableRow key={medication.code}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="min-w-[3rem] justify-center rounded-md border-theme-primary-100 bg-theme-primary-50 font-mono text-theme-primary"
                      >
                        {medication.code}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">{medication.display}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="rounded-full border-theme-primary-100 bg-theme-primary-50 px-3 text-theme-primary"
                      >
                        {medication.strength}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Section>
  )
}

export default Medications
