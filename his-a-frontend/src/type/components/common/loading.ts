type ILoadingVariants = {
  /**
   * `page` - Full viewport loading (auth checks, initial page loads)
   * `section` - Contained section loading (card content, panels)
   * `inline` - Small inline loading (buttons, text areas)
   * `overlay` - Semi-transparent overlay on existing content
   */
  variant: 'page' | 'section' | 'inline' | 'overlay'
  /** Spinner size */
  size: 'sm' | 'md' | 'lg'
}

interface ILoadingProps extends Partial<ILoadingVariants> {
  /** Optional message displayed below the spinner */
  message?: string
  className?: string
}

export type { ILoadingProps, ILoadingVariants }
