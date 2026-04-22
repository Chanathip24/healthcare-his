import { SearchX } from 'lucide-react'
import { type NavigateFunction, useNavigate } from 'react-router-dom'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  RawJsonPanel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common'
import { Section } from '@/components/layout'
import { ROUTES } from '@/constant'
import { useHisApiQueryEncounters } from '@/hooks'
import type { IFhirEncounterBundleEntry } from '@/type'

const Encounters = () => {
  const navigate: NavigateFunction = useNavigate()
  const encountersQuery = useHisApiQueryEncounters()
  const encounters = encountersQuery.data?.entry ?? []

  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Encounters</h3>
          <p className="text-body-2 text-theme-gray">All encounters across patients</p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Encounters Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {encountersQuery.isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading encounters...</p>
          ) : encounters.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No encounters found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Encounter ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((entry: IFhirEncounterBundleEntry) => {
                  const patientReference = entry.resource.subject.reference || ''
                  const patientId = patientReference.split('/')[1] || ''
                  return (
                    <TableRow key={entry.resource.id}>
                      <TableCell className="font-mono text-body-3">{entry.resource.id}</TableCell>
                      <TableCell className="font-medium">{patientId || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {entry.resource.class.display || entry.resource.class.code}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {entry.resource.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={!patientId}
                          onClick={() =>
                            navigate(
                              ROUTES.encounterDetail.path
                                .replace(':patientId', patientId)
                                .replace(':encounterId', entry.resource.id),
                            )
                          }
                        >
                          View Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          <RawJsonPanel data={encountersQuery.data} />
        </CardContent>
      </Card>
    </Section>
  )
}

export default Encounters
