
function Button({ label, onClick, ...rest }) {

  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  }

  return (
    <>
      <button {...rest} onClick={handleClick}>
        {label}
      </button>
    </>
  )
}

export default Input
