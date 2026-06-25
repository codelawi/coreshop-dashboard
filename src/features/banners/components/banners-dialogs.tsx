import { useBannersContext } from './banners-provider'
import { BannersActionDialog } from './banners-action-dialog'
import { BannersDeleteDialog } from './banners-delete-dialog'

export function BannersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useBannersContext()

  const handleClose = (type: typeof open) => {
    setOpen(null)
    if (type !== 'create') {
      setTimeout(() => setCurrentRow(null), 200)
    }
  }

  return (
    <>
      <BannersActionDialog
        open={open === 'create' || open === 'edit'}
        onOpenChange={(isOpen) => { if (!isOpen) handleClose(open) }}
        banner={open === 'edit' ? currentRow : null}
      />
      <BannersDeleteDialog
        open={open === 'delete'}
        onOpenChange={(isOpen) => { if (!isOpen) handleClose('delete') }}
        banner={currentRow}
      />
    </>
  )
}
