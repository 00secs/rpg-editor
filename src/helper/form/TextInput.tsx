import {useCallback, useEffect, useState} from 'react'
import styled from 'styled-components'

type Props = {
  value: string
  onChange: (n: string) => boolean
}

/**
 * 入力フォーム。
 */
export default function TextInput(props: Props) {
  const [value, setValue] = useState(props.value)
  const [lastValue, setLastValue] = useState(props.value)

  const onBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!props.onChange(event.target.value)) {
        // TODO: 警告出すか？
        setValue(lastValue)
        return
      }
      setValue(event.target.value)
      setLastValue(event.target.value)
    },
    [props.onChange, lastValue]
  )

  useEffect(() => {
    setValue(props.value)
    setLastValue(props.value)
  }, [props.value])

  return (
    <Input
      type='text'
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onBlur={onBlur}
    />
  )
}

const Input = styled.input`
  width: 100%;
  color: #d4d4d4;
  background-color: #333;
  text-align: right;
  outline: none;
`
