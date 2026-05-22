import { DoorOpen, FileText, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Sliders, Sparkles } from 'lucide-react';
import { useState } from 'react';

const items = [
  { id: 'order', label: '순서 짜기', icon: LayoutDashboard },
  { id: 'editor', label: 'PPT 만들기', icon: FileText },
  { id: 'personalizer', label: '규격 설정', icon: Sliders },
  { id: 'benchmark', label: 'UX 분석', icon: Sparkles },
];

export default function MenuAgent({ activeView, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`side-menu ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand-block">
        <strong>{collapsed ? '예배' : '예배 PPT 빌더'}</strong>
        <button
          className="icon-button"
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
          title={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
        </button>
      </div>
      <nav className="menu-list">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              className={`menu-button ${activeView === item.id ? 'active' : ''}`}
              type="button"
              key={item.id}
              onClick={() => onNavigate(item.id)}
              title={item.label}
            >
              <Icon size={21} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
        <button className="menu-button disabled" type="button" disabled title="준비중">
          <Sparkles size={21} />
          {!collapsed && <span>악보 편집</span>}
        </button>
      </nav>
      <button className="menu-button exit" type="button">
        <DoorOpen size={21} />
        {!collapsed && <span>나가기</span>}
      </button>
    </aside>
  );
}
