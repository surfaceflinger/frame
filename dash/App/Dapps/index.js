import React, {  createRef } from 'react'
import Restore from 'react-restore'
import link from '../../../resources/link'
import { isNetworkConnected } from '../../../resources/utils/chains'
// import svg from '../../../resources/svg'

function bySessionStartTime (a, b) {
  return a.session.startedAt - b.session.startedAt
}

function byLastUpdated (a, b) {
  return a.session.lastUpdatedAt - b.session.lastUpdatedAt
}

class Indicator extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      active: false
    }

    setTimeout(() => {
      this.setState({ active: true })
    }, 20)

    setTimeout(() => {
      this.setState({ active: false })
    }, 200)
  }

  render () {
    if (this.props.connected) {
      return <div className={this.state.active ? 'sliceOriginIndicator sliceOriginIndicatorActive' : 'sliceOriginIndicator' } />
      //return <div className='connectionOptionStatusIndicator'><div className='connectionOptionStatusIndicatorGood' /></div>
    } 
    // else if (status === 'loading' || status === 'syncing' || status === 'pending' || status === 'standby') {
    //   return <div className='connectionOptionStatusIndicator'><div className='connectionOptionStatusIndicatorPending' /></div>
    // } 
    else {
      return <div className='connectionOptionStatusIndicator'><div className='connectionOptionStatusIndicatorBad' /></div>
    }
  }
}

class _OriginModule extends React.Component {
  constructor (...args) {
    super(...args)

    this.state = {
      expanded: false
    }

    this.ref = createRef()
  }

  render () {
    const { origin, connected } = this.props

    return (
      <div>      
        <div 
          className='sliceOrigin'
          onClick={() => {
            link.send('tray:action', 'navDash', { view: 'notify', data: { notify: 'updateOriginChain', notifyData: { origin } }})
          }}
        >
          <Indicator key={origin.session.lastUpdatedAt} connected={connected} />
          <div className='sliceOriginTile'>
            {origin.name}
          </div>
        </div>
        {this.state.expanded ? (
          <div>
            {'origin quick menu'}
          </div>
        ) : null}
      </div>
    )
  }
}

const OriginModule = Restore.connect(_OriginModule)

const ChainOrigins = ({ chain, origins }) => (
  <>
    <div className='originTitle'>{chain.name}</div>
    {origins.connected.map((origin) => <OriginModule origin={origin} connected={true} />)}
    {origins.disconnected.map((origin) => <OriginModule origin={origin} connected={false} />)}
  </>
)
  
class Dapps extends React.Component {
  render () {
    const allOrigins = this.store('main.origins')
    const enabledChains = Object.values(this.store('main.networks.ethereum')).filter(chain => chain.on)

    const chainOrigins = enabledChains.map((chain) => {
      const { connectedOrigins, disconnectedOrigins } = Object.values(allOrigins).reduce((acc, origin) => {
        if (origin.chain.id === chain.id) {
          const connected = isNetworkConnected(chain) && 
            (!origin.session.endedAt || origin.session.startedAt > origin.session.endedAt)

          acc[connected ? 'connectedOrigins' : 'disconnectedOrigins'].push(origin)
        }

        return acc
      }, { connectedOrigins: [], disconnectedOrigins: [] })

      const origins = {
        connected: connectedOrigins.sort(bySessionStartTime),
        disconnected: disconnectedOrigins.sort(byLastUpdated)
      }

      return { chain, origins }
    })

    return (
      <div>
        {chainOrigins.map(({ chain, origins }) => origins.length === 0 ? <></> : <ChainOrigins chain={chain} origins={origins} />)}
      </div>
    ) 
  }
}

export default Restore.connect(Dapps)
