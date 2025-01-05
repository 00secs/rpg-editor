import {createContext, ReactNode, useCallback, useContext, useState} from 'react'
import styled from 'styled-components'

type DialogContextType = {
  isOpen: boolean
  message: string
  openDialog: (message: string) => void
}
const DialogContext = createContext<DialogContextType>({
  isOpen: false,
  message: '',
  openDialog: (_) => {},
})
export const useDialog = () => useContext(DialogContext)

type Props = {
  children: ReactNode
}

export default function DialogProvider(props: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')

  const openDialog = useCallback(
    (message: string) => {
      setMessage(message)
      setIsOpen(true)
    },
    [setIsOpen, setMessage]
  )

  return (
    <DialogContext.Provider value={{isOpen, message, openDialog}}>
      {props.children}
      {isOpen && (
        <Dialog
          message={message}
          onClose={() => setIsOpen(false)}
        />
      )}
    </DialogContext.Provider>
  )
}

type DialogProps = {
  message: string
  onClose: () => void
}

function Dialog(props: DialogProps) {
  return (
    <>
      <Blinder />
      <Container>
        <Message>{props.message}</Message>
        <ButtonContainer>
          <Button onClick={props.onClose}>OK</Button>
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

const Button = styled.button``
