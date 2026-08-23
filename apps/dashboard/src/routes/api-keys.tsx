import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/api-keys')({
  component: () => <div>API Keys</div>
})
