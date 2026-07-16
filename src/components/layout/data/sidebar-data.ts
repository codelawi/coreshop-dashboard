import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Store,
  Tag,
  BarChart3,
  Bell,
  Image,
  Layers,
  CreditCard,
  Star,
  Wallet,
  Truck,
  Shield,
  MessageSquare,
  ScrollText,
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
      title: 'Overview',
      items: [
        {
          title: 'Dashboard',
          url: '/',
          icon: LayoutDashboard,
        },
        {
          title: 'Analytics',
          url: '/analytics',
          icon: BarChart3,
        },
      ],
    },
    {
      title: 'Marketplace',
      items: [
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
          title: 'Stores',
          url: '/stores',
          icon: Store,
        },
        {
          title: 'Categories',
          url: '/categories',
          icon: Layers,
        },
      ],
    },
    {
      title: 'People',
      items: [
        {
          title: 'Users',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Drivers',
          url: '/drivers',
          icon: Truck,
        },
      ],
    },
    {
      title: 'Platform',
      items: [
        {
          title: 'Notifications',
          url: '/notifications',
          icon: Bell,
        },
        {
          title: 'Reviews',
          url: '/reviews',
          icon: Star,
        },
        {
          title: 'Payouts',
          url: '/payouts',
          icon: Wallet,
        },
        {
          title: 'Coupons & Discounts',
          url: '/coupons',
          icon: Tag,
        },
        {
          title: 'Banners',
          url: '/banners',
          icon: Image,
        },
        {
          title: 'Payment Settings',
          url: '/payment',
          icon: CreditCard,
        },
      ],
    },
    {
      title: 'System',
      items: [
        {
          title: 'Support Chat',
          url: '/chat',
          icon: MessageSquare,
        },
        {
          title: 'Security',
          url: '/security',
          icon: Shield,
        },
        {
          title: 'Server Logs',
          url: '/logs',
          icon: ScrollText,
        },
      ],
    },
  ],
}
