import translateRoutes from './translate'
import providerRoutes from './provider'

export default {
    type: 'admin',
    routes: [...translateRoutes, ...providerRoutes],
}
