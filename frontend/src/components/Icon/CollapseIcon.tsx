const CollapseIcon = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 16 16" 
    fill="currentColor"
    style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <path d="M5.7 13.7L5 13l4.6-4.6L5 3.7l.7-.7 5.3 5.4-5.3 5.3z"/>
  </svg>
);

export default CollapseIcon;