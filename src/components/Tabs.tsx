import type { TabListState, TabListStateOptions } from '@react-stately/tabs';
import { useRef } from 'react';
import {
  type AriaTabPanelProps,
  useTab,
  useTabList,
  useTabPanel,
} from 'react-aria';
import { type Node, useTabListState } from 'react-stately';

function Tabs<T extends object>(props: TabListStateOptions<T>) {
  const state = useTabListState(props);
  const ref = useRef(null);
  const { tabListProps } = useTabList(props, state, ref);

  return (
    <>
      <div
        {...tabListProps}
        ref={ref}
        className="tabs tabs-lift bg-base-200 px-2 pt-2"
      >
        {[...state.collection].map((item) => (
          <Tab key={item.key} item={item} state={state} />
        ))}
      </div>
      <TabPanel key={state.selectedItem?.key} state={state} />
    </>
  );
}

interface TabProps<T> {
  item: Node<T>;
  state: TabListState<T>;
}

function Tab<T>({ item, state }: TabProps<T>) {
  const { key, rendered } = item;
  const ref = useRef(null);
  const { tabProps } = useTab({ key }, state, ref);

  return (
    <div {...tabProps} ref={ref} className="tab">
      {rendered}
    </div>
  );
}

interface TabPanelProps<T> extends AriaTabPanelProps {
  state: TabListState<T>;
}

function TabPanel<T>({ state, ...props }: TabPanelProps<T>) {
  const ref = useRef(null);
  const { tabPanelProps } = useTabPanel(props, state, ref);

  return (
    <div
      {...tabPanelProps}
      ref={ref}
      className="px-2 pb-3 grow h-full overflow-auto"
    >
      {state.selectedItem?.props.children}
    </div>
  );
}

export default Tabs;
