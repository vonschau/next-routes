import Routes from './Routes'

interface ConstructorProps {
  locale: string
}

export { default as Route } from './Route'

export default (opts: ConstructorProps) => new Routes(opts)
