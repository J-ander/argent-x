import { FC, useEffect } from "react"
import styled from "styled-components"

import { useLoadingProgress } from "../../app.state"
import { Spinner } from "../../components/Spinner"
import { Greetings } from "../onboarding/Greetings"

const LoadingScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  padding: 48px 32px;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100vh;
`

const loadingTexts = [
  "Loading…",
  "Please wait…",
  "Patience is a virtue…",
  "Almost there…",
]

export const LoadingScreen: FC = () => {
  const { progress, clearProgress } = useLoadingProgress()

  // reset to 'indeterminate' spinner type on unmount
  useEffect(() => () => clearProgress(), [])

  return (
    <LoadingScreenWrapper>
      <Spinner size={92} value={progress} />
      <Greetings greetings={loadingTexts} />
    </LoadingScreenWrapper>
  )
}
