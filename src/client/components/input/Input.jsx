
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
        <input className="border border-grey rounded-md p-4" {...rest} onChange={handleChange}></input>
      </div>
    </>
  )
}

export default Input
