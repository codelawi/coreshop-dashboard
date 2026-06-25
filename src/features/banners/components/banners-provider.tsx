import React, { createContext, useContext, useState } from 'react'
import type { Banner } from '../data/schema'

export type BannersDialogType = 'create' | 'edit' | 'delete'

interface BannersContextValue {
  open: BannersDialogType | null
  setOpen: (type: BannersDialogType | null) => void
  currentRow: Banner | null
  setCurrentRow: (row: Banner | null) => void
}

const BannersContext = createContext<BannersContextValue | null>(null)

export function BannersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<BannersDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Banner | null>(null)

  return (
    <BannersContext.Provider value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BannersContext.Provider>
  )
}

export function useBannersContext() {
  const ctx = useContext(BannersContext)
  if (!ctx) throw new Error('useBannersContext must be used within <BannersProvider>')
  return ctx
}
