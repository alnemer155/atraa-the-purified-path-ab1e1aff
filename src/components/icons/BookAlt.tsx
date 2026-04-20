/**
 * BookAlt — Flaticon-style "fi-rr-book-alt" inspired icon (open book with pages).
 * Pure SVG, inherits stroke color, matches lucide visual weight.
 */
interface Props {
  className?: string;
  strokeWidth?: number;
}

const BookAlt = ({ className = 'w-[19px] h-[19px]', strokeWidth = 1.5 }: Props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {/* Spine */}
    <path d="M12 5.5v15" />
    {/* Left page */}
    <path d="M3 4.75A1.75 1.75 0 0 1 4.75 3h4.5A2.75 2.75 0 0 1 12 5.75v14.5a1.75 1.75 0 0 0-1.75-1.75H3V4.75z" />
    {/* Right page */}
    <path d="M21 4.75A1.75 1.75 0 0 0 19.25 3h-4.5A2.75 2.75 0 0 0 12 5.75v14.5a1.75 1.75 0 0 1 1.75-1.75H21V4.75z" />
    {/* Page lines (subtle) */}
    <path d="M5.75 7.5h3.5M5.75 10.5h3.5M14.75 7.5h3.5M14.75 10.5h3.5" opacity="0.55" />
  </svg>
);

export default BookAlt;
