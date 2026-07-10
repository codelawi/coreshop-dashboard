import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useUpdateUser, useAdminChangeUserPassword } from '@/hooks/api/use-users'
import { useAdminUpload } from '@/hooks/api/use-admin-upload'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { roles } from '../data/data'
import { type User } from '../data/schema'

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required.'),
  email: z.email({ error: () => 'Valid email is required.' }),
  phone: z.string().optional(),
  city: z.string().optional(),
  role: z.string().min(1, 'Role is required.'),
})

const passwordSchema = z
  .object({
    password: z.string().min(8, 'Minimum 8 characters.'),
    password_confirmation: z.string().min(1, 'Confirm the password.'),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match.',
    path: ['password_confirmation'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

type UserActionDialogProps = {
  currentRow: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const updateUser = useUpdateUser()
  const changePassword = useAdminChangeUserPassword()
  const upload = useAdminUpload()
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentRow.avatar ?? null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentRow.name,
      email: currentRow.email,
      phone: currentRow.phone ?? '',
      city: currentRow.city ?? '',
      role: currentRow.role,
    },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  useEffect(() => {
    if (open) {
      setAvatarUrl(currentRow.avatar ?? null)
      profileForm.reset({
        name: currentRow.name,
        email: currentRow.email,
        phone: currentRow.phone ?? '',
        city: currentRow.city ?? '',
        role: currentRow.role,
      })
      passwordForm.reset({ password: '', password_confirmation: '' })
    }
  }, [open, currentRow, profileForm, passwordForm])

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    upload.mutate(
      { file, folder: 'avatars' },
      {
        onSuccess: (data) => {
          const url: string = data.data.url
          setAvatarUrl(url)
          updateUser.mutate(
            { id: currentRow.id, data: { avatar: url } },
            {
              onSuccess: () => toast.success('Avatar updated.'),
              onError: () => toast.error('Failed to save avatar.'),
            }
          )
        },
        onError: () => toast.error('Avatar upload failed.'),
        onSettled: () => {
          setUploadingAvatar(false)
          e.target.value = ''
        },
      }
    )
  }

  const onProfileSubmit = (values: ProfileForm) => {
    updateUser.mutate(
      {
        id: currentRow.id,
        data: {
          name: values.name,
          email: values.email,
          role: values.role,
          phone: values.phone || null,
          city: values.city || null,
        },
      },
      {
        onSuccess: () => {
          toast.success(`${values.name}'s account has been updated.`)
          onOpenChange(false)
        },
        onError: () => toast.error('Failed to update account.'),
      }
    )
  }

  const onPasswordSubmit = (values: PasswordForm) => {
    changePassword.mutate(
      {
        id: currentRow.id,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onSuccess: () => {
          toast.success('Password updated successfully.')
          passwordForm.reset()
          onOpenChange(false)
        },
        onError: () => toast.error('Failed to update password.'),
      }
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        profileForm.reset()
        passwordForm.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
          <DialogDescription>
            Update {currentRow.name}'s profile, credentials, or avatar.
          </DialogDescription>
        </DialogHeader>

        {/* Avatar section */}
        <div className='flex items-center gap-4 py-2'>
          <div className='relative'>
            <Avatar className='h-16 w-16'>
              <AvatarImage src={avatarUrl ?? undefined} alt={currentRow.name} />
              <AvatarFallback className='text-lg font-semibold'>
                {getInitials(currentRow.name)}
              </AvatarFallback>
            </Avatar>
            <button
              type='button'
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className='absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-primary text-primary-foreground shadow hover:bg-primary/90'
            >
              {uploadingAvatar ? (
                <Loader2 className='h-3 w-3 animate-spin' />
              ) : (
                <Camera className='h-3 w-3' />
              )}
            </button>
            <input
              ref={avatarInputRef}
              type='file'
              accept='image/*'
              className='hidden'
              onChange={handleAvatarUpload}
            />
          </div>
          <div>
            <p className='text-sm font-medium'>{currentRow.name}</p>
            <p className='text-xs text-muted-foreground capitalize'>{currentRow.role}</p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue='profile'>
          <TabsList className='w-full'>
            <TabsTrigger value='profile' className='flex-1'>Profile</TabsTrigger>
            <TabsTrigger value='password' className='flex-1'>Password</TabsTrigger>
          </TabsList>

          <TabsContent value='profile'>
            <Form {...profileForm}>
              <form
                id='user-profile-form'
                onSubmit={profileForm.handleSubmit(onProfileSubmit)}
                className='space-y-3 py-2'
              >
                <div className='grid grid-cols-2 gap-3'>
                  <FormField
                    control={profileForm.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder='Full name' autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder='email@example.com' autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input placeholder='+962...' autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='city'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder='Amman' autoComplete='off' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={profileForm.control}
                    name='role'
                    render={({ field }) => (
                      <FormItem className='col-span-2'>
                        <FormLabel>Role</FormLabel>
                        <SelectDropdown
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                          placeholder='Select a role'
                          items={roles.map(({ label, value }) => ({ label, value }))}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
            <DialogFooter className='mt-4'>
              <Button
                type='submit'
                form='user-profile-form'
                disabled={updateUser.isPending}
              >
                {updateUser.isPending && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
                Save changes
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value='password'>
            <Form {...passwordForm}>
              <form
                id='user-password-form'
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className='space-y-3 py-2'
              >
                <FormField
                  control={passwordForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='Minimum 8 characters' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name='password_confirmation'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput placeholder='Re-enter password' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
            <DialogFooter className='mt-4'>
              <Button
                type='submit'
                form='user-password-form'
                disabled={changePassword.isPending}
              >
                {changePassword.isPending && <Loader2 className='me-2 h-4 w-4 animate-spin' />}
                Update Password
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
