'use client'

import { useCallback, useState } from 'react'

import { Description, Field, FieldGroup } from '@/components/custom'
import { Button } from '@/components/shadcn-ui/button'
import { Checkbox } from '@/components/shadcn-ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/shadcn-ui/dialog'
import { Input } from '@/components/shadcn-ui/input'
import { Label } from '@/components/shadcn-ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn-ui/select'


export const RefundReview = ({ amount, ...props }: { amount: string } & React.ComponentPropsWithoutRef<typeof Button>) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const handleOpen = useCallback(() => setIsOpen(true), [])
  const handleClose = useCallback(() => setIsOpen(false), [])

  return (
    <>
      <Button type="button" onClick={handleOpen} {...props} />
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund payment</DialogTitle>
            <DialogDescription>
              The refund will be reflected in the customer&apos;s bank account 2 to 3 business days after processing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
          <FieldGroup>
            <Field>
              <Label>Amount</Label>
              <Input name="amount" defaultValue={amount} placeholder="$0.00" autoFocus />
            </Field>
            <Field>
              <Label>Reason</Label>
              <Select name="reason" defaultValue="">
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="duplicate">Duplicate</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent</SelectItem>
                  <SelectItem value="requested_by_customer">Requested by customer</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <div className="flex items-start space-x-2">
                <Checkbox id="notify" name="notify" />
                <div className="space-y-1">
                  <Label htmlFor="notify">Notify customer</Label>
                  <Description>An email notification will be sent to this customer.</Description>
                </div>
              </div>
            </Field>
          </FieldGroup>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleClose}>Refund</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
