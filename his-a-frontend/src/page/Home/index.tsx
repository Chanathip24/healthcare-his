import { type QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Search, SearchX, TriangleAlert } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

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
import { createPatient, listPatients } from '@/hooks'
import type { ICreatePatientPayload, IPatient, IPatientGender } from '@/type'
import { getErrorMessage } from '@/utilities'

const calculateAgeFromBirthDate = (birthDate: string): number => {
  const [yearString, monthString, dayString] = birthDate.split('-')
  const year = Number(yearString)
  const month = Number(monthString)
  const day = Number(dayString)
  if (!year || !month || !day) return 0

  const now = new Date()
  let age = now.getUTCFullYear() - year
  const currentMonth = now.getUTCMonth() + 1
  const currentDay = now.getUTCDate()

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1
  }
  return Math.max(age, 0)
}

const Home = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const normalizedQuery = useMemo((): string => query.trim(), [query])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

  const matchesPatientQuery = useCallback((patient: IPatient, rawQuery: string): boolean => {
    const normalizedQuery = rawQuery.trim().toLowerCase()
    if (!normalizedQuery) return true

    return (
      patient.id.toLowerCase().includes(normalizedQuery) ||
      patient.name.toLowerCase().includes(normalizedQuery) ||
      patient.gender.toLowerCase().includes(normalizedQuery)
    )
  }, [])

  const getPatientQueryTerm = useCallback((queryKey: QueryKey): string => {
    const secondItem = queryKey[1]
    return typeof secondItem === 'string' ? secondItem : ''
  }, [])

  type CreatePatientMutationContext = {
    optimisticPatientId: string
    snapshots: Array<[QueryKey, Array<IPatient> | undefined]>
  }

  const {
    data: patients = [],
    error,
    isError,
    isFetching,
    isPending,
    refetch,
  } = useQuery<Array<IPatient>>({
    queryKey: ['patients', normalizedQuery],
    queryFn: () => listPatients(normalizedQuery),
    staleTime: 30_000,
  })

  const { isPending: isCreatingPatient, mutate: createPatientMutation } = useMutation<
    IPatient,
    Error,
    ICreatePatientPayload,
    CreatePatientMutationContext
  >({
    mutationFn: createPatient,
    onMutate: async (payload: ICreatePatientPayload) => {
      await queryClient.cancelQueries({ queryKey: ['patients'] })

      const snapshots = queryClient
        .getQueriesData<Array<IPatient>>({ queryKey: ['patients'] })
        .map(
          ([queryKey, data]): [QueryKey, Array<IPatient> | undefined] => [queryKey, data ? [...data] : undefined],
        )

      const optimisticPatient: IPatient = {
        id: `temp-${Date.now()}`,
        name: payload.name,
        gender: payload.gender,
        age: calculateAgeFromBirthDate(payload.birthDate),
        createdAt: new Date().toISOString(),
      }

      for (const [queryKey, existingPatients] of snapshots) {
        if (!existingPatients) continue
        const queryTerm = getPatientQueryTerm(queryKey)
        if (!matchesPatientQuery(optimisticPatient, queryTerm)) continue

        queryClient.setQueryData<Array<IPatient>>(queryKey, [optimisticPatient, ...existingPatients])
      }

      setOpen(false)

      return {
        optimisticPatientId: optimisticPatient.id,
        snapshots,
      }
    },
    onSuccess: (createdPatient: IPatient, _variables, context) => {
      const patientQueries = queryClient.getQueriesData<Array<IPatient>>({ queryKey: ['patients'] })
      for (const [queryKey, existingPatients] of patientQueries) {
        if (!existingPatients) continue

        const filteredPatients = existingPatients.filter(
          (patient) => patient.id !== context?.optimisticPatientId && patient.id !== createdPatient.id,
        )
        const queryTerm = getPatientQueryTerm(queryKey)

        if (matchesPatientQuery(createdPatient, queryTerm)) {
          queryClient.setQueryData<Array<IPatient>>(queryKey, [createdPatient, ...filteredPatients])
          continue
        }

        queryClient.setQueryData<Array<IPatient>>(queryKey, filteredPatients)
      }

      toast.success(`Created patient ${createdPatient.name}`)

      queryClient.invalidateQueries({ queryKey: ['patients'], refetchType: 'inactive' })
      queryClient.invalidateQueries({ queryKey: ['encounters'] })
    },
    onError: (createError: unknown, _variables, context) => {
      if (context?.snapshots) {
        for (const [queryKey, data] of context.snapshots) {
          queryClient.setQueryData<Array<IPatient> | undefined>(queryKey, data)
        }
      }
      toast.error(getErrorMessage(createError, 'Unable to create patient.'))
    },
  })

  const handleCreatePatient = useCallback(
    (payload: ICreatePatientPayload) => {
      createPatientMutation(payload)
    },
    [createPatientMutation],
  )

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
            Search by patient ID (e.g. <code>p1</code>) or name to look up records.
          </p>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-theme-gray" />
            <Input
              placeholder="Search by patient ID or name..."
              className="pl-9"
              value={query}
              onChange={handleSearch}
            />
            {isFetching && (
              <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-theme-gray" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Loader2 className="size-10 animate-spin opacity-40" />
              <p className="text-body-2">Loading patients...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-theme-gray">
              <TriangleAlert className="size-10 text-destructive opacity-80" />
              <p className="text-body-2">{getErrorMessage(error, 'Failed to load patients.')}</p>
              <Button size="sm" variant="outline" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : patients.length === 0 && !normalizedQuery ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Search className="size-10 opacity-40" />
              <p className="text-body-2">No patients available. Create the first patient to begin.</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No patients match "{normalizedQuery}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-mono text-body-3">{patient.id}</TableCell>
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void navigate(ROUTES.patientAction.getUrl(patient.id))}
                      >
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreatePatientDialog
        isSubmitting={isCreatingPatient}
        onCreate={handleCreatePatient}
        open={open}
        onOpenChange={setOpen}
      />
    </Section>
  )
}
function CreatePatientDialog({
  isSubmitting,
  onCreate,
  open,
  onOpenChange,
}: {
  isSubmitting: boolean
  onCreate: (payload: ICreatePatientPayload) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [namePrefix, setNamePrefix] = useState('')
  const [givenName, setGivenName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [gender, setGender] = useState<IPatientGender>('male')
  const [birthDate, setBirthDate] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [hospitalNumber, setHospitalNumber] = useState('')
  const [homePhone, setHomePhone] = useState('')
  const [mobilePhone, setMobilePhone] = useState('')
  const [addressText, setAddressText] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [addressCity, setAddressCity] = useState('')
  const [addressDistrict, setAddressDistrict] = useState('')
  const [addressState, setAddressState] = useState('')
  const [addressPostalCode, setAddressPostalCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setNamePrefix('')
    setGivenName('')
    setFamilyName('')
    setGender('male')
    setBirthDate('')
    setNationalId('')
    setHospitalNumber('')
    setHomePhone('')
    setMobilePhone('')
    setAddressText('')
    setAddressLine('')
    setAddressCity('')
    setAddressDistrict('')
    setAddressState('')
    setAddressPostalCode('')
    setError(null)
  }, [])

  const handleSubmit = useCallback(() => {
    const normalizedPrefix = namePrefix.trim().replace(/\s+/g, ' ')
    const normalizedGivenName = givenName.trim().replace(/\s+/g, ' ')
    const normalizedFamilyName = familyName.trim().replace(/\s+/g, ' ')
    const normalizedName = `${normalizedPrefix}${normalizedGivenName} ${normalizedFamilyName}`.trim()
    const normalizedBirthDate = birthDate.trim()
    const normalizedNationalId = nationalId.trim()
    const normalizedHospitalNumber = hospitalNumber.trim()
    const normalizedHomePhone = homePhone.trim()
    const normalizedMobilePhone = mobilePhone.trim()
    const normalizedAddressText = addressText.trim()
    const normalizedAddressLine = addressLine.trim()
    const normalizedAddressCity = addressCity.trim()
    const normalizedAddressDistrict = addressDistrict.trim()
    const normalizedAddressState = addressState.trim()
    const normalizedAddressPostalCode = addressPostalCode.trim()

    if (!normalizedPrefix || !normalizedGivenName || !normalizedFamilyName) {
      setError('Prefix, given name and family name are required.')
      return
    }
    if (
      !/^[\p{L}\p{M}\s'.-]+$/u.test(normalizedPrefix) ||
      !/^[\p{L}\p{M}\s'.-]+$/u.test(normalizedGivenName) ||
      !/^[\p{L}\p{M}\s'.-]+$/u.test(normalizedFamilyName)
    ) {
      setError('Name fields contain unsupported characters.')
      return
    }
    if (normalizedName.length < 2 || normalizedName.length > 120) {
      setError('Full name must be between 2 and 120 characters.')
      return
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthDate)) {
      setError('Birth date must be in YYYY-MM-DD format.')
      return
    }
    if (!/^\d{13}$/.test(normalizedNationalId)) {
      setError('National ID must be exactly 13 digits.')
      return
    }
    if (!/^[a-zA-Z0-9-]+$/.test(normalizedHospitalNumber)) {
      setError('Hospital Number contains unsupported characters.')
      return
    }
    if (!/^[0-9+\-()\s]{6,30}$/.test(normalizedHomePhone) || !/^[0-9+\-()\s]{6,30}$/.test(normalizedMobilePhone)) {
      setError('Phone number format is invalid.')
      return
    }
    if (
      !normalizedAddressText ||
      !normalizedAddressLine ||
      !normalizedAddressCity ||
      !normalizedAddressDistrict ||
      !normalizedAddressState ||
      !normalizedAddressPostalCode
    ) {
      setError('All address fields are required.')
      return
    }
    if (!/^[0-9-]+$/.test(normalizedAddressPostalCode)) {
      setError('Postal code format is invalid.')
      return
    }

    setError(null)
    onCreate({
      address: {
        text: normalizedAddressText,
        line: normalizedAddressLine,
        city: normalizedAddressCity,
        district: normalizedAddressDistrict,
        state: normalizedAddressState,
        postalCode: normalizedAddressPostalCode,
      },
      birthDate: normalizedBirthDate,
      familyName: normalizedFamilyName,
      gender,
      givenName: normalizedGivenName,
      homePhone: normalizedHomePhone,
      hospitalNumber: normalizedHospitalNumber,
      name: normalizedName,
      namePrefix: normalizedPrefix,
      mobilePhone: normalizedMobilePhone,
      nationalId: normalizedNationalId,
    })
  }, [
    addressCity,
    addressDistrict,
    addressLine,
    addressPostalCode,
    addressState,
    addressText,
    birthDate,
    familyName,
    gender,
    givenName,
    homePhone,
    hospitalNumber,
    mobilePhone,
    namePrefix,
    nationalId,
    onCreate,
  ])

  return (
    <Dialog
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) reset()
        onOpenChange(v)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Patient</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Prefix</Label>
              <Input value={namePrefix} onChange={(e) => setNamePrefix(e.target.value)} placeholder="นาย" />
            </div>
            <div className="space-y-2">
              <Label>Given Name</Label>
              <Input value={givenName} onChange={(e) => setGivenName(e.target.value)} placeholder="สุขภาพ" />
            </div>
            <div className="space-y-2">
              <Label>Family Name</Label>
              <Input value={familyName} onChange={(e) => setFamilyName(e.target.value)} placeholder="แข็งแรง" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={(v: string) => setGender(v as IPatientGender)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Birth Date</Label>
              <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>National ID</Label>
              <Input
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="1234567890123"
                maxLength={13}
              />
            </div>
            <div className="space-y-2">
              <Label>Hospital Number (HN)</Label>
              <Input
                value={hospitalNumber}
                onChange={(e) => setHospitalNumber(e.target.value)}
                placeholder="555555"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Home Phone</Label>
              <Input value={homePhone} onChange={(e) => setHomePhone(e.target.value)} placeholder="0 2123 4567" />
            </div>
            <div className="space-y-2">
              <Label>Mobile Phone</Label>
              <Input value={mobilePhone} onChange={(e) => setMobilePhone(e.target.value)} placeholder="08 1123 4567" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address Text</Label>
            <Input
              value={addressText}
              onChange={(e) => setAddressText(e.target.value)}
              placeholder="เลขที่ 2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพมหานคร, 10700"
            />
          </div>
          <div className="space-y-2">
            <Label>Address Line</Label>
            <Input value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="เลขที่ 2 ถนนวังหลัง" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={addressCity} onChange={(e) => setAddressCity(e.target.value)} placeholder="ศิริราช" />
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input
                value={addressDistrict}
                onChange={(e) => setAddressDistrict(e.target.value)}
                placeholder="บางกอกน้อย"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>State</Label>
              <Input
                value={addressState}
                onChange={(e) => setAddressState(e.target.value)}
                placeholder="กรุงเทพมหานคร"
              />
            </div>
            <div className="space-y-2">
              <Label>Postal Code</Label>
              <Input
                value={addressPostalCode}
                onChange={(e) => setAddressPostalCode(e.target.value)}
                placeholder="10700"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Home
