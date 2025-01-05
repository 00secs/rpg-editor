import {useCallback, useEffect, useState} from 'react'
import styled from 'styled-components'

type Props = {
  allowDecimal: boolean
  min: number
  max: number
  value: number
  onChange: (n: number) => boolean
}

/**
 * 数値入力フォーム。
 */
export default function NumberInput(props: Props) {
  const [value, setValue] = useState(props.value.toString())
  const [lastValue, setLastValue] = useState(props.value.toString())

  const onBlur = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const n = Number(event.target.value)
      if (
        isNaN(n) ||
        n < props.min ||
        n > props.max ||
        !(props.allowDecimal || Number.isInteger(n))
      ) {
        // TODO: 警告出すか？
        setValue(lastValue)
        return
      }
      if (!props.onChange(n)) {
        // TODO: 警告出すか？
        setValue(lastValue)
        return
      }
      setValue(n.toString())
      setLastValue(n.toString())
    },
    [props.allowDecimal, props.min, props.max, props.onChange, lastValue]
  )

  useEffect(() => {
    setValue(props.value.toString())
    setLastValue(props.value.toString())
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
