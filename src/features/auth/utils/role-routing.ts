import type { SessionUser, UserRole } from '@/types/models'

export function resolveHomePathForRole(role: UserRole) {
  return role === 'super_admin' ? '/admin' : '/dashboard'
}

export function resolveHomePathForUser(user: SessionUser | null | undefined) {
  return resolveHomePathForRole(user?.role === 'super_admin' ? 'super_admin' : 'store_owner')
}
