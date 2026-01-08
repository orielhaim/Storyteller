import { useRef, useImperativeHandle, forwardRef } from 'react';
import { DockviewReact } from 'dockview-react';
import 'dockview-react/dist/styles/dockview.css';
import { Book, Folder, FileText, X } from 'lucide-react';

const CustomTab = ({ api, params }) => {
  const getIcon = (type) => {
    const typeToCheck = params?.iconType || params?.component;
    
    switch (typeToCheck) {
      case 'chapters':
        return <Book className="h-3 w-3 mr-1" />;
      case 'scenes':
        return <Folder className="h-3 w-3 mr-1" />;
      case 'scene-editor':
        return <FileText className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const onClose = (e) => {
    e.stopPropagation();
    api.close();
  };

  return (
    <div className="dockview-react-tab" style={{ display: 'flex', alignItems: 'center', padding: '0 0', height: '100%', width: '100%' }}>
      {getIcon(params)}
      <span className="truncate" style={{ flex: 1 }}>{api.title}</span>
      <button
        className="ml-2 hover:bg-red-500/20 rounded p-0.5"
        onClick={onClose}
        style={{ display: 'flex', alignItems: 'center', border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

const DockviewManager = forwardRef(({ components = {}, onReady: onReadyCallback, onPanelRemoved }, ref) => {
  const apiRef = useRef(null);

  useImperativeHandle(ref, () => ({
    addPanel: (id, componentName, params = {}) => {
      if (!apiRef.current) return null;

      const existingPanel = apiRef.current.getPanel(id);
      if (existingPanel) {
        existingPanel.api.setActive();
        return existingPanel;
      }

      const panel = apiRef.current.addPanel({
        id,
        component: componentName,
        params: {
          ...params,
          component: componentName, 
          iconType: componentName
        },
        title: params.title || componentName,
        tabComponent: 'customTab', 
      });

      return panel;
    },
    removePanel: (id) => {
      if (!apiRef.current) return;
      const panel = apiRef.current.getPanel(id);
      if (panel && apiRef.current.panels.length > 1) {
        panel.api.close();
      }
    },
    getPanel: (id) => {
      return apiRef.current?.getPanel(id) || null;
    },
    getAllPanels: () => {
      return apiRef.current?.panels || [];
    },
    hasPanels: () => {
      return (apiRef.current?.panels.length || 0) > 0;
    },
  }));

  const handleReady = (event) => {
    apiRef.current = event.api;
    
    event.api.onDidRemovePanel(() => {
      if (onPanelRemoved && apiRef.current) {
        onPanelRemoved(apiRef.current.panels.length);
      }
    });
    
    if (onReadyCallback) {
      onReadyCallback(event.api);
    }
  };

  return (
    <DockviewReact
      onReady={handleReady}
      components={components}
      className="dockview-theme-replit"
      tabComponents={{
        customTab: CustomTab,
      }}
    />
  );
});

DockviewManager.displayName = 'DockviewManager';

export default DockviewManager;