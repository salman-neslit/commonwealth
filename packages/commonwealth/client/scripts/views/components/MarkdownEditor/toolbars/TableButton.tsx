import { insertTable$, usePublisher } from 'commonwealth-mdxeditor';
import React, { useCallback } from 'react';
import CWIconButton from 'views/components/component_kit/new_designs/CWIconButton';
import { CWTooltip } from 'views/components/component_kit/new_designs/CWTooltip';
import './HeadingButton.scss';

export type TableButtonProps = Readonly<{
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}>;

export const TableButton = (props: TableButtonProps) => {
  const { onClick } = props;
  const insertTable = usePublisher(insertTable$);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      insertTable({ rows: 3, columns: 3 });
      onClick?.(event);
    },
    [onClick, insertTable],
  );

  return (
    <CWTooltip
      content="Create table"
      renderTrigger={(handleInteraction) => (
        <CWIconButton
          buttonSize="lg"
          iconName="table"
          onMouseEnter={handleInteraction}
          onMouseLeave={handleInteraction}
          onClick={handleClick}
        />
      )}
    />
  );
};