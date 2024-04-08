import { Link } from "react-router-dom"

function Footer() {

  return (
    <>
      <div className="text-center">
        <div>All uploaded data is deleted after 1 hour.</div>

        <div>© yaulun.tang@gmail.com | <Link to="/privacy">Terms and Privacy </Link></div>
      </div>
    </>
  )
}

export default Footer
