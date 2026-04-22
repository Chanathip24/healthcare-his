import { SearchX } from 'lucide-react'
import { useState } from 'react'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  RawJsonPanel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common'
import { Section } from '@/components/layout'
import { useHisApiQueryPatientMedications } from '@/hooks'
import type { IFhirMedicationRequestBundleEntry } from '@/type'

const Medications = () => {
  const [patientId, setPatientId] = useState('')
  const medicationsQuery = useHisApiQueryPatientMedications({
    patientId,
    enabled: Boolean(patientId.trim()),
  })
  const medications = medicationsQuery.data?.entry ?? []

  return (
    <Section>
      <header>
        <h3 className="font-semibold tracking-tight">Medications</h3>
        <p className="text-body-2 text-theme-gray">Medication-requests by patient</p>
      </header>
      <Card>
        <CardHeader className="space-y-2">
          <CardTitle className="text-base">Lookup Medication Requests</CardTitle>
          <div className="flex items-end gap-2">
            <div className="w-full">
              <Label>Patient ID</Label>
              <Input value={patientId} onChange={(event) => setPatientId(event.target.value)} placeholder="e.g. p1" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!patientId.trim() ? (
            <p className="text-body-2 text-theme-gray">Enter patient ID to query medication-requests.</p>
          ) : medicationsQuery.isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading medication-requests...</p>
          ) : medications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-theme-gray">
              <SearchX className="size-8 opacity-40" />
              <p className="text-body-2">No medication-requests found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Medication</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((entry: IFhirMedicationRequestBundleEntry) => (
                  <TableRow key={entry.resource.id}>
                    <TableCell className="font-mono text-body-3">{entry.resource.id}</TableCell>
                    <TableCell>{entry.resource.status}</TableCell>
                    <TableCell>{entry.resource.intent}</TableCell>
                    <TableCell>{entry.resource.medicationCodeableConcept.text || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <RawJsonPanel data={medicationsQuery.data} />
        </CardContent>
      </Card>
    </Section>
  )
}

export default Medications
