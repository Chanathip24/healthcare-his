import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Search, SearchX, TriangleAlert } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

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
import { createPatient, listPatients } from '@/hooks'
import type { ICreatePatientPayload, IPatient, IPatientGender } from '@/type'
import { getErrorMessage } from '@/utilities'

const Home = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const normalizedQuery = useMemo((): string => query.trim(), [query])

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])

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

  const { isPending: isCreatingPatient, mutate: createPatientMutation } = useMutation({
    mutationFn: createPatient,
    onSuccess: (createdPatient: IPatient) => {
      toast.success(`Created patient ${createdPatient.name}`)
      setOpen(false)
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      queryClient.invalidateQueries({ queryKey: ['encounters'] })
    },
    onError: (createError: unknown) => {
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
            <Input placeholder="Search by patient ID or name..." className="pl-9" value={query} onChange={handleSearch} />
            {isFetching && <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-theme-gray" />}
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
                      <Button size="sm" variant="outline">
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
  const [name, setName] = useState('')
  const [gender, setGender] = useState<IPatientGender>('male')
  const [age, setAge] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = useCallback(() => {
    setName('')
    setGender('male')
    setAge('')
    setError(null)
  }, [])

  const handleSubmit = useCallback(() => {
    const normalizedName = name.trim().replace(/\s+/g, ' ')
    const normalizedAge = Number(age)

    if (normalizedName.length < 2 || normalizedName.length > 120) {
      setError('Name must be between 2 and 120 characters.')
      return
    }
    if (!/^[a-zA-Z][a-zA-Z\s'.-]*$/.test(normalizedName)) {
      setError('Name contains unsupported characters.')
      return
    }
    if (!Number.isInteger(normalizedAge) || normalizedAge < 0 || normalizedAge > 130) {
      setError('Age must be an integer between 0 and 130.')
      return
    }

    setError(null)
    onCreate({
      age: normalizedAge,
      gender,
      name: normalizedName,
    })
  }, [age, gender, name, onCreate])

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
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
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
              <Label>Age</Label>
              <Input type="number" min={1} value={age} onChange={(e) => setAge(e.target.value)} placeholder="0" />
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
