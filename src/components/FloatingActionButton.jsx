export default function FloatingActionButton({ tone = 'primary', children, ...props }) {
  return (
    <button className={`floating-action ${tone}`} type="button" {...props}>
      {children}
    </button>
  );
}
