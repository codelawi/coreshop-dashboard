import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Bell, Loader2, Send, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useSendNotification } from '@/hooks/api/use-notifications'
import { useUsers } from '@/hooks/api/use-users'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ThemeSwitch } from '@/components/theme-switch'

const notifSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  body: z.string().min(1, 'Message is required').max(1000),
})
type NotifForm = z.infer<typeof notifSchema>

const GROUP_OPTIONS = [
  { value: 'client', label: 'Clients', description: 'All active clients on the platform' },
  { value: 'seller', label: 'Sellers', description: 'All active store sellers' },
  { value: 'driver', label: 'Drivers', description: 'All active drivers' },
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
}

export function Notifications() {
  const send = useSendNotification()
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['client'])
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [activeTab, setActiveTab] = useState<'group' | 'users'>('group')

  const { data: usersData, isLoading: usersLoading } = useUsers({
    search: userSearch || undefined,
    per_page: 30,
  })
  const allUsers: any[] = usersData?.data ?? []

  const groupForm = useForm<NotifForm>({
    resolver: zodResolver(notifSchema),
    defaultValues: { title: '', body: '' },
  })

  const usersForm = useForm<NotifForm>({
    resolver: zodResolver(notifSchema),
    defaultValues: { title: '', body: '' },
  })

  const handleGroupSubmit = (values: NotifForm) => {
    if (selectedRoles.length === 0) {
      toast.error('Select at least one group.')
      return
    }
    send.mutate(
      { type: 'group', title: values.title, body: values.body, roles: selectedRoles },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? 'Notification sent.')
          groupForm.reset()
        },
        onError: () => toast.error('Failed to send notification.'),
      }
    )
  }

  const handleUsersSubmit = (values: NotifForm) => {
    if (selectedUserIds.length === 0) {
      toast.error('Select at least one user.')
      return
    }
    send.mutate(
      { type: 'users', title: values.title, body: values.body, user_ids: selectedUserIds },
      {
        onSuccess: (res) => {
          toast.success(res.message ?? 'Notification sent.')
          usersForm.reset()
          setSelectedUserIds([])
        },
        onError: () => toast.error('Failed to send notification.'),
      }
    )
  }

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    )
  }

  const toggleUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    )
  }

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <Bell className='h-5 w-5' />
          <h1 className='text-lg font-semibold'>Notifications</h1>
        </div>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <Main className='space-y-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Send Notifications</h2>
          <p className='text-muted-foreground'>
            Broadcast a push notification to groups or individual users.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'group' | 'users')}>
          <TabsList>
            <TabsTrigger value='group' className='gap-2'>
              <Users className='h-4 w-4' />
              By Group
            </TabsTrigger>
            <TabsTrigger value='users' className='gap-2'>
              <Bell className='h-4 w-4' />
              Specific Users
            </TabsTrigger>
          </TabsList>

          {/* GROUP TAB */}
          <TabsContent value='group' className='mt-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* Audience selector */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Select Audience</CardTitle>
                  <CardDescription>Choose which groups receive this notification</CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {GROUP_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                        selectedRoles.includes(opt.value)
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <Checkbox
                        checked={selectedRoles.includes(opt.value)}
                        onCheckedChange={() => toggleRole(opt.value)}
                        className='mt-0.5'
                      />
                      <div>
                        <p className='font-medium'>{opt.label}</p>
                        <p className='text-xs text-muted-foreground'>{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </CardContent>
              </Card>

              {/* Message form */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Compose Message</CardTitle>
                  <CardDescription>Write the notification title and body</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...groupForm}>
                    <form
                      onSubmit={groupForm.handleSubmit(handleGroupSubmit)}
                      className='space-y-4'
                    >
                      <FormField
                        control={groupForm.control}
                        name='title'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder='Notification title…' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={groupForm.control}
                        name='body'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Write your message here…'
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='submit'
                        className='w-full'
                        disabled={send.isPending || selectedRoles.length === 0}
                      >
                        {send.isPending ? (
                          <Loader2 className='me-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Send className='me-2 h-4 w-4' />
                        )}
                        Send to{' '}
                        {selectedRoles.length === 0
                          ? 'no groups'
                          : selectedRoles.join(', ')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SPECIFIC USERS TAB */}
          <TabsContent value='users' className='mt-6'>
            <div className='grid gap-6 lg:grid-cols-2'>
              {/* User picker */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Select Users</CardTitle>
                  <CardDescription>
                    {selectedUserIds.length > 0
                      ? `${selectedUserIds.length} user${selectedUserIds.length > 1 ? 's' : ''} selected`
                      : 'Search and select recipients'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Input
                    placeholder='Search by name or email…'
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />

                  {usersLoading ? (
                    <div className='flex justify-center py-6'>
                      <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
                    </div>
                  ) : (
                    <div className='max-h-64 space-y-1 overflow-y-auto'>
                      {allUsers.length === 0 ? (
                        <p className='py-4 text-center text-sm text-muted-foreground'>
                          No users found.
                        </p>
                      ) : (
                        allUsers.map((u: any) => (
                          <label
                            key={u.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                              selectedUserIds.includes(u.id)
                                ? 'bg-primary/10'
                                : 'hover:bg-muted/50'
                            }`}
                          >
                            <Checkbox
                              checked={selectedUserIds.includes(u.id)}
                              onCheckedChange={() => toggleUser(u.id)}
                            />
                            <Avatar className='h-7 w-7'>
                              <AvatarImage src={u.avatar ?? undefined} />
                              <AvatarFallback className='text-xs'>
                                {getInitials(u.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className='min-w-0 flex-1'>
                              <p className='truncate text-sm font-medium'>{u.name}</p>
                              <p className='truncate text-xs text-muted-foreground'>{u.email}</p>
                            </div>
                            <Badge variant='outline' className='shrink-0 text-xs capitalize'>
                              {u.role}
                            </Badge>
                          </label>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Message form */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Compose Message</CardTitle>
                  <CardDescription>Write the notification title and body</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...usersForm}>
                    <form
                      onSubmit={usersForm.handleSubmit(handleUsersSubmit)}
                      className='space-y-4'
                    >
                      <FormField
                        control={usersForm.control}
                        name='title'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder='Notification title…' {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={usersForm.control}
                        name='body'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder='Write your message here…'
                                rows={4}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type='submit'
                        className='w-full'
                        disabled={send.isPending || selectedUserIds.length === 0}
                      >
                        {send.isPending ? (
                          <Loader2 className='me-2 h-4 w-4 animate-spin' />
                        ) : (
                          <Send className='me-2 h-4 w-4' />
                        )}
                        Send to {selectedUserIds.length} user
                        {selectedUserIds.length !== 1 ? 's' : ''}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
