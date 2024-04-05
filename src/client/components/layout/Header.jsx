import { Link } from "react-router-dom"

function Header() {

  return (
    <>
      <div>Header</div>
      <ul>
        <li><Link to="gcf">GCF</Link></li>
        <li><Link to="imageConverter">Image Converter</Link></li>
      </ul>
    </>
  )
}

export default Header
