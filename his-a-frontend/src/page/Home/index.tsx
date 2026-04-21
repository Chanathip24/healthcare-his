import { Plus, Search, SearchX } from 'lucide-react'
import { type ChangeEvent, type ChangeEventHandler, useCallback, useState } from 'react'

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

const patients = [
  { id: '1', name: 'John Doe', gender: 'Male', age: 30 },
  { id: '2', name: 'Jane Doe', gender: 'Female', age: 25 },
  { id: '3', name: 'Jim Doe', gender: 'Male', age: 20 },
]
const Home = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

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
            Search by patient ID (e.g. <code>p1</code>) or name to look up records.
          </p>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-theme-gray" />
            <Input placeholder="Search by patient ID or name..." className="pl-9" onChange={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          {!query ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Search className="size-10 opacity-40" />
              <p className="text-body-2">Enter a patient ID or name to search</p>
            </div>
          ) : patients.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No patients match "{query}"</p>
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
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-body-3">{p.id}</TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {p.gender}
                      </Badge>
                    </TableCell>
                    <TableCell>{p.age}</TableCell>
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

      <CreatePatientDialog open={open} onOpenChange={setOpen} />
    </Section>
  )
}
function CreatePatientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('male')
  const [age, setAge] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setGender('male')
    setAge('')
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
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
              <Select value={gender} onValueChange={(v) => setGender(v)}>
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
          <Button>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default Home
