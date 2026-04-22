import { useQueryClient } from '@tanstack/react-query'
import { Plus, Search, SearchX } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { type NavigateFunction, useNavigate } from 'react-router-dom'

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
  ScrollArea,
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
import { EFhirAdministrativeGender, EFhirPatientResourceType } from '@/enums'
import { useHisApiExecuteCreatePatient, useHisApiQueryPatients } from '@/hooks'
import type { IFhirPatient, IFhirPatientBundleEntry } from '@/type'
import { formatDate } from '@/utilities'

type IPatientRow = {
  id: string
  name: string
  gender: string
  age: string
  isActive: boolean
  lastUpdated: string
}

type ICreatePatientFormValues = {
  nationalId: string
  hospitalNumber: string
  nameUse: string
  nameText: string
  familyName: string
  givenName: string
  prefix: string
  homePhone: string
  mobilePhone: string
  gender: EFhirAdministrativeGender
  birthDate: string
  addressText: string
  addressLine: string
  city: string
  district: string
  state: string
  postalCode: string
  active: boolean
}

const createDefaultPatientFormValues = (): ICreatePatientFormValues => ({
  nationalId: '1234567890123',
  hospitalNumber: '555555',
  nameUse: 'official',
  nameText: '',
  familyName: '',
  givenName: '',
  prefix: '',
  homePhone: '',
  mobilePhone: '',
  gender: EFhirAdministrativeGender.Male,
  birthDate: '',
  addressText: '',
  addressLine: '',
  city: '',
  district: '',
  state: '',
  postalCode: '',
  active: true,
})

const getPatientDisplayName = (patient: IFhirPatient): string => {
  const firstName = patient.name?.[0]
  return firstName?.text || firstName?.given?.join(' ') || '-'
}

const getPatientAge = (birthDate?: string): string => {
  if (!birthDate) return '-'
  const birth = new Date(birthDate)
  if (Number.isNaN(birth.getTime())) return '-'

  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  const dayDiff = now.getDate() - birth.getDate()

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age -= 1
  return age >= 0 ? String(age) : '-'
}

const Home = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate: NavigateFunction = useNavigate()
  const { data, isLoading, isFetching } = useHisApiQueryPatients()

  const patients: Array<IFhirPatient> = useMemo(() => {
    return data?.entry?.map((entry: IFhirPatientBundleEntry) => entry.resource) ?? []
  }, [data])

  const patientRows: Array<IPatientRow> = useMemo(() => {
    return patients.map((patient) => ({
      id: patient.id,
      name: getPatientDisplayName(patient),
      gender: patient.gender,
      age: getPatientAge(patient.birthDate),
      isActive: patient.active,
      lastUpdated: patient.meta?.lastUpdated || '-',
    }))
  }, [patients])

  const filteredPatients: Array<IPatientRow> = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return patientRows

    return patientRows.filter((patient) => {
      return (
        patient.id.toLowerCase().includes(keyword) ||
        patient.name.toLowerCase().includes(keyword) ||
        patient.gender.toLowerCase().includes(keyword) ||
        patient.lastUpdated.toLowerCase().includes(keyword)
      )
    })
  }, [patientRows, query])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])
  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Patients</h3>
          <p className="text-body-2 text-theme-gray">Manage patients, encounters and medications</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New Patient
        </Button>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Patient Directory</CardTitle>
          <p className="text-body-3 text-theme-gray">
            Data is loaded from the Patients API and searchable by key fields.
          </p>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-theme-gray" />
            <Input
              placeholder="Search by ID, name, gender, or updated date..."
              className="pl-9"
              onChange={handleSearch}
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading || isFetching ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Search className="size-10 animate-pulse opacity-40" />
              <p className="text-body-2">Loading patients...</p>
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No patients match "{query || 'your search'}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => {
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-mono text-body-3">{patient.id}</TableCell>
                      <TableCell>{patient.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell>{patient.age}</TableCell>
                      <TableCell>
                        <Badge variant={patient.isActive ? 'default' : 'secondary'}>
                          {patient.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-body-3 text-theme-gray">
                        {formatDate(patient.lastUpdated, 'DD/MM/YYYY HH:mm')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(ROUTES.patientDetail.path.replace(':patientId', patient.id))}
                        >
                          Select
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          <div className="mt-4">
            <RawJsonPanel data={data} />
          </div>
        </CardContent>
      </Card>

      <CreatePatientDialog
        open={open}
        onOpenChange={setOpen}
        onSuccess={async () => {
          await queryClient.invalidateQueries({ queryKey: ['getAllPatients'] })
        }}
      />
    </Section>
  )
}
function CreatePatientDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => Promise<void>
}) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const createPatientMutation = useHisApiExecuteCreatePatient()
  const form = useForm<ICreatePatientFormValues>({
    defaultValues: createDefaultPatientFormValues(),
  })

  const resetForm = () => {
    form.reset(createDefaultPatientFormValues())
    setSubmitError(null)
  }

  const handleCreatePatient = async (values: ICreatePatientFormValues) => {
    const now = new Date().toISOString()
    const payload: IFhirPatient = {
      resourceType: EFhirPatientResourceType.Patient,
      id: crypto.randomUUID(),
      active: values.active,
      gender: values.gender,
      birthDate: values.birthDate,
      meta: {
        versionId: '1',
        lastUpdated: now,
      },
      text: {
        status: 'generated',
        div: '',
      },
      identifier: [
        {
          system: 'http://www.dopa.go.th/nid',
          value: values.nationalId.trim(),
        },
        {
          system: 'http://www.myhospital.com/hn',
          value: values.hospitalNumber.trim(),
        },
      ],
      name: [
        {
          use: values.nameUse.trim(),
          text: values.nameText.trim(),
          family: values.familyName.trim(),
          given: [values.givenName.trim()],
          prefix: [values.prefix.trim()],
        },
      ],
      telecom: [
        {
          system: 'phone',
          value: values.homePhone.trim(),
          use: 'home',
        },
        {
          system: 'phone',
          value: values.mobilePhone.trim(),
          use: 'mobile',
        },
      ],
      address: [
        {
          use: 'home',
          type: 'both',
          text: values.addressText.trim(),
          line: [values.addressLine.trim()],
          city: values.city.trim(),
          district: values.district.trim(),
          state: values.state.trim(),
          postalCode: values.postalCode.trim(),
        },
      ],
    }

    setSubmitError(null)
    try {
      await createPatientMutation.mutateAsync(payload)
      await onSuccess()
      onOpenChange(false)
      resetForm()
    } catch {
      setSubmitError('Create patient failed. Please try again.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm()
        onOpenChange(v)
      }}
    >
      <DialogContent className="max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleCreatePatient)}>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-5">
                <section className="space-y-3">
                  <h4 className="text-body-2 font-medium">Identifiers</h4>
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nationalId"
                      rules={{ required: 'National ID is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>National ID</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hospitalNumber"
                      rules={{ required: 'Hospital Number is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hospital Number (HN)</FormLabel>
                          <FormControl>
                            <Input placeholder="555555" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h4>Name</h4>
                  <FormField
                    control={form.control}
                    name="nameText"
                    rules={{ required: 'Name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="nameUse"
                      rules={{ required: 'Name use is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name Use</FormLabel>
                          <FormControl>
                            <Input placeholder="official" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="prefix"
                      rules={{ required: 'Prefix is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prefix</FormLabel>
                          <FormControl>
                            <Input placeholder="นาย" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="givenName"
                      rules={{ required: 'Given name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Given Name</FormLabel>
                          <FormControl>
                            <Input placeholder="สุขภาพ" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="familyName"
                      rules={{ required: 'Family name is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Family Name</FormLabel>
                          <FormControl>
                            <Input placeholder="แข็งแรง" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h4>Demographics</h4>
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      rules={{ required: 'Gender is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(v) => field.onChange(v as EFhirAdministrativeGender)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value={EFhirAdministrativeGender.Male}>Male</SelectItem>
                                <SelectItem value={EFhirAdministrativeGender.Female}>Female</SelectItem>
                                <SelectItem value={EFhirAdministrativeGender.Other}>Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="birthDate"
                      rules={{ required: 'Birth date is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Birth Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active</FormLabel>
                        <FormControl>
                          <Select value={String(field.value)} onValueChange={(v) => field.onChange(v === 'true')}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </section>

                <section className="space-y-3">
                  <h4>Telecom</h4>
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="homePhone"
                      rules={{ required: 'Home phone is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="0 2123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="mobilePhone"
                      rules={{ required: 'Mobile phone is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="08 1123 4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>

                <section className="space-y-3">
                  <h4>Address</h4>
                  <FormField
                    control={form.control}
                    name="addressText"
                    rules={{ required: 'Address text is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address Text</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="เลขที่ 2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพมหานคร, 10700"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="addressLine"
                      rules={{ required: 'Address line is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address Line</FormLabel>
                          <FormControl>
                            <Input placeholder="เลขที่ 2 ถนนวังหลัง" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="postalCode"
                      rules={{ required: 'Postal code is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Postal Code</FormLabel>
                          <FormControl>
                            <Input placeholder="10700" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 desktop:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="city"
                      rules={{ required: 'City is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="ศิริราช" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="district"
                      rules={{ required: 'District is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Input placeholder="บางกอกน้อย" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      rules={{ required: 'State is required' }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="กรุงเทพมหานคร" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </section>
              </div>
            </ScrollArea>
            {submitError && <p className="text-body-2 text-destructive">{submitError}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createPatientMutation.isPending}>
                {createPatientMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <RawJsonPanel data={createPatientMutation.data} />
      </DialogContent>
    </Dialog>
  )
}

export default Home
