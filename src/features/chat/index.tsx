import { useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  ImageIcon,
  MessageSquarePlus,
  MessagesSquare,
  Search,
  Send,
  X,
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
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Header } from '@/components/layout/header'
import { ThemeSwitch } from '@/components/theme-switch'
import { cn } from '@/lib/utils'

/* ─── helpers ─────────────────────────────────────────────── */

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
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}

/* ─── new chat dialog ─────────────────────────────────────── */

function NewChatDialog({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (userId: number) => void
}) {
  const [query, setQuery] = useState('')
  const { data: usersRes, isFetching } = useUsers(
    query.trim() ? { search: query.trim(), per_page: 10, role: 'client,seller' } : { per_page: 10 }
  )
  const users: Array<{ id: number; name: string; role: string; avatar: string | null }> =
    (usersRes?.data ?? []).filter((u: { role: string }) => u.role !== 'admin')

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>New Conversation</DialogTitle>
        </DialogHeader>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            autoFocus
            placeholder='Search users by name…'
            className='pl-9'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className='max-h-64 overflow-y-auto'>
          {isFetching ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>Searching…</p>
          ) : users.length === 0 ? (
            <p className='py-6 text-center text-sm text-muted-foreground'>No users found.</p>
          ) : (
            users.map((u) => (
              <button
                key={u.id}
                onClick={() => { onSelect(u.id); onClose() }}
                className='flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted'
              >
                <Avatar className='h-9 w-9 shrink-0'>
                  <AvatarImage src={u.avatar ?? undefined} />
                  <AvatarFallback className='text-xs'>{initials(u.name)}</AvatarFallback>
                </Avatar>
                <div className='min-w-0 flex-1'>
                  <p className='truncate text-sm font-medium'>{u.name}</p>
                  <p className='text-xs capitalize text-muted-foreground'>{u.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ─── conversation item ───────────────────────────────────── */

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
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60',
        selected && 'bg-muted'
      )}
    >
      <Avatar className='mt-0.5 h-10 w-10 shrink-0'>
        <AvatarImage src={conv.user.avatar ?? undefined} />
        <AvatarFallback className='text-sm'>{initials(conv.user.name)}</AvatarFallback>
      </Avatar>
      <div className='min-w-0 flex-1 overflow-hidden'>
        <p className='truncate text-sm font-semibold leading-tight'>{conv.user.name}</p>
        {last ? (
          <p className='mt-0.5 truncate text-xs text-muted-foreground'>
            {isFromAdmin ? <span className='text-foreground/60'>You: </span> : null}
            {last.body}
          </p>
        ) : (
          <p className='mt-0.5 text-xs text-muted-foreground'>No messages yet</p>
        )}
      </div>
      {conv.last_message_at && (
        <span className='mt-0.5 shrink-0 text-[11px] text-muted-foreground'>
          {compactTime(conv.last_message_at)}
        </span>
      )}
    </button>
  )
}

/* ─── message bubble ──────────────────────────────────────── */

function MessageBubble({ msg, adminId }: { msg: SupportMessage; adminId: number | undefined }) {
  const isMe = msg.sender_id === adminId

  return (
    <div className={cn('mb-4 flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
      {!isMe && (
        <Avatar className='mt-auto h-7 w-7 shrink-0'>
          <AvatarImage src={msg.sender_avatar ?? undefined} />
          <AvatarFallback className='text-[10px]'>{initials(msg.sender_name)}</AvatarFallback>
        </Avatar>
      )}
      <div className={cn('flex max-w-[68%] flex-col gap-1', isMe ? 'items-end' : 'items-start')}>
        {msg.type === 'image' ? (
          <a href={msg.body} target='_blank' rel='noreferrer'>
            <img
              src={msg.body}
              alt='image'
              className='max-w-[220px] rounded-2xl object-cover'
              style={{ maxHeight: 220 }}
            />
          </a>
        ) : (
          <div
            className={cn(
              'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
              isMe
                ? 'rounded-tr-sm bg-primary text-primary-foreground'
                : 'rounded-tl-sm bg-muted text-foreground'
            )}
          >
            {msg.body}
          </div>
        )}
        <span className='px-1 text-[11px] text-muted-foreground'>
          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
        </span>
      </div>
    </div>
  )
}

/* ─── main ────────────────────────────────────────────────── */

export function Chat() {
  const { user } = useAuthStore()
  const adminId = user?.id

  const { data: conversations = [], isLoading: loadingConvs } = useSupportConversations()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [body, setBody] = useState('')
  const [newChatOpen, setNewChatOpen] = useState(false)

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
    c.user.name.toLowerCase().includes(search.toLowerCase())
  )

  function handleSend() {
    const text = body.trim()
    if (!text || sendMessage.isPending || !selectedId) { return }
    setBody('')
    sendMessage.mutate({ body: text })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !selectedId) { return }
    sendMessage.mutate({ imageFile: file })
    e.target.value = ''
  }

  function handleStartChat(userId: number) {
    startConversation.mutate(userId, {
      onSuccess: (conv) => setSelectedId(conv.id),
    })
  }

  return (
    <>
      <Header fixed>
        <div className='ms-auto flex items-center gap-2'>
          <ThemeSwitch />
        </div>
      </Header>

      <div data-layout='fixed' className='flex h-[calc(100svh-4rem)] overflow-hidden'>

        {/* ── Sidebar ── */}
        <aside
          className={cn(
            'flex h-full flex-col border-r bg-background',
            selectedId ? 'hidden md:flex md:w-72 md:shrink-0' : 'w-full md:w-72 md:shrink-0'
          )}
        >
          {/* Sidebar header */}
          <div className='flex items-center justify-between border-b px-4 py-3'>
            <h2 className='text-base font-semibold'>Messages</h2>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8'
              title='New conversation'
              onClick={() => setNewChatOpen(true)}
            >
              <MessageSquarePlus className='h-4 w-4' />
            </Button>
          </div>

          {/* Search */}
          <div className='border-b px-3 py-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground' />
              <Input
                placeholder='Search…'
                className='h-8 pl-8 text-sm'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className='absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>
          </div>

          {/* Conversation list */}
          <div className='min-h-0 flex-1 overflow-y-auto'>
            {loadingConvs ? (
              <div className='flex h-32 items-center justify-center text-sm text-muted-foreground'>
                Loading…
              </div>
            ) : filtered.length === 0 ? (
              <div className='flex h-32 flex-col items-center justify-center gap-1 text-muted-foreground'>
                <MessagesSquare className='h-8 w-8 opacity-30' />
                <p className='text-xs'>{search ? 'No results' : 'No conversations yet'}</p>
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
          </div>
        </aside>

        {/* ── Chat area ── */}
        {selectedConv ? (
          <div className='flex h-full min-w-0 flex-1 flex-col overflow-hidden'>

            {/* Chat header */}
            <div className='flex shrink-0 items-center gap-3 border-b bg-background px-4 py-3'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 shrink-0 md:hidden'
                onClick={() => setSelectedId(null)}
              >
                <ArrowLeft className='h-4 w-4' />
              </Button>
              <Avatar className='h-9 w-9 shrink-0'>
                <AvatarImage src={selectedConv.user.avatar ?? undefined} />
                <AvatarFallback className='text-sm'>{initials(selectedConv.user.name)}</AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-sm font-semibold leading-tight'>{selectedConv.user.name}</p>
                <p className='text-xs capitalize text-muted-foreground'>{selectedConv.user.role}</p>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className='min-h-0 flex-1'>
              <div className='px-4 py-4'>
                {loadingMsgs ? (
                  <div className='flex h-40 items-center justify-center text-sm text-muted-foreground'>
                    Loading messages…
                  </div>
                ) : messages.length === 0 ? (
                  <div className='flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground'>
                    <MessagesSquare className='h-10 w-10 opacity-20' />
                    <p className='text-sm'>No messages yet — say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} adminId={adminId} />
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            {/* Input bar */}
            <div className='shrink-0 border-t bg-background px-4 py-3'>
              <div className='flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-1.5 focus-within:border-ring focus-within:ring-1 focus-within:ring-ring'>
                <label className='shrink-0 cursor-pointer text-muted-foreground hover:text-foreground'>
                  <ImageIcon className='h-4 w-4' />
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/webp'
                    className='hidden'
                    onChange={handleImageUpload}
                    disabled={sendMessage.isPending || !selectedId}
                  />
                </label>
                <Input
                  placeholder='Type a message…'
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendMessage.isPending}
                  className='h-8 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0'
                />
                <Button
                  size='icon'
                  className='h-7 w-7 shrink-0 rounded-lg'
                  onClick={handleSend}
                  disabled={!body.trim() || sendMessage.isPending}
                >
                  <Send className='h-3.5 w-3.5' />
                </Button>
              </div>
              <p className='mt-1.5 text-center text-[11px] text-muted-foreground'>
                Press <kbd className='rounded border px-1 font-mono text-[10px]'>Enter</kbd> to send
              </p>
            </div>
          </div>
        ) : (
          <div className='hidden h-full flex-1 flex-col items-center justify-center gap-3 text-muted-foreground md:flex'>
            <MessagesSquare className='h-14 w-14 opacity-20' />
            <p className='text-sm'>Select a conversation or start a new one</p>
            <Button variant='outline' size='sm' onClick={() => setNewChatOpen(true)}>
              <MessageSquarePlus className='mr-2 h-4 w-4' />
              New conversation
            </Button>
          </div>
        )}
      </div>

      <NewChatDialog
        open={newChatOpen}
        onClose={() => setNewChatOpen(false)}
        onSelect={handleStartChat}
      />
    </>
  )
}
