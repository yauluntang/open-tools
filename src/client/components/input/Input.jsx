
function Input({ label, onChange, ...rest }) {

  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <>
      <div className="w-100">
        <label className="text-sm">{label}</label>
      </div>
      <div className="w-100">
        <input style={{ width: '100%' }} className="w-100 border border-grey rounded-md p-1" {...rest} onChange={handleChange}></input>
      </div>
    </>
  )
}

export default Input
