/**
 * Reusable icon for "عليه السلام" — replaces the textual phrase
 * with a small inline image, as a visual seal of respect.
 */
interface Props {
  className?: string;
  size?: number;
}

const PeaceBeUponHim = ({ className = '', size = 14 }: Props) => (
  <img
    src="https://i.ibb.co/23DQN2WC/phonto.png"
    alt="عليه السلام"
    aria-label="عليه السلام"
    className={`inline-block align-middle mx-0.5 select-none ${className}`}
    style={{ height: size, width: 'auto' }}
    draggable={false}
  />
);

export default PeaceBeUponHim;
