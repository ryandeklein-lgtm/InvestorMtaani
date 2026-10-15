import WorkspaceEmptyState from "../components/WorkspaceEmptyState";

export default function Portfolio() {
  return (
    <WorkspaceEmptyState
      eyebrow="Portfolio overview"
      title="Your portfolio activity will appear here."
      description="Investor Mtaani helps businesses and investors discover one another; investment agreements are handled directly between the parties. Portfolio tracking isn’t available yet."
      actionTo="/matchmaking"
      actionLabel="Review introductions"
      symbol="▥"
    />
  );
}
