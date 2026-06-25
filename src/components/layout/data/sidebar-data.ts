import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Store,
  Tag,
  BarChart3,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@coreshop.com',
    avatar: '/avatars/admin.jpg',
  },
  teams: [
    {
      name: 'CoreShop',
      logo: ShoppingCart,
      plan: 'Admin Dashboard',
    },
  ],
  navGroups: [
    {
      title: 'General',
      items: [
        {
          title: 'Overview',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Orders',
          url: '/orders',
          icon: ShoppingCart,
        },
        {
          title: 'Products',
          url: '/products',
          icon: Package,
        },
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Stores',
          url: '/stores',
          icon: Store,
        },
        {
          title: 'Coupons & Discounts',
          url: '/coupons',
          icon: Tag,
        },
        {
          title: 'Analytics',
          url: '/analytics',
          icon: BarChart3,
        },
      ],
    },
  ],
}
