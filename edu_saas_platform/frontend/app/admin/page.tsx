import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  // Automatically redirect /admin -> /admin/dashboard
  redirect('/admin/dashboard')
}