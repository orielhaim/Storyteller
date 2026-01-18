import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Timeline as VisTimeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';
import './Timeline.module.css';

const DEFAULT_OPTIONS = {
  width: '100%',
  height: '100%',
  stack: false,
  showCurrentTime: true,
  zoomMin: 1000 * 60 * 60 * 24, // 1 day
  zoomMax: 1000 * 60 * 60 * 24 * 365 * 100, // 100 years
  margin: {
    item: 20,
    axis: 5,
  },
  groupHeightMode: 'auto',
  orientation: { axis: 'top', item: 'top' },
  verticalScroll: true,
  xss: { disabled: true },
};

const ZOOM_IN_FACTOR = 0.8;
const ZOOM_OUT_FACTOR = 1.25;


function updateDataSet(dataSet, newData) {
  if (!dataSet) return;

  const currentIds = new Set(dataSet.getIds());
  const newIds = new Set(newData.map((item) => item.id));

  const toRemove = [...currentIds].filter((id) => !newIds.has(id));

  const toUpdate = newData.filter((item) => currentIds.has(item.id));
  const toAdd = newData.filter((item) => !currentIds.has(item.id));

  if (toRemove.length > 0) {
    dataSet.remove(toRemove);
  }
  if (toUpdate.length > 0) {
    dataSet.update(toUpdate);
  }
  if (toAdd.length > 0) {
    dataSet.add(toAdd);
  }
}

const Timeline = forwardRef(function Timeline(
  { items = [], groups = [], options = {}, onSelect, onClick, onDoubleClick, onRangeChanged },
  ref
) {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const itemsDataSetRef = useRef(null);
  const groupsDataSetRef = useRef(null);
  const isInitializedRef = useRef(false);

  const zoom = useCallback((factor) => {
    const timeline = timelineRef.current;
    if (!timeline) return;

    const { start, end } = timeline.getWindow();
    const currentRange = end.getTime() - start.getTime();
    const newRange = currentRange * factor;
    const center = (start.getTime() + end.getTime()) / 2;

    timeline.setWindow(
      new Date(center - newRange / 2),
      new Date(center + newRange / 2),
      { animation: { duration: 300, easingFunction: 'easeInOutQuad' } }
    );
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      fit(animationOptions = true) {
        timelineRef.current?.fit({ animation: animationOptions });
      },

      focus(id, animationOptions = true) {
        timelineRef.current?.focus(id, { animation: animationOptions });
      },

      setWindow(start, end, animationOptions) {
        timelineRef.current?.setWindow(start, end, animationOptions);
      },

      getWindow() {
        return timelineRef.current?.getWindow() ?? null;
      },

      zoomIn() {
        zoom(ZOOM_IN_FACTOR);
      },

      zoomOut() {
        zoom(ZOOM_OUT_FACTOR);
      },

      moveTo(time, animationOptions) {
        timelineRef.current?.moveTo(time, animationOptions);
      },

      getSelection() {
        return timelineRef.current?.getSelection() ?? [];
      },

      setSelection(ids, options) {
        timelineRef.current?.setSelection(ids, options);
      },

      redraw() {
        timelineRef.current?.redraw();
      },

      getVisibleItems() {
        return timelineRef.current?.getVisibleItems() ?? [];
      },

      getInstance() {
        return timelineRef.current;
      },
    }),
    [zoom]
  );


  useEffect(() => {
    const container = containerRef.current;
    if (!container || isInitializedRef.current) return;

    itemsDataSetRef.current = new DataSet(items);
    groupsDataSetRef.current = new DataSet(groups);

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    const timeline = new VisTimeline(
      container,
      itemsDataSetRef.current,
      groupsDataSetRef.current,
      mergedOptions
    );

    timelineRef.current = timeline;
    isInitializedRef.current = true;

    if (onSelect) timeline.on('select', onSelect);
    if (onClick) timeline.on('click', onClick);
    if (onDoubleClick) timeline.on('doubleClick', onDoubleClick);
    if (onRangeChanged) timeline.on('rangechanged', onRangeChanged);

    requestAnimationFrame(() => {
      timeline.redraw();
      if (items.length > 0) {
        timeline.fit({ animation: false });
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) {
        requestAnimationFrame(() => {
          timeline.redraw();
        });
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();

      if (onSelect) timeline.off('select', onSelect);
      if (onClick) timeline.off('click', onClick);
      if (onDoubleClick) timeline.off('doubleClick', onDoubleClick);
      if (onRangeChanged) timeline.off('rangechanged', onRangeChanged);

      timeline.destroy();
      timelineRef.current = null;
      itemsDataSetRef.current = null;
      groupsDataSetRef.current = null;
      isInitializedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isInitializedRef.current || !itemsDataSetRef.current) return;

    updateDataSet(itemsDataSetRef.current, items);
  }, [items]);

  useEffect(() => {
    if (!isInitializedRef.current || !groupsDataSetRef.current) return;

    updateDataSet(groupsDataSetRef.current, groups);
  }, [groups]);

  useEffect(() => {
    if (!isInitializedRef.current || !timelineRef.current) return;

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    timelineRef.current.setOptions(mergedOptions);
  }, [options]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full timeline-container"
      style={{ minHeight: '100%', position: 'relative' }}
    />
  );
});

export default Timeline;