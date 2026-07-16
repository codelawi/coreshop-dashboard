import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  MessageSquare,
  Search,
  Send,
  UserCircle2,
} from 'lucide-react'
import {
  type SupportConversation,
  type SupportMessage,
  useOrStartSupportConversation,
  useSendSupportMessage,
  useSupportChannel,
  useSupportConversations,
  useSupportMessages,
} from '@/hooks/api/use-support-chat'
import { useUsers } from '@/hooks/api/use-users'
import { useAuthStore } from '@/stores/auth-store'
import { useMarkAllNotificationsRead } from '@/hooks/api/use-dashboard-notifications'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'

function compactTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60_000)
  if (m < 1) { return 'now' }
  if (m < 60) { return `${m}m` }
  const h = Math.floor(m / 60)
  if (h < 24) { return `${h}h` }
  const d = Math.floor(h / 24)
  if (d < 7) { return `${d}d` }
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function ConversationItem({
  conv,
  selected,
  adminId,
  onClick,
}: {
  conv: SupportConversation
  selected: boolean
  adminId: number | undefined
  onClick: () => void
}) {
  const last = conv.last_message
  const isFromAdmin = last?.sender_id === adminId

  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${selected ? 'bg-muted' : ''}`}
    >
      <Avatar className='h-10 w-10 shrink-0'>
        <AvatarImage src={conv.user.avatar ?? undefined} />
        <AvatarFallback>{initials(conv.user.name)}</AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='min-w-0 flex-1 truncate text-sm font-medium'>{conv.user.name}</span>
          {conv.last_message_at && (
            <span className='shrink-0 text-xs text-muted-foreground'>
              {compactTime(conv.last_message_at)}
            </span>
          )}
        </div>
        {last && (
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {isFromAdmin ? 'You: ' : ''}
            {last.body}
          </p>
        )}
      </div>
    </button>
  )
}

function MessageBubble({
  msg,
  adminId,
}: {
  msg: SupportMessage
  adminId: number | undefined
}) {
  const isMe = msg.sender_id === adminId

  return (
    <div className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && (
        <Avatar className='mr-2 mt-1 h-7 w-7 shrink-0'>
          <AvatarImage src={msg.sender_avatar ?? undefined} />
          <AvatarFallback className='text-xs'>{initials(msg.sender_name)}</AvatarFallback>
        </Avatar>
      )}
      <div className={`flex max-w-[70%] flex-col ${isMe ? 'items-end' : 'items-start'}`}>
        {!isMe && (
          <span className='mb-1 text-xs text-muted-foreground'>{msg.sender_name}</span>
        )}
        <div
          className={`rounded-2xl px-4 py-2 text-sm ${
            isMe
              ? 'rounded-br-sm bg-primary text-primary-foreground'
              : 'rounded-bl-sm bg-muted text-foreground'
          }`}
        >
          {msg.body}
        </div>
        <span className='mt-1 text-xs text-muted-foreground'>
          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

export function Chat() {
  const { user } = useAuthStore()
  const adminId = user?.id

  const { data: conversations = [], isLoading: loadingConvs } = useSupportConversations()
  const { data: usersRes } = useUsers()
  const allUsers: Array<{ id: number; name: string; role: string; avatar: string | null }> =
    usersRes?.data ?? []

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [body, setBody] = useState('')
  const [newUserId, setNewUserId] = useState<string>('')

  const { data: messages = [], isLoading: loadingMsgs } = useSupportMessages(selectedId)
  const sendMessage = useSendSupportMessage(selectedId)
  const startConversation = useOrStartSupportConversation()
  useSupportChannel(selectedId)

  const markAllRead = useMarkAllNotificationsRead()
  useEffect(() => {
    markAllRead.mutate('new_support_message')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedConv = conversations.find((c) => c.id === selectedId)

  const filtered = conversations.filter((c) =>
    c.user.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSend = () => {
    const text = body.trim()
    if (!text || sendMessage.isPending || !selectedId) { return }
    setBody('')
    sendMessage.mutate(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleStartConversation = () => {
    if (!newUserId) { return }
    startConversation.mutate(Number(newUserId), {
      onSuccess: (conv) => {
        setSelectedId(conv.id)
        setNewUserId('')
      },
    })
  }

  const nonAdminUsers = allUsers.filter((u) => u.role !== 'admin')
  const selectedNewUser = nonAdminUsers.find((u) => String(u.id) === newUserId)

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <div data-layout='fixed' className='flex h-[calc(100svh-4rem)] overflow-hidden'>
        {/* Sidebar — full-width on mobile when no chat open, fixed width on desktop */}
        <div className={`flex flex-col border-r ${selectedId ? 'hidden md:flex md:w-80 md:shrink-0' : 'w-full md:w-80 md:shrink-0'}`}>
          <div className='space-y-2 p-4'>
            <h2 className='text-lg font-semibold'>Support Chat</h2>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search conversations...'
                className='pl-8'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className='flex gap-2'>
              <Select value={newUserId} onValueChange={setNewUserId}>
                <SelectTrigger className='flex-1 text-xs'>
                  {selectedNewUser ? (
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-5 w-5 shrink-0'>
                        <AvatarImage src={selectedNewUser.avatar ?? undefined} />
                        <AvatarFallback className='text-[10px]'>
                          {initials(selectedNewUser.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='truncate'>{selectedNewUser.name}</span>
                    </div>
                  ) : (
                    <SelectValue placeholder='Start with user...' />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {nonAdminUsers.map((u) => (
                    <SelectItem key={u.id} value={String(u.id)}>
                      <div className='flex items-center gap-2'>
                        <Avatar className='h-6 w-6 shrink-0'>
                          <AvatarImage src={u.avatar ?? undefined} />
                          <AvatarFallback className='text-[10px]'>
                            {initials(u.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='text-sm'>{u.name}</span>
                          <span className='text-xs capitalize text-muted-foreground'>{u.role}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size='sm'
                disabled={!newUserId || startConversation.isPending}
                onClick={handleStartConversation}
              >
                Go
              </Button>
            </div>
          </div>

          <Separator />

          <ScrollArea className='flex-1'>
            {loadingConvs ? (
              <div className='p-4 text-center text-sm text-muted-foreground'>Loading...</div>
            ) : filtered.length === 0 ? (
              <div className='p-8 text-center text-sm text-muted-foreground'>
                No conversations yet.
              </div>
            ) : (
              filtered.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  selected={conv.id === selectedId}
                  adminId={adminId}
                  onClick={() => setSelectedId(conv.id)}
                />
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat area */}
        {selectedConv ? (
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            {/* Header */}
            <div className='flex items-center gap-3 border-b px-4 py-3'>
              <Button
                variant='ghost'
                size='icon'
                className='shrink-0 md:hidden'
                onClick={() => setSelectedId(null)}
              >
                <ChevronLeft className='h-5 w-5' />
              </Button>
              <Avatar className='h-9 w-9 shrink-0'>
                <AvatarImage src={selectedConv.user.avatar ?? undefined} />
                <AvatarFallback>{initials(selectedConv.user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className='font-medium leading-none'>{selectedConv.user.name}</p>
                <p className='mt-0.5 text-xs text-muted-foreground capitalize'>
                  {selectedConv.user.role}
                </p>
              </div>
              <Badge variant='outline' className='ml-auto capitalize'>
                {selectedConv.user.role}
              </Badge>
            </div>

            {/* Messages */}
            <ScrollArea className='min-h-0 flex-1 px-4 py-4'>
              {loadingMsgs ? (
                <div className='text-center text-sm text-muted-foreground'>Loading...</div>
              ) : messages.length === 0 ? (
                <div className='flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground'>
                  <MessageSquare className='h-10 w-10' />
                  <p className='text-sm'>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble key={msg.id} msg={msg} adminId={adminId} />
                ))
              )}
              <div ref={bottomRef} />
            </ScrollArea>

            {/* Input */}
            <div className='border-t px-4 py-3'>
              <div className='flex flex-col gap-2'>
                <Textarea
                  placeholder='Type a message...'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessage.isPending}
                  rows={3}
                  className='resize-none text-sm'
                />
                <div className='flex items-center justify-between'>
                  <span className='text-xs text-muted-foreground'>
                    <kbd className='rounded border px-1 py-0.5 font-mono text-[10px]'>Ctrl</kbd>
                    {' + '}
                    <kbd className='rounded border px-1 py-0.5 font-mono text-[10px]'>Enter</kbd>
                    {' to send'}
                  </span>
                  <Button
                    size='sm'
                    onClick={handleSend}
                    disabled={!body.trim() || sendMessage.isPending}
                  >
                    <Send className='mr-1.5 h-3.5 w-3.5' />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className='hidden flex-1 flex-col items-center justify-center gap-3 text-muted-foreground md:flex'>
            <UserCircle2 className='h-16 w-16' />
            <p className='text-sm'>Select a conversation or start a new one</p>
          </div>
        )}
      </div>
    </>
  )
}
