import { createContext, useContext, useState } from 'react'
import type { Coupon } from '../data/schema'

type CouponsDialogType = 'create' | 'edit' | 'delete'

interface CouponsContextType {
  open: CouponsDialogType | null
  setOpen: (type: CouponsDialogType | null) => void
  currentRow: Coupon | null
  setCurrentRow: (coupon: Coupon | null) => void
}

const CouponsContext = createContext<CouponsContextType | null>(null)

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState<CouponsDialogType | null>(null)
  const [currentRow, setCurrentRow] = useState<Coupon | null>(null)

  return (
    <CouponsContext.Provider
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </CouponsContext.Provider>
  )
}

export function useCoupons() {
  const context = useContext(CouponsContext)
  if (!context)
    throw new Error('useCoupons must be used within CouponsProvider')
  return context
}
