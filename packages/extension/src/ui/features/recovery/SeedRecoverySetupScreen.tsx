import { FC } from "react"
import { useNavigate } from "react-router-dom"

import { IconBar } from "../../components/IconBar"
import { Paragraph } from "../../components/Page"
import { routes } from "../../routes"
import { ConfirmScreen } from "../actions/ConfirmScreen"
import { SeedPhrase } from "./SeedPhrase"
import { useSeedPhrase } from "./useSeedPhrase"

export const SeedRecoverySetupScreen: FC = () => {
  const navigate = useNavigate()
  const seedPhrase = useSeedPhrase()

  return (
    <>
      <IconBar back close />
      <ConfirmScreen
        smallTopPadding
        title="Recovery phrase"
        singleButton
        confirmButtonText="Continue"
        confirmButtonDisabled={!seedPhrase}
        onSubmit={() => navigate(routes.confirmSeedRecovery())}
      >
        <Paragraph>
          Write these words down on paper. It is unsafe to save them on your
          computer.
        </Paragraph>

        <SeedPhrase seedPhrase={seedPhrase} />
      </ConfirmScreen>
    </>
  )
}
