import Routes from './Routes'

interface ConstructorProps {
  Link?: any
  Router?: any
  locale: string
}

export default (opts: ConstructorProps) => new Routes(opts)
