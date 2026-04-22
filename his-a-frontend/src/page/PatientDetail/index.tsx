import { ArrowLeft, SearchX } from 'lucide-react'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
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
  useHisApiExecuteCreatePatientEncounter,
  useHisApiQueryPatientById,
  useHisApiQueryPatientEncounters,
} from '@/hooks'
import type { IFhirEncounterBundleEntry, IFhirEncounterPayload } from '@/type'

const formatDateTime = (value?: string): string => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString()
}

const getAgeFromBirthDate = (birthDate?: string): string => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '-'

  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  const dayDiff = today.getDate() - birth.getDate()
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1

  return age >= 0 ? String(age) : '-'
}

type ICreateEncounterFormValues = {
  encounterId: string
  status: string
  classSystem: string
  encounterClass: string
  periodStart: string
  reasonText: string
}

const ENCOUNTER_CLASS_OPTIONS: Array<{ code: string; display: string }> = [
  { code: 'AMB', display: 'Ambulatory' },
  { code: 'EMER', display: 'Emergency' },
  { code: 'IMP', display: 'Inpatient encounter' },
]

const getEncounterClassByCode = (code: string) => {
  return ENCOUNTER_CLASS_OPTIONS.find((option) => option.code === code) ?? ENCOUNTER_CLASS_OPTIONS[0]
}

const createDefaultEncounterFormValues = (): ICreateEncounterFormValues => ({
  encounterId: `enc-${crypto.randomUUID().slice(0, 8)}`,
  status: 'in-progress',
  classSystem: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
  encounterClass: 'AMB',
  periodStart: new Date().toISOString().slice(0, 16),
  reasonText: 'Routine check-up',
})

const PatientDetail = () => {
  const navigate: NavigateFunction = useNavigate()
  const { patientId } = useParams<{ patientId: string }>()
  const safePatientId = patientId ?? ''
  const [openCreateEncounter, setOpenCreateEncounter] = useState(false)

  const patientQuery = useHisApiQueryPatientById({
    patientId: safePatientId,
    enabled: Boolean(patientId),
  })
  const { data: encounterEntry, isLoading: isEncounterLoading } = useHisApiQueryPatientEncounters({
    patientId: safePatientId,
    enabled: Boolean(patientId),
  })

  const patientName = patientQuery.data?.name?.[0]?.text || patientQuery.data?.name?.[0]?.given?.join(' ') || '-'
  const patientAge = getAgeFromBirthDate(patientQuery.data?.birthDate)

  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Patient Detail</h3>
          <p className="text-body-2 text-theme-gray">Patient profile and encounters</p>
        </div>
        <Button variant="outline" onClick={() => navigate(ROUTES.home.path)}>
          <ArrowLeft className="size-4" /> Back to Patients
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Resource</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {patientQuery.isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading patient...</p>
          ) : !patientQuery.data ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-theme-gray">
              <SearchX className="size-8 opacity-40" />
              <p className="text-body-2">Patient not found.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 desktop:grid-cols-4">
                <div>
                  <p className="text-body-3 text-theme-gray">ID</p>
                  <p className="font-mono">{patientQuery.data.id}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Name</p>
                  <p>{patientName}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Gender</p>
                  <Badge className="capitalize">{patientQuery.data.gender}</Badge>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Birth Date</p>
                  <p>{patientQuery.data.birthDate || '-'}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Age</p>
                  <p>{patientAge}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Status</p>
                  <Badge variant={patientQuery.data.active ? 'default' : 'secondary'}>
                    {patientQuery.data.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Last Updated</p>
                  <p>{formatDateTime(patientQuery.data.meta?.lastUpdated)}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Identifiers</p>
                  <p>{patientQuery.data.identifier?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Contacts</p>
                  <p>{patientQuery.data.telecom?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Addresses</p>
                  <p>{patientQuery.data.address?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-body-3 text-theme-gray">Encounter Count</p>
                  <p>{encounterEntry?.entry?.length}</p>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-page p-4">
                <h4 className="text-body-2 font-medium">Narrative</h4>
                <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
                  <div>
                    <p className="text-body-3 text-theme-gray">Status</p>
                    <p>{patientQuery.data.text?.status || '-'}</p>
                  </div>
                  <div>
                    <p className="text-body-3 text-theme-gray">XHTML</p>
                    <p className="font-mono text-body-3 break-all text-theme-gray">
                      {patientQuery.data.text?.div || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-page p-4">
                <h4 className="text-body-2 font-medium">Identifiers</h4>
                {!patientQuery.data.identifier?.length ? (
                  <p className="text-body-2 text-theme-gray">No identifiers.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>System</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientQuery.data.identifier.map((identifier, index) => (
                        <TableRow key={`${identifier.system}-${identifier.value}-${index}`}>
                          <TableCell>{identifier.system || '-'}</TableCell>
                          <TableCell className="font-mono text-body-3">{identifier.value || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="space-y-3 rounded-md border border-page p-4">
                <h4 className="text-body-2 font-medium">Names</h4>
                {!patientQuery.data.name?.length ? (
                  <p className="text-body-2 text-theme-gray">No names.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Use</TableHead>
                        <TableHead>Text</TableHead>
                        <TableHead>Family</TableHead>
                        <TableHead>Given</TableHead>
                        <TableHead>Prefix</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientQuery.data.name.map((name, index) => (
                        <TableRow key={`${name.text}-${index}`}>
                          <TableCell>{name.use || '-'}</TableCell>
                          <TableCell>{name.text || '-'}</TableCell>
                          <TableCell>{name.family || '-'}</TableCell>
                          <TableCell>{name.given?.join(', ') || '-'}</TableCell>
                          <TableCell>{name.prefix?.join(', ') || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="space-y-3 rounded-md border border-page p-4">
                <h4 className="text-body-2 font-medium">Telecom</h4>
                {!patientQuery.data.telecom?.length ? (
                  <p className="text-body-2 text-theme-gray">No telecom entries.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>System</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Use</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientQuery.data.telecom.map((telecom, index) => (
                        <TableRow key={`${telecom.system}-${telecom.value}-${index}`}>
                          <TableCell>{telecom.system || '-'}</TableCell>
                          <TableCell>{telecom.value || '-'}</TableCell>
                          <TableCell>{telecom.use || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>

              <div className="space-y-3 rounded-md border border-page p-4">
                <h4 className="text-body-2 font-medium">Address</h4>
                {!patientQuery.data.address?.length ? (
                  <p className="text-body-2 text-theme-gray">No addresses.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Use / Type</TableHead>
                        <TableHead>Text</TableHead>
                        <TableHead>Line</TableHead>
                        <TableHead>City</TableHead>
                        <TableHead>District</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Postal Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patientQuery.data.address.map((address, index) => (
                        <TableRow key={`${address.text}-${index}`}>
                          <TableCell>{`${address.use || '-'} / ${address.type || '-'}`}</TableCell>
                          <TableCell>{address.text || '-'}</TableCell>
                          <TableCell>{address.line?.join(', ') || '-'}</TableCell>
                          <TableCell>{address.city || '-'}</TableCell>
                          <TableCell>{address.district || '-'}</TableCell>
                          <TableCell>{address.state || '-'}</TableCell>
                          <TableCell>{address.postalCode || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          )}
          <RawJsonPanel data={patientQuery.data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-base">Patient Encounters</CardTitle>
          <Button onClick={() => setOpenCreateEncounter(true)} disabled={!safePatientId}>
            Create Encounter
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEncounterLoading ? (
            <p className="text-body-2 text-theme-gray">Loading encounters...</p>
          ) : encounterEntry?.entry?.length === 0 ? (
            <p className="text-body-2 text-theme-gray">No encounters found for this patient.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Encounter ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounterEntry?.entry?.map((entry: IFhirEncounterBundleEntry) => (
                  <TableRow key={entry.resource.id}>
                    <TableCell className="font-mono text-body-3">{entry.resource.id}</TableCell>
                    <TableCell>{entry.resource.status}</TableCell>
                    <TableCell>{entry.resource.class.display || entry.resource.class.code}</TableCell>
                    <TableCell className="text-body-3 text-theme-gray">
                      {entry.resource.period?.start
                        ? `${formatDateTime(entry.resource.period.start)}${entry.resource.period.end ? ` - ${formatDateTime(entry.resource.period.end)}` : ''}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {entry.resource.serviceProvider?.display || entry.resource.serviceProvider?.reference || '-'}
                    </TableCell>
                    <TableCell>{entry.resource.reasonCode?.[0]?.text || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          navigate(
                            ROUTES.encounterDetail.path
                              .replace(':patientId', safePatientId)
                              .replace(':encounterId', entry.resource.id),
                          )
                        }
                      >
                        View Detail
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <RawJsonPanel data={encounterEntry} />
        </CardContent>
      </Card>

      <CreateEncounterDialog
        open={openCreateEncounter}
        patientId={safePatientId}
        onOpenChange={setOpenCreateEncounter}
      />
    </Section>
  )
}

function CreateEncounterDialog({
  open,
  patientId,
  onOpenChange,
}: {
  open: boolean
  patientId: string
  onOpenChange: (open: boolean) => void
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createEncounterMutation = useHisApiExecuteCreatePatientEncounter()
  const form = useForm<ICreateEncounterFormValues>({
    defaultValues: createDefaultEncounterFormValues(),
  })
  const encounterClass = useWatch({ control: form.control, name: 'encounterClass' })

  const resetForm = () => {
    form.reset(createDefaultEncounterFormValues())
    setSubmitError(null)
  }

  const handleCreateEncounter = async (values: ICreateEncounterFormValues) => {
    if (!patientId) {
      setSubmitError('Patient ID is required')
      return
    }

    const selectedEncounterClass = getEncounterClassByCode(values.encounterClass)
    const payload: IFhirEncounterPayload = {
      resourceType: 'Encounter',
      id: values.encounterId.trim(),
      status: values.status.trim(),
      class: {
        system: values.classSystem.trim(),
        code: selectedEncounterClass.code,
        display: selectedEncounterClass.display,
      },
      subject: {
        reference: `Patient/${patientId}`,
      },
      period: {
        start: new Date(values.periodStart).toISOString(),
      },
      reasonCode: [
        {
          text: values.reasonText.trim(),
        },
      ],
    }

    setSubmitError(null)
    try {
      await createEncounterMutation.mutateAsync({ patientId, payload })

      onOpenChange(false)
      resetForm()
    } catch {
      setSubmitError('Create encounter failed. Please try again.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) resetForm()
        onOpenChange(value)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Encounter</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleCreateEncounter)}>
            <FormField
              control={form.control}
              name="encounterId"
              rules={{ required: 'Encounter ID is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Encounter ID</FormLabel>
                  <FormControl>
                    <Input placeholder="enc001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="status"
              rules={{ required: 'Status is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-progress">in-progress</SelectItem>
                        <SelectItem value="planned">planned</SelectItem>
                        <SelectItem value="finished">finished</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-3 desktop:grid-cols-3">
              <FormField
                control={form.control}
                name="classSystem"
                rules={{ required: 'Class system is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class System</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="encounterClass"
                rules={{ required: 'Encounter class is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Encounter Class</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENCOUNTER_CLASS_OPTIONS.map((option) => (
                            <SelectItem key={option.code} value={option.code}>
                              {option.code} - {option.display}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormItem>
                <FormLabel>Class Display</FormLabel>
                <FormControl>
                  <Input value={getEncounterClassByCode(encounterClass ?? 'AMB').display} disabled />
                </FormControl>
              </FormItem>
            </div>
            <FormField
              control={form.control}
              name="periodStart"
              rules={{ required: 'Period start is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Period Start</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Subject Reference</FormLabel>
              <FormControl>
                <Input value={patientId ? `Patient/${patientId}` : ''} disabled />
              </FormControl>
            </FormItem>
            <FormField
              control={form.control}
              name="reasonText"
              rules={{ required: 'Reason is required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input placeholder="Routine check-up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {submitError && <p className="text-body-2 text-destructive">{submitError}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createEncounterMutation.isPending || !patientId}>
                {createEncounterMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <RawJsonPanel data={createEncounterMutation.data} />
      </DialogContent>
    </Dialog>
  )
}

export default PatientDetail
