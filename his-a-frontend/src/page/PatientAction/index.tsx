import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Plus, TriangleAlert } from 'lucide-react'
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
import {
  createPatientEncounter,
  createPatientMedicationRequest,
  getPatientDetail,
  listMedications,
  listPatientEncounters,
  listPatientMedicationRequests,
} from '@/hooks'
import type {
  ICreateEncounterPayload,
  ICreateMedicationRequestPayload,
  IEncounter,
  IEncounterStatus,
  IMedication,
  IMedicationRequest,
  IMedicationRequestStatus,
  IPatientDetail,
} from '@/type'
import { cn, formatDate, getErrorMessage } from '@/utilities'

const ENCOUNTER_CLASS_OPTIONS: Array<string> = [
  'Ambulatory (AMB)',
  'Outpatient (OP)',
  'Emergency (EMER)',
  'Inpatient (IMP)',
]

const ENCOUNTER_STATUS_OPTIONS: Array<IEncounterStatus> = ['active', 'finished', 'cancelled']
const MEDICATION_REQUEST_STATUS_OPTIONS: Array<IMedicationRequestStatus> = ['active', 'completed', 'cancelled']
const DEFAULT_FREQUENCY_OPTIONS: Array<string> = ['1/day', '2/day', '3/day', '4/day']

const buildOptimisticResourceId = (resourceType: 'encounter' | 'medication-request'): string =>
  `optimistic-${resourceType}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const sortEncountersByNewest = (encounterList: Array<IEncounter>): Array<IEncounter> =>
  [...encounterList].sort((first: IEncounter, second: IEncounter): number => second.date.localeCompare(first.date))

const sortMedicationRequestsByNewest = (
  medicationRequestList: Array<IMedicationRequest>,
): Array<IMedicationRequest> =>
  [...medicationRequestList].sort(
    (first: IMedicationRequest, second: IMedicationRequest): number =>
      second.authoredOn.localeCompare(first.authoredOn),
  )

type CreateEncounterMutationVariables = {
  targetPatientId: string
  payload: ICreateEncounterPayload
}

type CreateEncounterMutationContext = {
  optimisticEncounterId: string
  previousEncounters: Array<IEncounter>
  previousPatientDetail?: IPatientDetail
}

type CreateMedicationRequestMutationVariables = {
  targetPatientId: string
  payload: ICreateMedicationRequestPayload
}

type CreateMedicationRequestMutationContext = {
  optimisticMedicationRequestId: string
  previousMedicationRequests: Array<IMedicationRequest>
  previousPatientDetail?: IPatientDetail
}

const PatientAction = () => {
  const { patientId = '' } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showPatientJson, setShowPatientJson] = useState(false)
  const [isCreateEncounterOpen, setIsCreateEncounterOpen] = useState(false)
  const [isCreateMedicationRequestOpen, setIsCreateMedicationRequestOpen] = useState(false)

  const handleBack = useCallback((): void => {
    void navigate(ROUTES.home.path)
  }, [navigate])

  const {
    data: patientDetail,
    error: patientDetailError,
    isError: isPatientDetailError,
    isPending: isPatientDetailPending,
    refetch: refetchPatientDetail,
  } = useQuery<IPatientDetail>({
    queryKey: ['patient-detail', patientId],
    queryFn: () => getPatientDetail(patientId),
    enabled: Boolean(patientId),
    staleTime: 30_000,
  })

  const {
    data: encounters = [],
    error: encountersError,
    isError: isEncountersError,
    isPending: isEncountersPending,
    refetch: refetchEncounters,
  } = useQuery<Array<IEncounter>>({
    queryKey: ['patient-encounters', patientId],
    queryFn: () => listPatientEncounters(patientId),
    enabled: Boolean(patientId),
    staleTime: 30_000,
  })

  const {
    data: medicationRequests = [],
    error: medicationRequestsError,
    isError: isMedicationRequestsError,
    isPending: isMedicationRequestsPending,
    refetch: refetchMedicationRequests,
  } = useQuery<Array<IMedicationRequest>>({
    queryKey: ['patient-medication-requests', patientId],
    queryFn: () => listPatientMedicationRequests(patientId),
    enabled: Boolean(patientId),
    staleTime: 30_000,
  })

  const { data: medicationCatalog = [] } = useQuery<Array<IMedication>>({
    queryKey: ['medications', 'catalog'],
    queryFn: () => listMedications(''),
    staleTime: 5 * 60_000,
  })

  const { isPending: isCreatingEncounter, mutate: createEncounterMutation } = useMutation<
    IEncounter,
    unknown,
    CreateEncounterMutationVariables,
    CreateEncounterMutationContext
  >({
    mutationFn: ({ targetPatientId, payload }: CreateEncounterMutationVariables) =>
      createPatientEncounter(targetPatientId, payload),
    onMutate: async ({
      targetPatientId,
      payload,
    }: CreateEncounterMutationVariables): Promise<CreateEncounterMutationContext> => {
      setIsCreateEncounterOpen(false)

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['patient-encounters', targetPatientId] }),
        queryClient.cancelQueries({ queryKey: ['patient-detail', targetPatientId] }),
      ])

      const previousEncounters =
        queryClient.getQueryData<Array<IEncounter>>(['patient-encounters', targetPatientId]) || []
      const previousPatientDetail = queryClient.getQueryData<IPatientDetail>(['patient-detail', targetPatientId])
      const optimisticEncounterId = buildOptimisticResourceId('encounter')

      queryClient.setQueryData<Array<IEncounter>>(['patient-encounters', targetPatientId], (currentEncounters = []) =>
        sortEncountersByNewest([
          {
            id: optimisticEncounterId,
            date: payload.date,
            patientId: targetPatientId,
            patientName: previousPatientDetail?.name || patientDetail?.name || 'Unknown',
            classDisplay: payload.classDisplay,
            status: payload.status,
          },
          ...currentEncounters,
        ]),
      )

      queryClient.setQueryData<IPatientDetail>(
        ['patient-detail', targetPatientId],
        (currentPatientDetail: IPatientDetail | undefined): IPatientDetail | undefined => {
          if (!currentPatientDetail) return currentPatientDetail
          return {
            ...currentPatientDetail,
            encounterCount: currentPatientDetail.encounterCount + 1,
          }
        },
      )

      return {
        optimisticEncounterId,
        previousEncounters,
        previousPatientDetail,
      }
    },
    onSuccess: (
      createdEncounter: IEncounter,
      { targetPatientId }: CreateEncounterMutationVariables,
      mutationContext: CreateEncounterMutationContext | undefined,
    ) => {
      toast.success('Encounter created successfully.')

      queryClient.setQueryData<Array<IEncounter>>(['patient-encounters', targetPatientId], (currentEncounters = []) => {
        const nonOptimisticEncounters = currentEncounters.filter(
          (encounter: IEncounter): boolean => encounter.id !== mutationContext?.optimisticEncounterId,
        )
        const hasCreatedEncounter = nonOptimisticEncounters.some(
          (encounter: IEncounter): boolean => encounter.id === createdEncounter.id,
        )
        return sortEncountersByNewest(
          hasCreatedEncounter ? nonOptimisticEncounters : [createdEncounter, ...nonOptimisticEncounters],
        )
      })

      void queryClient.invalidateQueries({
        queryKey: ['patient-detail', targetPatientId],
        refetchType: 'inactive',
      })
      void queryClient.invalidateQueries({
        queryKey: ['patient-encounters', targetPatientId],
        refetchType: 'inactive',
      })
      void queryClient.invalidateQueries({ queryKey: ['encounters'], refetchType: 'inactive' })
    },
    onError: (
      createError: unknown,
      { targetPatientId }: CreateEncounterMutationVariables,
      mutationContext: CreateEncounterMutationContext | undefined,
    ) => {
      if (mutationContext) {
        queryClient.setQueryData<Array<IEncounter>>(
          ['patient-encounters', targetPatientId],
          mutationContext.previousEncounters,
        )
        if (mutationContext.previousPatientDetail) {
          queryClient.setQueryData<IPatientDetail>(
            ['patient-detail', targetPatientId],
            mutationContext.previousPatientDetail,
          )
        }
      }
      toast.error(getErrorMessage(createError, 'Failed to create encounter.'))
    },
  })

  const { isPending: isCreatingMedicationRequest, mutate: createMedicationRequestMutation } = useMutation<
    IMedicationRequest,
    unknown,
    CreateMedicationRequestMutationVariables,
    CreateMedicationRequestMutationContext
  >({
    mutationFn: ({
      targetPatientId,
      payload,
    }: CreateMedicationRequestMutationVariables) => createPatientMedicationRequest(targetPatientId, payload),
    onMutate: async ({
      targetPatientId,
      payload,
    }: CreateMedicationRequestMutationVariables): Promise<CreateMedicationRequestMutationContext> => {
      setIsCreateMedicationRequestOpen(false)

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['patient-medication-requests', targetPatientId] }),
        queryClient.cancelQueries({ queryKey: ['patient-detail', targetPatientId] }),
      ])

      const previousMedicationRequests =
        queryClient.getQueryData<Array<IMedicationRequest>>(['patient-medication-requests', targetPatientId]) || []
      const previousPatientDetail = queryClient.getQueryData<IPatientDetail>(['patient-detail', targetPatientId])
      const optimisticMedicationRequestId = buildOptimisticResourceId('medication-request')
      const selectedMedication = medicationCatalog.find((medication: IMedication): boolean => medication.code === payload.code)

      queryClient.setQueryData<Array<IMedicationRequest>>(
        ['patient-medication-requests', targetPatientId],
        (currentMedicationRequests = []) =>
          sortMedicationRequestsByNewest([
            {
              id: optimisticMedicationRequestId,
              patientId: targetPatientId,
              patientName: previousPatientDetail?.name || patientDetail?.name || 'Unknown',
              encounterId: payload.encounterId,
              status: payload.status,
              intent: 'order',
              medicationCode: payload.code,
              medicationDisplay: selectedMedication?.display || payload.code,
              dose: payload.dose,
              frequency: payload.frequency,
              authoredOn: payload.authoredOn,
              fhirResource: {},
            },
            ...currentMedicationRequests,
          ]),
      )

      queryClient.setQueryData<IPatientDetail>(
        ['patient-detail', targetPatientId],
        (currentPatientDetail: IPatientDetail | undefined): IPatientDetail | undefined => {
          if (!currentPatientDetail) return currentPatientDetail
          return {
            ...currentPatientDetail,
            medicationRequestCount: currentPatientDetail.medicationRequestCount + 1,
          }
        },
      )

      return {
        optimisticMedicationRequestId,
        previousMedicationRequests,
        previousPatientDetail,
      }
    },
    onSuccess: (
      createdMedicationRequest: IMedicationRequest,
      { targetPatientId }: CreateMedicationRequestMutationVariables,
      mutationContext: CreateMedicationRequestMutationContext | undefined,
    ) => {
      toast.success('Medication request created successfully.')

      queryClient.setQueryData<Array<IMedicationRequest>>(
        ['patient-medication-requests', targetPatientId],
        (currentMedicationRequests = []) => {
          const nonOptimisticMedicationRequests = currentMedicationRequests.filter(
            (medicationRequest: IMedicationRequest): boolean =>
              medicationRequest.id !== mutationContext?.optimisticMedicationRequestId,
          )
          const hasCreatedMedicationRequest = nonOptimisticMedicationRequests.some(
            (medicationRequest: IMedicationRequest): boolean => medicationRequest.id === createdMedicationRequest.id,
          )
          return sortMedicationRequestsByNewest(
            hasCreatedMedicationRequest
              ? nonOptimisticMedicationRequests
              : [createdMedicationRequest, ...nonOptimisticMedicationRequests],
          )
        },
      )

      void queryClient.invalidateQueries({
        queryKey: ['patient-detail', targetPatientId],
        refetchType: 'inactive',
      })
      void queryClient.invalidateQueries({
        queryKey: ['patient-medication-requests', targetPatientId],
        refetchType: 'inactive',
      })
      void queryClient.invalidateQueries({ queryKey: ['encounter-detail'], refetchType: 'inactive' })
    },
    onError: (
      createError: unknown,
      { targetPatientId }: CreateMedicationRequestMutationVariables,
      mutationContext: CreateMedicationRequestMutationContext | undefined,
    ) => {
      if (mutationContext) {
        queryClient.setQueryData<Array<IMedicationRequest>>(
          ['patient-medication-requests', targetPatientId],
          mutationContext.previousMedicationRequests,
        )
        if (mutationContext.previousPatientDetail) {
          queryClient.setQueryData<IPatientDetail>(
            ['patient-detail', targetPatientId],
            mutationContext.previousPatientDetail,
          )
        }
      }
      toast.error(getErrorMessage(createError, 'Failed to create medication request.'))
    },
  })

  const patientLabel = useMemo((): string => {
    if (!patientDetail) return 'Patient Action'
    return `${patientDetail.name} (${patientDetail.id})`
  }, [patientDetail])

  const handleCreateEncounter = useCallback(
    (payload: ICreateEncounterPayload): void => {
      if (!patientId) {
        toast.error('Patient ID is missing.')
        return
      }
      createEncounterMutation({ targetPatientId: patientId, payload })
    },
    [createEncounterMutation, patientId],
  )

  const handleCreateMedicationRequest = useCallback(
    (payload: ICreateMedicationRequestPayload): void => {
      if (!patientId) {
        toast.error('Patient ID is missing.')
        return
      }
      createMedicationRequestMutation({ targetPatientId: patientId, payload })
    },
    [createMedicationRequestMutation, patientId],
  )

  return (
    <Section className="space-y-6">
      <header className="flex items-center gap-2">
        <Button size="icon-sm" variant="ghost" onClick={handleBack}>
          <ArrowLeft className="size-4" />
        </Button>
        <p className="text-body-1 font-medium">{patientLabel}</p>
      </header>

      {isPatientDetailPending ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
          <Loader2 className="size-10 animate-spin opacity-40" />
          <p className="text-body-2">Loading patient details...</p>
        </div>
      ) : isPatientDetailError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-theme-gray">
          <TriangleAlert className="size-10 text-destructive opacity-80" />
          <p className="text-body-2">{getErrorMessage(patientDetailError, 'Failed to load patient details.')}</p>
          <Button size="sm" variant="outline" onClick={() => refetchPatientDetail()}>
            Retry
          </Button>
        </div>
      ) : patientDetail ? (
        <>
          <Card className="gap-0">
            <CardContent className="space-y-4 pt-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-2">
                  <h3 className="text-heading-3">{patientDetail.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-body-2 text-theme-gray">
                    <Badge variant="outline" className="font-mono">
                      {patientDetail.id}
                    </Badge>
                    <Badge variant="secondary" className="capitalize">
                      {patientDetail.gender}
                    </Badge>
                    <span>Age {patientDetail.age}</span>
                  </div>
                </div>
                <div className="grid min-w-[220px] grid-cols-2 gap-3 text-right">
                  <div className="rounded-lg border border-page p-3">
                    <p className="text-body-3 text-theme-gray">Encounters</p>
                    <p className="text-heading-4">{patientDetail.encounterCount}</p>
                  </div>
                  <div className="rounded-lg border border-page p-3">
                    <p className="text-body-3 text-theme-gray">Medication Requests</p>
                    <p className="text-heading-4">{patientDetail.medicationRequestCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-page pt-4">
                <p className="text-body-2 text-theme-gray">FHIR Patient Resource (HAPI FHIR structure)</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className={cn(
                      'relative h-6 w-11 rounded-full border border-page bg-theme-gray-200 transition-colors',
                      showPatientJson && 'bg-theme-primary-200',
                    )}
                    onClick={() => setShowPatientJson((prev: boolean) => !prev)}
                  >
                    <span
                      className={cn(
                        'absolute top-1/2 left-0.5 size-5 -translate-y-1/2 rounded-full bg-theme-white shadow transition-transform',
                        showPatientJson && 'translate-x-5',
                      )}
                    />
                  </button>
                  <span className="text-body-1">Show JSON</span>
                </div>
              </div>

              {showPatientJson && (
                <pre className="max-h-96 overflow-auto rounded-lg border border-page bg-theme-gray-50 p-4 font-mono text-body-3 text-theme-gray-700">
                  {JSON.stringify(patientDetail.fhirResource, null, 2)}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-heading-3">Encounters</CardTitle>
                <Button size="sm" onClick={() => setIsCreateEncounterOpen(true)}>
                  <Plus className="size-4" /> Create Encounter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isEncountersPending ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-theme-gray">
                  <Loader2 className="size-8 animate-spin opacity-40" />
                  <p className="text-body-2">Loading encounters...</p>
                </div>
              ) : isEncountersError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-theme-gray">
                  <TriangleAlert className="size-8 text-destructive opacity-80" />
                  <p className="text-body-2">{getErrorMessage(encountersError, 'Failed to load encounters.')}</p>
                  <Button size="sm" variant="outline" onClick={() => refetchEncounters()}>
                    Retry
                  </Button>
                </div>
              ) : encounters.length === 0 ? (
                <p className="text-body-2 text-theme-gray">No encounters for this patient yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {encounters.map((encounter) => (
                      <TableRow key={encounter.id}>
                        <TableCell>{formatDate(encounter.date, 'DD/MM/YYYY')}</TableCell>
                        <TableCell>{encounter.classDisplay}</TableCell>
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
                            onClick={() => void navigate(ROUTES.encounterDetail.getUrl(encounter.id))}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card className="gap-4">
            <CardHeader className="pb-0">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle className="text-heading-3">Medication Requests</CardTitle>
                <Button size="sm" onClick={() => setIsCreateMedicationRequestOpen(true)}>
                  <Plus className="size-4" /> Create Medication Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isMedicationRequestsPending ? (
                <div className="flex flex-col items-center justify-center gap-2 py-8 text-center text-theme-gray">
                  <Loader2 className="size-8 animate-spin opacity-40" />
                  <p className="text-body-2">Loading medication requests...</p>
                </div>
              ) : isMedicationRequestsError ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center text-theme-gray">
                  <TriangleAlert className="size-8 text-destructive opacity-80" />
                  <p className="text-body-2">
                    {getErrorMessage(medicationRequestsError, 'Failed to load medication requests.')}
                  </p>
                  <Button size="sm" variant="outline" onClick={() => refetchMedicationRequests()}>
                    Retry
                  </Button>
                </div>
              ) : medicationRequests.length === 0 ? (
                <p className="text-body-2 text-theme-gray">No medication requests for this patient yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Authored On</TableHead>
                      <TableHead>Encounter</TableHead>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dose</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medicationRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.authoredOn, 'DD/MM/YYYY')}</TableCell>
                        <TableCell className="font-mono text-body-3">{request.encounterId}</TableCell>
                        <TableCell className="font-medium">
                          {request.medicationDisplay} ({request.medicationCode})
                        </TableCell>
                        <TableCell>{request.dose}</TableCell>
                        <TableCell>{request.frequency}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === 'active'
                                ? 'success'
                                : request.status === 'cancelled'
                                  ? 'destructive'
                                  : 'secondary'
                            }
                            className="capitalize"
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <CreateEncounterDialog
            isSubmitting={isCreatingEncounter}
            onSubmit={handleCreateEncounter}
            open={isCreateEncounterOpen}
            onOpenChange={setIsCreateEncounterOpen}
          />

          <CreateMedicationRequestDialog
            encounters={encounters}
            isSubmitting={isCreatingMedicationRequest}
            medications={medicationCatalog}
            onSubmit={handleCreateMedicationRequest}
            open={isCreateMedicationRequestOpen}
            onOpenChange={setIsCreateMedicationRequestOpen}
          />
        </>
      ) : null}
    </Section>
  )
}

type CreateEncounterDialogProps = {
  isSubmitting: boolean
  onSubmit: (payload: ICreateEncounterPayload) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateEncounterDialog({ isSubmitting, onSubmit, open, onOpenChange }: CreateEncounterDialogProps) {
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10))
  const [classDisplay, setClassDisplay] = useState<string>(ENCOUNTER_CLASS_OPTIONS[0])
  const [status, setStatus] = useState<IEncounterStatus>('active')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback((): void => {
    setDate(new Date().toISOString().slice(0, 10))
    setClassDisplay(ENCOUNTER_CLASS_OPTIONS[0])
    setStatus('active')
    setError(null)
  }, [])

  useEffect((): void => {
    if (!open) reset()
  }, [open, reset])

  const handleSave = useCallback((): void => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      setError('Date format is invalid.')
      return
    }
    if (!classDisplay.trim()) {
      setError('Encounter class is required.')
      return
    }

    setError(null)
    onSubmit({
      date,
      classDisplay,
      status,
    })
  }, [classDisplay, date, onSubmit, status])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Encounter</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Class</Label>
            <Select value={classDisplay} onValueChange={(value: string) => setClassDisplay(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENCOUNTER_CLASS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: string) => setStatus(value as IEncounterStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENCOUNTER_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-body-2 text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type CreateMedicationRequestDialogProps = {
  encounters: Array<IEncounter>
  isSubmitting: boolean
  medications: Array<IMedication>
  onSubmit: (payload: ICreateMedicationRequestPayload) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateMedicationRequestDialog({
  encounters,
  isSubmitting,
  medications,
  onSubmit,
  open,
  onOpenChange,
}: CreateMedicationRequestDialogProps) {
  const [authoredOn, setAuthoredOn] = useState<string>(new Date().toISOString().slice(0, 10))
  const [encounterId, setEncounterId] = useState<string>('')
  const [selectedCode, setSelectedCode] = useState<string>('')
  const [dose, setDose] = useState<string>('')
  const [frequency, setFrequency] = useState<string>('3/day')
  const [status, setStatus] = useState<IMedicationRequestStatus>('active')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback((): void => {
    setAuthoredOn(new Date().toISOString().slice(0, 10))
    setEncounterId('')
    setSelectedCode('')
    setDose('')
    setFrequency('3/day')
    setStatus('active')
    setError(null)
  }, [])

  useEffect((): void => {
    if (!open) reset()
  }, [open, reset])

  const handleSave = useCallback((): void => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(authoredOn)) {
      setError('Authored On date format is invalid.')
      return
    }
    if (!encounterId) {
      setError('Please select encounter.')
      return
    }
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
      authoredOn,
      encounterId,
      code: selectedCode,
      dose: normalizedDose,
      frequency: normalizedFrequency,
      status,
    })
  }, [authoredOn, dose, encounterId, frequency, onSubmit, selectedCode, status])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Medication Request</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Authored On</Label>
            <Input type="date" value={authoredOn} onChange={(event) => setAuthoredOn(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Encounter</Label>
            <Select value={encounterId} onValueChange={(value: string) => setEncounterId(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select encounter" />
              </SelectTrigger>
              <SelectContent>
                {encounters.map((encounter) => (
                  <SelectItem key={encounter.id} value={encounter.id}>
                    {encounter.id} - {encounter.classDisplay} ({encounter.date})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(value: string) => setStatus(value as IMedicationRequestStatus)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEDICATION_REQUEST_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-body-2 text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PatientAction
