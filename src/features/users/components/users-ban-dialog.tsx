import { Ban } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateUserStatus } from '@/hooks/api/use-users'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type User } from '../data/schema'

type UsersBanDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}

export function UsersBanDialog({
  open,
  onOpenChange,
  currentRow,
}: UsersBanDialogProps) {
  const updateStatus = useUpdateUserStatus()
  const isBanned = currentRow.status === 'suspended'

  const handleConfirm = () => {
    const newStatus = isBanned ? 'active' : 'suspended'
    updateStatus.mutate(
      { id: currentRow.id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(
            isBanned
              ? `${currentRow.name}'s account has been unbanned.`
              : `${currentRow.name}'s account has been banned.`
          )
          onOpenChange(false)
        },
        onError: () => {
          toast.error('Failed to update account.')
        },
      }
    )
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleConfirm}
      isLoading={updateStatus.isPending}
      title={
        <span className='flex items-center gap-2'>
          <Ban className='h-5 w-5 text-orange-500' />
          {isBanned ? 'Unban Account' : 'Ban Account'}
        </span>
      }
      desc={
        isBanned ? (
          <p>
            Are you sure you want to unban{' '}
            <span className='font-bold'>{currentRow.name}</span>? They will
            regain access to the platform.
          </p>
        ) : (
          <p>
            Are you sure you want to ban{' '}
            <span className='font-bold'>{currentRow.name}</span>? They will
            lose access to the platform immediately.
          </p>
        )
      }
      confirmText={isBanned ? 'Unban' : 'Ban'}
      destructive={!isBanned}
    />
  )
}
