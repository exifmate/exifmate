import classNames from 'classnames';
import { useRef } from 'react';
import {
  mergeProps,
  useFocusRing,
  useGridList,
  useGridListItem,
} from 'react-aria';
import {
  type ListProps,
  type ListState,
  type Node,
  useListState,
} from 'react-stately';

function GridList<T extends object>(props: ListProps<T>) {
  const state = useListState<T>(props);
  const ref = useRef<HTMLUListElement | null>(null);
  const { gridProps } = useGridList(props, state, ref);

  return (
    <ul {...gridProps} ref={ref} className="flex flex-wrap gap-4">
      {[...state.collection].map((item) => (
        <GridItem key={item.key} item={item} state={state} />
      ))}
    </ul>
  );
}

function GridItem<T extends object>({
  item,
  state,
}: {
  item: Node<T>;
  state: ListState<T>;
}) {
  const ref = useRef(null);
  const { rowProps, gridCellProps, isSelected } = useGridListItem(
    { node: item },
    state,
    ref,
  );

  const { isFocusVisible, focusProps } = useFocusRing();

  return (
    <li
      {...mergeProps(rowProps, focusProps)}
      ref={ref}
      className={classNames({
        'outline-primary outline-2 outline-offset-3 rounded-2xl': isSelected,
        ring: isFocusVisible,
      })}
    >
      <div {...gridCellProps}>{item.rendered}</div>
    </li>
  );
}

export default GridList;
