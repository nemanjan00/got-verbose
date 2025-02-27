const got = require("got");

const CacheableLookup = require("cacheable-lookup");

const cacheable = new CacheableLookup();

const handler = {
	get: (object, prop) => {
		const error = ("" + (new Error()).stack).split("\n").filter((el, key) => key > 1);

		error[0] = error[0].replace("Object.<anonymous>", `http.${prop}`);

		if(prop == "extend") {
			return (...args) => {
				return new Proxy(object[prop](...args), handler);
			};
		}

		if(object[prop] instanceof Function) {
			return (...args) => {
				const result = object[prop](...args);

				if(result instanceof Promise) {
					return new Promise((resolve, reject) => {
						result.then(resolve).catch((...args) => {
							if(args[0] instanceof Error) {
								args[0].stack = [("" + args[0].stack).split("\n")[0] ].concat(error).join("\n");
							}

							reject(...args);
						});
					});
				}

				return result;
			};
		}

		return object[prop];
	}
};

const http = new Proxy(got.extend({
	retry: 0,
	dnsCache: cacheable,
	hooks: {
		beforeError: [ (error) => {
			error.stack = error.stack.replace(error.message, error.message + ` while sending ${error.request.options.method} request to ${error.request.options.url.href}`);
			error.message += ` while sending ${error.request.options.method} request to ${error.request.options.url.href}`;

			if(process.env.HTTP_TRACE) {
				console.error(error.message);
			}

			return error;
		} ],
		beforeRequest: [ (options) => {
			if(process.env.HTTP_TRACE) {
				options._start = new Date();
			}
		} ],
		afterResponse: [ (response) => {
			if(process.env.HTTP_TRACE) {
				const time = ((new Date()) - response.request.options._start) / 1000;

				console.log(`${response.request.options.method} request to ${response.request.options.url} took ${time}s.`);
			}

			return response;
		} ]
	}
}), handler);

module.exports = http;

