'use client'

import { useCallback, useState } from 'react'

// import { Description, Field, FieldGroup } from '@/components/app' // Removed: fieldset components deleted
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export const RefundReview = ({
  amount,
  ...props
}: { amount: string } & React.ComponentPropsWithoutRef<typeof Button>) => {
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" name="amount" defaultValue={amount} placeholder="$0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
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
              </div>
              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox id="notify" name="notify" />
                  <div className="space-y-1">
                    <Label htmlFor="notify">Notify customer</Label>
                    <p className="text-muted-foreground text-sm">
                      An email notification will be sent to this customer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
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
