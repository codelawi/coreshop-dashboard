import { ContentSection } from '../components/content-section'
import { AccountForm } from './account-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='Change Password'
      desc='Update your password to keep your account secure.'
    >
      <AccountForm />
    </ContentSection>
  )
}
