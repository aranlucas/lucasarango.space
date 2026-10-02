/** A ruled line feeding across the top of the viewport as you read. */
export function ReadingProgress() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-50 reading-progress print:hidden"
    >
      <span />
    </div>
  );
}
