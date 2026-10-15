import WorkspaceEmptyState from "../components/WorkspaceEmptyState";

export default function Watchlist() {
  return (
    <WorkspaceEmptyState
      eyebrow="Saved opportunities"
      title="Keep the businesses you’re interested in close."
      description="A personal saved-opportunities list isn’t available yet. You can still browse published businesses and open each opportunity to review its details."
      actionTo="/browse"
      actionLabel="Browse businesses"
      symbol="☆"
    />
  );
}
