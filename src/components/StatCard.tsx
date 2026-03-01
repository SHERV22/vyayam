import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  helper?: string
  action?: ReactNode
}

export const StatCard = ({ title, value, helper, action }: StatCardProps) => (
  <section className="card stat-card">
    <p className="stat-label">{title}</p>
    <h3 className="stat-value">{value}</h3>
    {helper ? <p className="muted">{helper}</p> : null}
    {action ? <div className="stat-action">{action}</div> : null}
  </section>
)
