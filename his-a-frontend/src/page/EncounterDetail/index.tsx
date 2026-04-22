import { ArrowLeft, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { type NavigateFunction, useNavigate, useParams } from 'react-router-dom'

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  RawJsonPanel,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/common'
import { Section } from '@/components/layout'
import { ROUTES } from '@/constant'
import {
  useHisApiExecuteCreatePatientMedication,
  useHisApiQueryEncounterById,
  useHisApiQueryPatientMedications,
  useHisApiQueryPractitioners,
  useRxNormSearch,
} from '@/hooks'
import type { IFhirMedicationRequest, IFhirMedicationRequestBundleEntry, IFhirPractitionerBundleEntry } from '@/type'

const EncounterDetail = () => {
  const { patientId, encounterId } = useParams<{ patientId: string; encounterId: string }>()
  const safePatientId = patientId ?? ''
  const safeEncounterId = encounterId ?? ''
  const navigate: NavigateFunction = useNavigate()

  const encounterQuery = useHisApiQueryEncounterById({
    encounterId: safeEncounterId,
    enabled: Boolean(encounterId),
  })
  const medicationsQuery = useHisApiQueryPatientMedications({
    patientId: safePatientId,
    enabled: Boolean(patientId),
  })
  const practitionersQuery = useHisApiQueryPractitioners()

  const medications = useMemo(() => medicationsQuery.data?.entry ?? [], [medicationsQuery.data])
  const practitioners = useMemo(() => practitionersQuery.data?.entry ?? [], [practitionersQuery.data])
  const hasPractitioner = practitioners.length > 0

  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Encounter Detail</h3>
          <p className="text-body-2 text-theme-gray">Encounter information and medication requests</p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.patientDetail.path.replace(':patientId', safePatientId))}
        >
          <ArrowLeft className="size-4" /> Back to Patient
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Encounter Resource</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {encounterQuery.isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading encounter...</p>
          ) : !encounterQuery.data ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-theme-gray">
              <SearchX className="size-8 opacity-40" />
              <p className="text-body-2">Encounter not found.</p>
            </div>
          ) : (
            <div className="md:grid-cols-3 grid grid-cols-1 gap-3">
              <div>
                <p className="text-body-3 text-theme-gray">Encounter ID</p>
                <p className="font-mono">{encounterQuery.data.id}</p>
              </div>
              <div>
                <p className="text-body-3 text-theme-gray">Status</p>
                <Badge className="capitalize">{encounterQuery.data.status}</Badge>
              </div>
              <div>
                <p className="text-body-3 text-theme-gray">Class</p>
                <p>{encounterQuery.data.class.display || encounterQuery.data.class.code}</p>
              </div>
            </div>
          )}
          <RawJsonPanel data={encounterQuery.data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Medication Requests</CardTitle>
          {hasPractitioner ? (
            <CreateMedicationRequestDialog
              patientId={safePatientId}
              encounterId={safeEncounterId}
              practitioners={practitioners}
            />
          ) : (
            <Button variant="outline" onClick={() => navigate(ROUTES.practitioners.path)}>
              Create Practitioner First
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPractitioner && (
            <p className="text-body-2 text-theme-gray">
              Cannot create medication-request because no practitioner exists yet.
            </p>
          )}
          {medicationsQuery.isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading medication requests...</p>
          ) : medications.length === 0 ? (
            <p className="text-body-2 text-theme-gray">No medication-requests found.</p>
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

function CreateMedicationRequestDialog({
  patientId,
  encounterId,
  practitioners,
}: {
  patientId: string
  encounterId: string
  practitioners: Array<IFhirPractitionerBundleEntry>
}) {
  const mutation = useHisApiExecuteCreatePatientMedication()
  const [open, setOpen] = useState(false)
  const [medicationText, setMedicationText] = useState('')
  const [selectedMedicationCode, setSelectedMedicationCode] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const [practitionerId, setPractitionerId] = useState(practitioners[0]?.resource.id ?? '')
  const [error, setError] = useState<string | null>(null)

  const { options: rxNormOptions, loading: isRxNormLoading } = useRxNormSearch(searchTerm)

  const handleCreate = async () => {
    if (!medicationText.trim()) {
      setError('Medication is required')
      return
    }
    if (!selectedMedicationCode.trim()) {
      setError('Select medication from RxNorm search')
      return
    }
    if (!practitionerId) {
      setError('Practitioner is required')
      return
    }

    const payload: IFhirMedicationRequest = {
      resourceType: 'MedicationRequest',
      id: crypto.randomUUID(),
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        text: medicationText.trim(),
        coding: [
          {
            system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
            code: selectedMedicationCode.trim(),
            display: medicationText.trim(),
          },
        ],
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      encounter: {
        reference: `Encounter/${encounterId}`,
      },
      requester: {
        reference: `Practitioner/${practitionerId}`,
      },
      authoredOn: new Date().toISOString(),
    }

    setError(null)
    try {
      await mutation.mutateAsync({ patientId, payload })
      setOpen(false)
      setMedicationText('')
      setSelectedMedicationCode('')
      setSearchTerm('')
    } catch {
      setError('Failed to create medication-request.')
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>New Medication Request</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Medication Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Medication (RxNorm Search)</Label>
              <Input
                value={searchTerm}
                placeholder="Type medication name to search RxNorm..."
                onChange={(event) => {
                  setSearchTerm(event.target.value)
                  setError(null)
                }}
              />
              <div className="max-h-44 overflow-y-auto rounded-md border border-page">
                {isRxNormLoading ? (
                  <p className="p-2 text-body-3 text-theme-gray">Searching RxNorm...</p>
                ) : rxNormOptions.length === 0 ? (
                  <p className="p-2 text-body-3 text-theme-gray">No RxNorm result.</p>
                ) : (
                  rxNormOptions.map((option) => (
                    <button
                      type="button"
                      key={option.rxcui}
                      className="hover:bg-theme-light w-full border-b border-page px-3 py-2 text-left text-body-3 last:border-b-0"
                      onClick={() => {
                        setMedicationText(option.name)
                        setSelectedMedicationCode(option.rxcui)
                        setSearchTerm(option.name)
                        setError(null)
                      }}
                    >
                      <p className="font-medium">{option.name}</p>
                      <p className="font-mono text-theme-gray">Code: {option.rxcui}</p>
                    </button>
                  ))
                )}
              </div>
              <div className="bg-theme-light rounded-md border border-page p-2">
                <p className="text-body-3">
                  Selected: <span className="font-medium">{medicationText || '-'}</span>
                </p>
                <p className="text-body-3 text-theme-gray">RxNorm code: {selectedMedicationCode || '-'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Practitioner</Label>
              <Select value={practitionerId} onValueChange={setPractitionerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select practitioner" />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((entry) => {
                    const name = entry.resource.name?.[0]?.text || entry.resource.id
                    return (
                      <SelectItem key={entry.resource.id} value={entry.resource.id}>
                        {name}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button disabled={mutation.isPending} onClick={handleCreate}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
          <RawJsonPanel data={mutation.data} />
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EncounterDetail
