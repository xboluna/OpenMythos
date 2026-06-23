export function Footer() {
  return (
    <footer className="w-full border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-muted-foreground">
        <p>
          OpenMythos Visualizer — an interactive guide to the Recurrent-Depth
          Transformer architecture.
        </p>
        <p className="mt-2">
          <a
            href="https://github.com/xboluna/OpenMythos"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            github.com/xboluna/OpenMythos
          </a>
        </p>
        <p className="mt-2 text-xs">
          Interactive simulations — values are computed client-side from the
          model&apos;s formulas, not measured from a trained checkpoint.
        </p>
      </div>
    </footer>
  );
}
