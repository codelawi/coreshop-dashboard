import { useUsers } from './users-provider'
import { UsersActionDialog } from './users-action-dialog'
import { UsersBanDialog } from './users-ban-dialog'
import { UsersDeleteDialog } from './users-delete-dialog'
import { UserProfileSheet } from './user-profile-sheet'

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()

  const closeWithDelay = (type: typeof open) => () => {
    setOpen(type)
    setTimeout(() => setCurrentRow(null), 500)
  }

  return (
    <>
      {currentRow && (
        <>
          <UserProfileSheet
            key={`user-profile-${currentRow.id}`}
            userId={currentRow.id}
            open={open === 'profile'}
            onOpenChange={closeWithDelay('profile')}
          />

          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === 'edit'}
            onOpenChange={closeWithDelay('edit')}
            currentRow={currentRow}
          />

          <UsersBanDialog
            key={`user-ban-${currentRow.id}`}
            open={open === 'ban'}
            onOpenChange={closeWithDelay('ban')}
            currentRow={currentRow}
          />

          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === 'delete'}
            onOpenChange={closeWithDelay('delete')}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
