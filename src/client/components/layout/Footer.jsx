import { Link, useLocation } from "react-router-dom"

function Footer() {
  let location = useLocation();

  return (
    <>{!location.pathname.startsWith('/game') &&
      <div className="text-center">
        <div>All uploaded data is deleted after 1 hour.</div>

        <div>© opentool.me | <Link to="/privacy">Terms and Privacy </Link></div>
      </div>}
    </>
  )
}

export default Footer
