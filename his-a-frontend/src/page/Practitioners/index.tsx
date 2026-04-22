import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'

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
import { EFhirAdministrativeGender, EFhirPractitionerResourceType } from '@/enums'
import { useHisApiExecuteCreatePractitioner, useHisApiQueryPractitioners } from '@/hooks'
import type { ICreatePractitionerPayload, IFhirPractitionerBundleEntry } from '@/type'

const Practitioners = () => {
  const { data, isLoading } = useHisApiQueryPractitioners()

  const [open, setOpen] = useState(false)

  const practitioners = useMemo(() => {
    if (!data) return []
    if (!data || !data.entry || data.entry.length <= 0) return []
    return data.entry
  }, [data])

  return (
    <Section>
      <header className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold tracking-tight">Practitioners</h3>
          <p className="text-body-2 text-theme-gray">Manage practitioner directory for clinical operations</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" /> New Practitioner
        </Button>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Practitioner Directory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p className="text-body-2 text-theme-gray">Loading practitioners...</p>
          ) : practitioners.length === 0 ? (
            <p className="text-body-2 text-theme-gray">No practitioners found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {practitioners.map((entry: IFhirPractitionerBundleEntry) => (
                  <TableRow key={entry.resource.id}>
                    <TableCell className="font-mono text-body-3">{entry.resource.id}</TableCell>
                    <TableCell>{entry.resource.name?.[0]?.text || '-'}</TableCell>
                    <TableCell>
                      <Badge className="capitalize">{entry.resource.gender || '-'}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <RawJsonPanel data={data} />
        </CardContent>
      </Card>

      <CreatePractitionerDialog open={open} onOpenChange={setOpen} />
    </Section>
  )
}

function CreatePractitionerDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const createMutation = useHisApiExecuteCreatePractitioner()
  const [name, setName] = useState('')
  const [gender, setGender] = useState<EFhirAdministrativeGender>(EFhirAdministrativeGender.Male)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setName('')
    setGender(EFhirAdministrativeGender.Male)
    setError(null)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError('Name is required')
      return
    }

    const payload: ICreatePractitionerPayload = {
      resourceType: EFhirPractitionerResourceType.Practitioner,
      active: true,
      gender,
      name: [
        {
          text: name.trim(),
        },
      ],
      identifier: [
        {
          system: 'urn:his:practitioner-id',
          value: crypto.randomUUID(),
        },
      ],
    }

    setError(null)
    try {
      await createMutation.mutateAsync(payload)
      await queryClient.invalidateQueries({ queryKey: ['getAllPractitioners'] })
      onOpenChange(false)
      reset()
    } catch {
      setError('Failed to create practitioner.')
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) reset()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Practitioner</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select value={gender} onValueChange={(value) => setGender(value as EFhirAdministrativeGender)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={EFhirAdministrativeGender.Male}>Male</SelectItem>
                <SelectItem value={EFhirAdministrativeGender.Female}>Female</SelectItem>
                <SelectItem value={EFhirAdministrativeGender.Other}>Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={createMutation.isPending} onClick={handleCreate}>
            {createMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
        <RawJsonPanel data={createMutation.data} />
      </DialogContent>
    </Dialog>
  )
}

export default Practitioners
