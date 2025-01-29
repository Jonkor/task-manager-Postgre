// ESM
import fastifyPlugin from 'fastify-plugin'
import fastifyPosgres from '@fastify/postgres'

/**
 * @param {FastifyInstance} fastify
 * @param {Object} options
 */
async function dbConnector (fastify, options) {
  fastify.register(fastifyPosgres, {
    connectionString: 'postgres://postgres:basededatos@localhost:5432/taskmanagerapi'

  })
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
export default fastifyPlugin(dbConnector)
