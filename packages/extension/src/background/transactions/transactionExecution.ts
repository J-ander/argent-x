import { constants, number } from "starknet"

import { TransactionActionPayload } from "../../shared/actionQueue"
import { ExtQueueItem } from "../actionQueue"
import { BackgroundService } from "../background"
import { getNonce, increaseStoredNonce } from "../nonce"
import { nameTransaction } from "../transactions/transactionNames"

export const checkTransactionHash = (
  transactionHash?: number.BigNumberish,
): boolean => {
  try {
    if (!transactionHash) {
      throw Error("transactionHash not defined")
    }
    const bn = number.toBN(transactionHash)
    if (bn.lte(constants.ZERO)) {
      throw Error("transactionHash needs to be >0")
    }
    return true
  } catch {
    return false
  }
}

type TransactionAction = ExtQueueItem<{
  type: "TRANSACTION"
  payload: TransactionActionPayload
}>

export const executeTransaction = async (
  action: TransactionAction,
  { wallet, transactionTracker }: BackgroundService,
) => {
  const { transactions, abis, transactionsDetail } = action.payload
  if (!wallet.isSessionOpen()) {
    throw Error("you need an open session")
  }
  const selectedAccount = await wallet.getSelectedAccount()
  const starknetAccount = await wallet.getSelectedStarknetAccount()
  if (!selectedAccount) {
    throw Error("no accounts")
  }

  // if nonce doesnt get provided by the UI, we can use the stored nonce to allow transaction queueing
  const nonceWasProvidedByUI = transactionsDetail?.nonce !== undefined // nonce can be a number of 0 therefore we need to check for undefined
  const nonce = nonceWasProvidedByUI
    ? number.toHex(number.toBN(transactionsDetail?.nonce || 0))
    : await getNonce(selectedAccount, wallet)

  // estimate fee with onchain nonce even tho transaction nonce may be different
  const { suggestedMaxFee } = await starknetAccount.estimateFee(transactions)

  const maxFee = number.toHex(suggestedMaxFee)

  const transaction = await starknetAccount.execute(transactions, abis, {
    ...transactionsDetail,
    nonce,
    maxFee,
  })

  if (!checkTransactionHash(transaction.transaction_hash)) {
    throw Error("Transaction could not get added to the sequencer")
  }

  transactionTracker.add({
    hash: transaction.transaction_hash,
    account: selectedAccount,
    meta: nameTransaction(transactions, abis),
  })

  if (!nonceWasProvidedByUI) {
    increaseStoredNonce(selectedAccount)
  }
  return transaction
}
