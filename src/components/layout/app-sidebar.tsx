import { useLayout } from '@/context/layout-provider'
import { useAuthStore } from '@/stores/auth-store'
import { useDashboardNotifications } from '@/hooks/api/use-dashboard-notifications'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'
import { AppTitle } from './app-title'
import { sidebarData } from './data/sidebar-data'
import { NavGroup } from './nav-group'
import { NavUser } from './nav-user'
import type { NavGroup as NavGroupType } from './types'

const BADGE_ROUTE_TYPE: Record<string, 'new_order' | 'new_product' | 'new_user'> = {
  '/orders': 'new_order',
  '/products': 'new_product',
  '/users': 'new_user',
}

export function AppSidebar() {
  const { collapsible, variant } = useLayout()
  const authUser = useAuthStore((s) => s.user)
  const { data: notifData } = useDashboardNotifications()

  const unread = notifData?.data?.filter((n) => !n.read_at) ?? []
  const unreadByType = unread.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1
    return acc
  }, {})

  const navGroupsWithBadges: NavGroupType[] = sidebarData.navGroups.map((group) => ({
    ...group,
    items: group.items.map((item) => {
      if (!('url' in item)) { return item }
      const type = BADGE_ROUTE_TYPE[item.url as string]
      const count = type ? (unreadByType[type] ?? 0) : 0
      return count > 0 ? { ...item, badge: String(count) } : item
    }),
  }))

  const navUser = {
    name: authUser?.name ?? sidebarData.user.name,
    email: authUser?.email ?? sidebarData.user.email,
    avatar: authUser?.avatar ?? sidebarData.user.avatar,
  }

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {navGroupsWithBadges.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={navUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
