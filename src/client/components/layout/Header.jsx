import { Link } from "react-router-dom"

import styled from "styled-components"
const Ul = styled.ul`
  display: flex
`

const Li = styled.li`
  list-style-type: none;
`

function Header() {

  return (
    <>
      <div>Open Tools</div>
      <ul>
        <Li><Link to="gcf">GCF</Link></Li>
        <Li><Link to="imageConverter">Image Converter</Link></Li>
      </ul>
    </>
  )
}

export default Header
