interface Props {
  onClick: () => void;
  disabled?: boolean;
}

export function AddRowButton({ onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '6px 14px',
        borderRadius: 6,
        border: '1px solid #4f46e5',
        background: '#4f46e5',
        color: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      + Add Row
    </button>
  );
}
