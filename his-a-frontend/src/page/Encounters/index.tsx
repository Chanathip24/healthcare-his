import { useQuery } from '@tanstack/react-query'
import { Loader2, Search, SearchX, TriangleAlert } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { type NavigateFunction, useNavigate } from 'react-router-dom'

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
import { ROUTES } from '@/constant'
import { listEncounters } from '@/hooks'
import type { IEncounter } from '@/type'
import { formatDate, getErrorMessage } from '@/utilities'

const Encounters = () => {
  const navigate: NavigateFunction = useNavigate()
  const [query, setQuery] = useState('')
  const normalizedQuery = useMemo((): string => query.trim(), [query])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const {
    data: encounters = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery<Array<IEncounter>>({
    queryKey: ['encounters', normalizedQuery],
    queryFn: () => listEncounters(normalizedQuery),
    staleTime: 30_000,
  })
  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Encounters</h3>
          <p className="text-body-2 text-theme-gray">All encounters across patients</p>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Encounters Directory</CardTitle>
          <p className="text-body-3 text-theme-gray">
            Search by encounter ID (e.g. <code>e1</code>) or patient name to look up records.
          </p>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-theme-gray" />
            <Input placeholder="Search by encounter ID or patient name..." className="pl-9" value={query} onChange={handleSearch} />
            {isFetching && <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-theme-gray" />}
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Loader2 className="size-10 animate-spin opacity-40" />
              <p className="text-body-2">Loading encounters...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-theme-gray">
              <TriangleAlert className="size-10 text-destructive opacity-80" />
              <p className="text-body-2">{getErrorMessage(error, 'Failed to load encounters.')}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : encounters.length === 0 && !normalizedQuery ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Search className="size-10 opacity-40" />
              <p className="text-body-2">No encounters available yet.</p>
            </div>
          ) : encounters.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No encounters match "{normalizedQuery}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((encounter) => (
                  <TableRow key={encounter.id}>
                    <TableCell>{formatDate(encounter.date, 'DD/MM/YYYY')}</TableCell>
                    <TableCell className="font-medium">{encounter.patientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {encounter.classDisplay}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          encounter.status === 'active'
                            ? 'success'
                            : encounter.status === 'cancelled'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="capitalize"
                      >
                        {encounter.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(): void => {
                          void navigate(ROUTES.encounterDetail.getUrl(encounter.id))
                        }}
                      >
                        Action
                      </Button>
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

export default Encounters
