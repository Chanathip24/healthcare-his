import { Search, SearchX } from 'lucide-react'
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

const encounters = [
  { id: '1', date: '2026-01-01', patient: 'John Doe', class: 'Ambulatory (AMB)', status: 'Active' },
  { id: '2', date: '2026-01-02', patient: 'Jane Doe', class: 'Ambulatory (AMB)', status: 'Active' },
  { id: '3', date: '2026-01-03', patient: 'Jim Doe', class: 'Ambulatory (AMB)', status: 'Active' },
]
const Encounters = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  const handleSearch: ChangeEventHandler<HTMLInputElement> = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
  }, [])
  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Encounters</h3>
          <p className="text-body-2 text-theme-gray">All encounters across patients</p>
        </div>
      </header>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Encounters Directory</CardTitle>
          <p className="text-body-3 text-theme-gray">
            Search by encounter ID (e.g. <code>e1</code>) or patient name to look up records.
          </p>
          <div className="relative mt-2">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-theme-gray" />
            <Input placeholder="Search by encounter ID " className="pl-9" onChange={handleSearch} />
          </div>
        </CardHeader>
        <CardContent>
          {!query ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <Search className="size-10 opacity-40" />
              <p className="text-body-2">Enter a patient ID or name to search</p>
            </div>
          ) : encounters.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-theme-gray">
              <SearchX className="size-10 opacity-40" />
              <p className="text-body-2">No patients match "{query}"</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encounters.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-body-3">{e.id}</TableCell>
                    <TableCell className="font-medium">{e.patient}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {e.class}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="success" className="capitalize">
                        {e.status}
                      </Badge>
                    </TableCell>
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
          {error && <p className="text-body-2 text-destructive">{error}</p>}
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

export default Encounters
