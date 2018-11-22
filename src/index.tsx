import Routes from './Routes'

interface ConstructorProps {
  locale: string
}

export default (opts: ConstructorProps) => new Routes(opts)
