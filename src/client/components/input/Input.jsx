
function Input({ label, onChange, ...rest }) {

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <>
      <div>
        <label className="text-sm">{label}</label>
      </div>
      <div>
        <input className="border border-grey rounded-md p-1" {...rest} onChange={handleChange}></input>
      </div>
    </>
  )
}

export default Input
