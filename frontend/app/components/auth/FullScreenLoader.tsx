export function FullScreenLoader() {
  return (
    <main className="page-center">
      <div className="full-screen-loader" role="status">
        <span className="landing-brand">
          <span className="landing-brand-mark" aria-hidden="true">
            T
          </span>
          <span>Tasken</span>
        </span>

        <span className="loader" aria-hidden="true" />
        <span className="sr-only">Tasken загружается</span>
      </div>
    </main>
  );
}
