
function Input({ label, onChange, ...rest }) {

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <>
      <div>
        <label>{label}</label>
      </div>
      <div>
        <input {...rest} onChange={handleChange}></input>
      </div>
    </>
  )
}

export default Input
