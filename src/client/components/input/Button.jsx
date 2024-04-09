import styled from "styled-components";

const typeColor = {
  'submit': 'green',
  'danger': 'red'
}

const StyledButton = styled.button`
  background: ${props => typeColor[props.type] || 'green'};
  color: white;
  border-radius: ${props => props.size === 'large' ? '10px' : '4px'};
  font-size: ${props => props.size === 'large' ? '15px' : '10px'};
  padding: ${props => props.size === 'large' ? '8px 16px' : '2px 10px'};
`

function Button({ label, size, children, onClick, ...rest }) {

  const handleClick = (e) => {
    e.preventDefault();
    onClick();
  }

  return (
    <>
      <StyledButton size={size} {...rest} onClick={handleClick}>
        {children}
      </StyledButton>
    </>
  )
}

export default Button
