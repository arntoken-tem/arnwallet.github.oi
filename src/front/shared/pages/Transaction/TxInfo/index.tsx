import React, { Component } from 'react'
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl'
import erc20Like from 'common/erc20Like'
import helpers from "helpers";
import { getFullOrigin } from 'helpers/links'
import { constants } from 'helpers'

import cssModules from 'react-css-modules'
import styles from './styles.scss'
import ShareButton from 'components/controls/ShareButton/ShareButton'
import okSvg from 'shared/images/ok.svg'
import actions from 'redux/actions'
import { BigNumber } from 'bignumber.js'
import Skeleton from 'react-loading-skeleton'
import CommentRow from 'components/Comment/Comment'

import animateFetching from 'components/loaders/ContentLoader/ElementLoading.scss'



const labels = defineMessages({
  Title: {
    id: 'InfoPay_1',
    defaultMessage: 'Transaction is completed',
  },
  Text: {
    id: 'InfoPay_2',
    defaultMessage: 'successfully transferred to'
  },

})

const isDark = localStorage.getItem(constants.localStorage.isDark)

@cssModules({
  ...styles,
  ...animateFetching,
}, { allowMultiple: true })
class TxInfo extends Component<any, any> {
  constructor(props) {
    super(props)

    const {
      currency,
      txRaw,
      txId,
      error,
    } = props

    let linkBlockChain = '#'
    let linkShare = '#'
    let tx = ''

    if (!error) {
      if (txRaw) {
        if (erc20Like.erc20.isToken({ name: currency })) {
          const txInfo = helpers.transactions.getInfo('erc20', txRaw)

          tx = txInfo.tx
          linkBlockChain = txInfo.link
        } else if (erc20Like.bep20.isToken({ name: currency })) {
          const txInfo = helpers.transactions.getInfo('bep20', txRaw)

          tx = txInfo.tx
          linkBlockChain = txInfo.link
        } else {
          const txInfo = helpers.transactions.getInfo(currency.toLowerCase(), txRaw)

          tx = txInfo.tx
          linkBlockChain = txInfo.link
        }
      }

      if (txId) {
        tx = txId
        linkShare = helpers.transactions.getTxRouter(currency.toLowerCase(), txId)
        linkBlockChain = helpers.transactions.getLink(currency.toLowerCase(), txId)
      }
    }

    this.state = {
      linkBlockChain,
      linkShare,
      tx,
    }
  }

  updateComment = (value) => {
    this.setState({ state: this.state });
  }

  render() {
    const {
      intl,
      currency,
      txId,
      isFetching,
      amount,
      toAddress,
      oldBalance,
      confirmed,
      minerFee,
      minerFeeCurrency,
      adminFee,
      error,
      finalBalances,
    } = this.props

    const {
      linkBlockChain,
      linkShare,
      tx,
    } = this.state

    let finalAmount = amount
    let finalAdminFee = adminFee

    let fromFinal = 0
    let toFinal = 0

    let fromIsOur = false
    let toIsOur = false
    if (finalBalances) {
      finalAmount = finalBalances.amount
      finalAdminFee = finalBalances.adminFee
      fromFinal = new BigNumber(finalBalances.fromBalance).minus(finalAmount).minus(finalAdminFee).toNumber()
      toFinal = new BigNumber(finalBalances.toBalance).plus(finalAmount).toNumber()
      fromIsOur = actions.user.isOwner(finalBalances.from, finalBalances.currency)
      toIsOur = actions.user.isOwner(finalBalances.to, finalBalances.currency)
    }

    const comment = actions.comments.getComment(txId)

    return (
      <div>
        <div styleName={`blockCenter ${isDark ? 'dark' : ''}`}>
          <div>
            <img styleName="finishImg" src={okSvg} alt="finish" />
          </div>

          <div className="p-3">
            <div styleName="shortInfoHolder">
              {
                isFetching
                  ? (
                    <span>
                      {/*
                      // @ts-ignore */}
                      <Skeleton count={2} />
                    </span>
                  )
                  : error
                  ? (
                    <span>
                        <span><FormattedMessage id="InfoPay_2_Error" defaultMessage="Error loading data" /></span>
                      </span>
                  )
                  : (
                    <span>
                        <span><strong id='txAmout'> {finalAmount}  {currency.toUpperCase()} </strong></span>
                        <FormattedMessage id="InfoPay_2_Ready" defaultMessage="были успешно переданы" />
                        <br />
                        <strong id='txToAddress'>{toAddress}</strong>
                      </span>
                  )
              }
            </div>
          </div>

          <table styleName="blockCenter__table" className="table table-borderless">
            <tbody>
            <tr>
              <td styleName="header">
                <FormattedMessage id="InfoPay_3" defaultMessage="Transaction ID" />
              </td>
              <td>
                <a href={linkBlockChain} target="_blank" styleName="txLink">
                  {`${tx.slice(0, 6)}...${tx.slice(-6)}`}
                </a>
              </td>
            </tr>
            {isFetching ? (
              <>
                <tr>
                  <td colSpan={2}>
                    {/*
                      // @ts-ignore */}
                    <Skeleton />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    {/*
                      // @ts-ignore */}
                    <Skeleton />
                  </td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    {/*
                      // @ts-ignore */}
                    <Skeleton />
                  </td>
                </tr>
              </>
            ) : error
              ? ''
              : (
                <>
                  {(confirmed) ? (
                    <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_StatusReadyHeader" defaultMessage="Status" />
                      </td>
                      <td>
                        <strong>
                          <FormattedMessage id="InfoPay_Confirmed" defaultMessage="Confirmed" />
                        </strong>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_4" defaultMessage="Est. time to confirmation" />
                      </td>
                      <td>
                        <FormattedMessage id="InfoPay_NotConfirmed" defaultMessage="~10 mins" />
                      </td>
                    </tr>
                  )}
                  {(minerFee > 0) && (
                    <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_MinerFee" defaultMessage="Miner fee" />
                      </td>
                      <td>
                        <strong>
                          {minerFee} {minerFeeCurrency}
                        </strong>
                      </td>
                    </tr>
                  )}
                  {(finalAdminFee > 0) && (
                    <tr>
                      <td styleName="header">
                        <FormattedMessage id="InfoPay_AdminFee" defaultMessage="Service fee" />
                      </td>
                      <td>
                        <strong>
                          {finalAdminFee} {currency.toUpperCase()}
                        </strong>
                      </td>
                    </tr>
                  )}
                  {(finalBalances) ? (
                    <>
                      <tr>
                        <td styleName="header" colSpan={2}>
                          <FormattedMessage id="InfoPay_FinalBalances" defaultMessage="Final balances" />
                        </td>
                      </tr>
                      <tr>
                        <td styleName="header" colSpan={2}>
                          {finalBalances.from}
                          {(fromIsOur) && (
                            <>
                              {` `}
                              <FormattedMessage id="InfoPay_IsOurAddress" defaultMessage="(Your)" />
                            </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <strong>{fromFinal} {currency.toUpperCase()}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td styleName="header" colSpan={2}>
                          {finalBalances.to}
                          {(toIsOur) && (
                            <>
                              {` `}
                              <FormattedMessage id="InfoPay_IsOurAddress" defaultMessage="(Your)" />
                            </>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td>
                          <strong>{toFinal} {currency.toUpperCase()}</strong>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <>
                      {(oldBalance > 0) && (
                        <tr>
                          <td styleName="header">
                            <FormattedMessage id="InfoPay_FinalBalance" defaultMessage="Final balance" />
                          </td>
                          <td>
                            <strong>
                              {oldBalance} {currency.toUpperCase()}
                            </strong>
                          </td>
                        </tr>
                      )}
                    </>
                  )}
                </>
              )}
            {comment && (
                <tr>
                  <td styleName="header">
                    <FormattedMessage id="InfoPay_Comment" defaultMessage="Comment" />
                  </td>
                  <td>
                    <strong>
                      {comment}
                    </strong>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div styleName="blockCenter buttonHolder">
          <ShareButton
            halfWidth={true}
            minWidth="200px"
            link={`${getFullOrigin()}${linkShare}`}
            title={amount.toString() + ' ' + currency.toString() + ' ' + intl.formatMessage(labels.Text) + ' ' + toAddress} />

            <CommentRow
              label={''}
              canEdit={true}
              updateComment={(v) => this.updateComment(v)}
              commentKey={txId}
            />
        </div>
      </div>
    )
  }
}

export default injectIntl(TxInfo)
