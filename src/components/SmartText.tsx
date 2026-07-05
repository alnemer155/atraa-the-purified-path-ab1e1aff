interface Props {
  children: string;
  className?: string;
  iconSize?: number;
  as?: 'span' | 'p' | 'div';
}

/**
 * Previously replaced "عليه السلام" with an icon; the icon has been
 * removed permanently, so this now renders the text verbatim.
 */
const SmartText = ({ children, className, as: Tag = 'span' }: Props) => (
  <Tag className={className}>{children}</Tag>
);

export default SmartText;
