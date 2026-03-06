const MultiSelectCheckbox: React.FC<{ checked: boolean; onChange: () => void; style?: React.CSSProperties }> = ({ 
  checked, 
  onChange,
  style 
}) => (
  <input 
    type="checkbox" 
    checked={checked} 
    onChange={onChange}
    style={{ 
      width: '14px', 
      height: '14px',
      accentColor: '#0078d4',
      ...style 
    }} 
  />
);

export default MultiSelectCheckbox;