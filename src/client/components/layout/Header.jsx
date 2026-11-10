import { Link, useLocation } from "react-router-dom"
import logo from "../../assets/opentool-icon.png"
import styled from "styled-components"
import { AppRoutes } from "../../App"

const Ul = styled.ul`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  min-width: 0;
  overflow-x: auto;
`

const Li = styled.li`
  list-style-type: none;
  margin: 0 10px;
  color: white;
  flex-shrink: 0;
`

const StyledLink = styled(Link)`
  color: white;
  text-decoration: underline;
`

const Bar = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  gap: 12px;
`

const Mark = styled.a`
  display: grid;
  place-items: center;
  flex-shrink: 0;
  z-index: 1;

  img {
    display: block;
    width: 36px;
    height: 36px;
    object-fit: contain;
  }
`

const Title = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: 700;
  font-size: 18px;
  pointer-events: none;
`

function Header() {
  let location = useLocation();

  return (
    <>{!location.pathname.startsWith('/game') &&
      <div className={`bg-blue-950`}>
        <Bar>
          <Mark href="https://opentool.us/" title="Open Tool">
            <img src={logo} alt="Open Tool" />
          </Mark>
          <Title>Tools</Title>
          <Ul>
            {AppRoutes.map((route, index) => <Li key={index}><StyledLink to={route.path}>{route.name}</StyledLink></Li>)}
          </Ul>
        </Bar>
      </div>}
    </>
  )
}

export default Header
