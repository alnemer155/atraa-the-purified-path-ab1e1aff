import { Fragment } from 'react';
import { splitPbuh } from '@/lib/islamic-symbols';
import PeaceBeUponHim from './PeaceBeUponHim';

interface Props {
  children: string;
  className?: string;
  iconSize?: number;
  as?: 'span' | 'p' | 'div';
}

/**
 * Renders text but auto-replaces phrases like "عليه السلام" with the
 * dedicated icon. Use this anywhere a name of an Imam or Prophet appears.
 */
const SmartText = ({ children, className, iconSize = 14, as: Tag = 'span' }: Props) => {
  const parts = splitPbuh(children);
  return (
    <Tag className={className}>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {p.type === 'text' ? p.value : <PeaceBeUponHim size={iconSize} />}
        </Fragment>
      ))}
    </Tag>
  );
};

export default SmartText;
