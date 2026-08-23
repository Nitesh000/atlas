import { createFileRoute } from '@tanstack/react-router'
export const Route = createFileRoute('/websites')({
  component: () => <div>Websites</div>
})
