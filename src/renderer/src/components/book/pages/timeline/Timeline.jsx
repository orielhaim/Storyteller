import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Timeline as VisTimeline, DataSet } from 'vis-timeline/standalone';
import 'vis-timeline/styles/vis-timeline-graph2d.min.css';

const customStyles = `
  .vis-timeline .vis-label.vis-nested-group .vis-inner {
    padding-left: 0 !important;
    text-align: left !important;
  }
  
  .vis-timeline .vis-label.vis-nested-group {
    background-color: transparent !important;
    border-bottom: 1px solid #e5e7eb !important;
  }

  .vis-role-group {
    background-color: #f9fafb !important;
  }

  .vis-role-group .vis-inner {
    width: 100% !important;
    display: block !important;
  }

  .role-group-header {
    width: 100%;
    display: flex;
    align-items: center;
  }
  
  .vis-character-group {
    background-color: white !important;
  }
  
  .vis-sitemap {
     display: none !important;
  }
`;

const Timeline = forwardRef(({ items = [], groups = [], options = {} }, ref) => {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const itemsDataSetRef = useRef(null);
  const groupsDataSetRef = useRef(null);

  useImperativeHandle(ref, () => ({
    fit: () => {
      if (timelineRef.current) {
        timelineRef.current.fit();
      }
    },
    focus: (id) => {
      if (timelineRef.current) {
        timelineRef.current.focus(id);
      }
    },
    setWindow: (start, end) => {
      if (timelineRef.current) {
        timelineRef.current.setWindow(start, end);
      }
    },
    zoomIn: () => {
      if (timelineRef.current) {
        const range = timelineRef.current.getWindow();
        const zoom = (range.end - range.start) * 0.8;
        const center = (range.start.getTime() + range.end.getTime()) / 2;
        timelineRef.current.setWindow(
          new Date(center - zoom / 2),
          new Date(center + zoom / 2)
        );
      }
    },
    zoomOut: () => {
      if (timelineRef.current) {
        const range = timelineRef.current.getWindow();
        const zoom = (range.end - range.start) * 1.25;
        const center = (range.start.getTime() + range.end.getTime()) / 2;
        timelineRef.current.setWindow(
          new Date(center - zoom / 2),
          new Date(center + zoom / 2)
        );
      }
    },
  }));

  useEffect(() => {
    const styleId = 'vis-timeline-custom-styles';
    const oldStyle = document.getElementById(styleId);
    if (oldStyle) oldStyle.remove();

    const style = document.createElement('style');
    style.id = styleId;
    style.innerHTML = customStyles;
    document.head.appendChild(style);

    return () => {
      const s = document.getElementById(styleId);
      if (s) s.remove();
    };
  }, []);

  useEffect(() => {
    let timeline = timelineRef.current;
    let resizeObserver = null;

    if (containerRef.current && !timeline) {
      itemsDataSetRef.current = new DataSet(items);
      groupsDataSetRef.current = new DataSet(groups);

      const defaultOptions = {
        width: '100%',
        height: '100%',
        stack: false,
        showCurrentTime: true,
        zoomMin: 1000 * 60 * 60 * 24,
        zoomMax: 1000 * 60 * 60 * 24 * 365 * 100,
        margin: {
          item: 20,
          axis: 5
        },
        groupHeightMode: 'auto',
        orientation: { axis: 'top', item: 'top' },
        verticalScroll: true,
        xss: { disabled: true },
        ...options,
      };

      timeline = new VisTimeline(
        containerRef.current,
        itemsDataSetRef.current,
        groupsDataSetRef.current,
        defaultOptions
      );
      timelineRef.current = timeline;

      requestAnimationFrame(() => {
        timeline.redraw();
        if (items.length > 0) timeline.fit();
      });

      resizeObserver = new ResizeObserver(() => {
        if (timeline) {
          timeline.redraw();
        }
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (timelineRef.current) {
        timelineRef.current.destroy();
        timelineRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (itemsDataSetRef.current && timelineRef.current) {
      itemsDataSetRef.current.clear();
      itemsDataSetRef.current.add(items);
      timelineRef.current.redraw();
    }
  }, [items]);

  useEffect(() => {
    if (groupsDataSetRef.current && timelineRef.current) {
      groupsDataSetRef.current.clear();
      groupsDataSetRef.current.add(groups);
      timelineRef.current.redraw();
    }
  }, [groups]);

  useEffect(() => {
    if (timelineRef.current && options) {
      timelineRef.current.setOptions(options);
    }
  }, [options]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full timeline-container"
      style={{ minHeight: '100%', position: 'relative' }}
    />
  );
});

Timeline.displayName = 'Timeline';

export default Timeline;