import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CircleCheck, Loader2, Paperclip, Plus, TriangleAlert } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

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
import { addEncounterMedication, getEncounterDetail, listMedications } from '@/hooks'
import type {
  IAddEncounterMedicationPayload,
  IEncounterDetail,
  IEncounterStatus,
  IMedication,
} from '@/type'
import { cn, formatDate, getErrorMessage } from '@/utilities'

const ENCOUNTER_STATUS_LABEL: Record<IEncounterStatus, string> = {
  active: 'in-progress',
  finished: 'finished',
  cancelled: 'cancelled',
}

const DEFAULT_FREQUENCY_OPTIONS: Array<string> = ['1/day', '2/day', '3/day', '4/day']

const EncounterDetail = () => {
  const [showRawJson, setShowRawJson] = useState(false)
  const [isAddMedicationDialogOpen, setIsAddMedicationDialogOpen] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { encounterId } = useParams<{ encounterId: string }>()

  const handleBack = useCallback((): void => {
    void navigate(ROUTES.encounters.path)
  }, [navigate])

  const {
    data: encounter,
    error,
    isError,
    isPending,
    refetch,
  } = useQuery<IEncounterDetail>({
    queryKey: ['encounter-detail', encounterId],
    queryFn: () => getEncounterDetail(encounterId || ''),
    enabled: Boolean(encounterId),
    staleTime: 30_000,
  })

  const { data: medicationCatalog = [] } = useQuery<Array<IMedication>>({
    queryKey: ['medications', 'catalog'],
    queryFn: () => listMedications(''),
    staleTime: 5 * 60_000,
  })

  const { isPending: isAddingMedication, mutate: addMedicationMutation } = useMutation({
    mutationFn: ({ encounterId: targetEncounterId, payload }: { encounterId: string; payload: IAddEncounterMedicationPayload }) =>
      addEncounterMedication(targetEncounterId, payload),
    onSuccess: () => {
      toast.success('Medication added to encounter.')
      setIsAddMedicationDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['encounter-detail', encounterId] })
    },
    onError: (mutationError: unknown) => {
      toast.error(getErrorMessage(mutationError, 'Failed to add medication.'))
    },
  })

  const handleAddMedication = useCallback(
    (payload: IAddEncounterMedicationPayload): void => {
      if (!encounterId) {
        toast.error('Encounter ID is missing.')
        return
      }

      addMedicationMutation({
        encounterId,
        payload,
      })
    },
    [addMedicationMutation, encounterId],
  )

  const formattedEncounterDate = useMemo((): string => {
    if (!encounter) return 'N/A'
    return formatDate(encounter.date, 'YYYY-MM-DD')
  }, [encounter])

  const formattedPeriodStart = useMemo((): string => {
    if (!encounter) return 'N/A'
    return formatDate(encounter.periodStart, 'M/D/YYYY, h:mm:ss A')
  }, [encounter])

  return (
    <Section className="space-y-6 desktop:max-w-[1040px]">
      <header className="flex items-center gap-2">
        <Button size="icon-sm" variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <p className="text-body-1 font-medium">Patient</p>
      </header>

      {isPending ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
          <Loader2 className="size-10 animate-spin opacity-40" />
          <p className="text-body-2">Loading encounter details...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-theme-gray">
          <TriangleAlert className="size-10 text-destructive opacity-80" />
          <p className="text-body-2">{getErrorMessage(error, 'Failed to load encounter details.')}</p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : encounter ? (
        <>
          <Card className="gap-0">
            <CardContent className="flex flex-col gap-5 pt-6 desktop:flex-row desktop:items-start desktop:justify-between">
              <div className="space-y-3">
                <h3 className="text-heading-3">Encounter - {formattedEncounterDate}</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-body-1 text-theme-gray-700">{encounter.patientName}</span>
                  <span className="text-theme-gray">.</span>
                  <Badge variant="outline">{encounter.classDisplay}</Badge>
                  <span className="text-theme-gray">.</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      'capitalize',
                      encounter.status === 'active' && 'border-amber-300 bg-amber-100 text-amber-800',
                      encounter.status === 'finished' &&
                        'border-theme-success-300 bg-theme-success-100 text-theme-success-800',
                      encounter.status === 'cancelled' &&
                        'border-theme-destructive/30 bg-theme-destructive/10 text-theme-destructive',
                    )}
                  >
                    {ENCOUNTER_STATUS_LABEL[encounter.status]}
                  </Badge>
                </div>
                <p className="font-mono text-body-2 text-theme-gray">
                  Patient/{encounter.patientId} . period.start {formattedPeriodStart}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline">
                  <CircleCheck className="size-4" /> Finish Encounter
                </Button>
                <Button onClick={() => setIsAddMedicationDialogOpen(true)}>
                  <Plus className="size-4" /> Add Medication
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-2 text-heading-3">
                <Paperclip className="size-5" />
                Encounter Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {encounter.medications.length === 0 ? (
                <p className="text-body-2 text-theme-gray">No medications have been added for this encounter.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Drug</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Frequency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {encounter.medications.map((medication) => (
                      <TableRow key={`${encounter.id}-${medication.code}-${medication.frequency}`}>
                        <TableCell>
                          <Badge variant="outline">{medication.code}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{medication.drug}</TableCell>
                        <TableCell>{medication.dose}</TableCell>
                        <TableCell>{medication.frequency}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-heading-4">
                  <span className="font-mono">{'{}'}</span>
                  FHIR Resource (raw JSON)
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={cn(
                      'relative h-6 w-11 rounded-full border border-page bg-theme-gray-200 transition-colors',
                      showRawJson && 'bg-theme-primary-200',
                    )}
                    onClick={() => setShowRawJson((prev: boolean) => !prev)}
                  >
                    <span
                      className={cn(
                        'absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-theme-white shadow transition-transform',
                        showRawJson && 'translate-x-5',
                      )}
                    />
                  </button>
                  <span className="text-body-1">Show JSON</span>
                </div>
              </div>

              {showRawJson && (
                <pre className="max-h-96 overflow-auto rounded-lg border border-page bg-theme-gray-50 p-4 font-mono text-body-3 text-theme-gray-700">
                  {JSON.stringify(encounter.fhirResource, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          <AddMedicationDialog
            medications={medicationCatalog}
            isSubmitting={isAddingMedication}
            onSubmit={handleAddMedication}
            open={isAddMedicationDialogOpen}
            onOpenChange={setIsAddMedicationDialogOpen}
          />
        </>
      ) : null}
    </Section>
  )
}

type AddMedicationDialogProps = {
  medications: Array<IMedication>
  isSubmitting: boolean
  onSubmit: (payload: IAddEncounterMedicationPayload) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AddMedicationDialog({ medications, isSubmitting, onSubmit, open, onOpenChange }: AddMedicationDialogProps) {
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [dose, setDose] = useState<string>('')
  const [frequency, setFrequency] = useState<string>('3/day')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback((): void => {
    setSelectedCode('')
    setDose('')
    setFrequency('3/day')
    setError(null)
  }, [])

  useEffect((): void => {
    if (!open) reset()
  }, [open, reset])

  const handleSave = useCallback((): void => {
    if (!selectedCode) {
      setError('Please select medication.')
      return
    }

    const normalizedDose = dose.trim()
    if (!normalizedDose) {
      setError('Dose is required.')
      return
    }

    if (!/^[a-zA-Z0-9/.()\s-]+$/.test(normalizedDose) || normalizedDose.length > 30) {
      setError('Dose format is invalid.')
      return
    }

    const normalizedFrequency = frequency.trim()
    if (!normalizedFrequency) {
      setError('Frequency is required.')
      return
    }

    setError(null)
    onSubmit({
      code: selectedCode,
      dose: normalizedDose,
      frequency: normalizedFrequency,
    })
  }, [dose, frequency, onSubmit, selectedCode])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Medication</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Medication</Label>
            <Select value={selectedCode} onValueChange={(value: string) => setSelectedCode(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select medication" />
              </SelectTrigger>
              <SelectContent>
                {medications.map((medication) => (
                  <SelectItem key={medication.code} value={medication.code}>
                    {medication.display} ({medication.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Dose</Label>
              <Input placeholder="e.g. 500 mg" value={dose} onChange={(event) => setDose(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={(value: string) => setFrequency(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEFAULT_FREQUENCY_OPTIONS.map((frequencyOption) => (
                    <SelectItem key={frequencyOption} value={frequencyOption}>
                      {frequencyOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && <p className="text-body-2 text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EncounterDetail
