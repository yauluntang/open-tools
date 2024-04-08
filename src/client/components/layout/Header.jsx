import { Link } from "react-router-dom"
import logo from "../../assets/logo-min.png"
import styled from "styled-components"
const Ul = styled.ul`
  display: flex
`

const Li = styled.li`
  list-style-type: none;
  margin: 20px;
  color: white;
`

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;
`

function Header() {

  return (
    <>
      <div className={`bg-blue-950`}>
        <div className={`flex content-center items-center`} style={{ height: '50px', display: 'flex' }}>
          <img style={{ height: '50px' }} src={logo} />
          <Link to="/">
            <div className={`text-white mr-10`}>opentool.me</div>
          </Link>
          <ul className={`flex content-center items-center`} style={{ height: '50px', display: 'flex' }}>
            <Li><StyledLink to="gcf">GCF</StyledLink></Li>
            <Li><StyledLink to="image-converter">Image Converter</StyledLink></Li>
          </ul>
        </div>
      </div>
    </>
  )
}

export default Header
