import styled from 'styled-components'

type Props = {
  label: string
  onBlur: (value: string) => void
}

export default function Prompt(props: Props) {
  return (
    <>
      <Blinder />
      <Container>
        <Message>{props.label}</Message>
        <ButtonContainer>
          <Input
            type='text'
            onBlur={(e) => props.onBlur(e.target.value)}
          />
        </ButtonContainer>
      </Container>
    </>
  )
}

const Blinder = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0.5, 0.5, 0.5, 0.5);
`

const Container = styled.div`
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translateX(-50%) translateY(-50%);
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  background-color: #333;
  border-radius: 10px;
`

const Message = styled.div``

const ButtonContainer = styled.div``

const Input = styled.input``
