import translateRoutes from './translate'
import providerRoutes from './provider'

export default {
    type: 'content-api',
    routes: [...translateRoutes, ...providerRoutes],
}
