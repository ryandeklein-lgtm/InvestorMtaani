import WorkspaceEmptyState from "../components/WorkspaceEmptyState";

export default function Messages() {
  return (
    <WorkspaceEmptyState
      eyebrow="Conversations"
      title="Secure messaging is not available yet."
      description="Introduction requests are reviewed through the platform, and contact details remain private while a request is pending. You can check your introduction requests and their status here."
      actionTo="/matchmaking"
      actionLabel="View introductions"
      symbol="↗"
    />
  );
}
