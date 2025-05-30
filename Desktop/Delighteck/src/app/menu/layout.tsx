import MenuLayoutClient from './MenuLayoutClient'

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <MenuLayoutClient>{children}</MenuLayoutClient>
} 