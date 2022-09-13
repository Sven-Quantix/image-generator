const fastify = require("fastify")({ logger: true });
const { generateMainImage } = require("./lib/image-gen");

fastify.route({
	method: "GET",
	url: "/",
	schema: {
		// request needs to have a querystring with a `name` parameter
		querystring: {
			name: { type: "string" },
		},
		// the response needs to be an object with an `hello` property of type 'string'
		response: {
			200: {
				type: "object",
				properties: {
					hello: { type: "string" },
				},
			},
		},
	},
	preHandler: async (request, reply) => {
		// E.g. check authentication
	},
	handler: async (request, reply) => {
		generateMainImage(`img-${new Date().getTime()}`, [
			["X", "O", "X"],
			["", "", "X"],
			["O", "", ""],
		]);
		return { hello: "world" };
	},
});

const start = async () => {
	try {
		await fastify.listen({ port: 3001 });
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};
start();
