

exports.bootIntoNode = function (context) {

	var loader = new Loader(context);

	return loader.load("0-boot/0-boot").then(function (context) {
		return loader.callApi("css.load", {
			uri: "0-boot",
			cssPrefix: context.cssPrefix,
			// TODO: Load this dynamically with the js source code.
			source: require("./0-boot/0-boot.scss")
		}).then(function () {

			return loader.load("1-insight/1-insight").then(function (context) {
				return loader.callApi("css.load", {
					uri: "1-insight",
					cssPrefix: context.cssPrefix,
					// TODO: Load this dynamically with the js source code.
					source: require("./1-insight/1-insight.scss")
				}).then(function () {

					return loader;
				});
			});
		});
	});
}


var Loader = function(context) {
	var self = this;

	self.API = context.API;
	self.domNode = context.domNode;
	self.widgetIndex = context.widgetIndex;

	self.api = {};
}

Loader.prototype.callApi = function (id, args) {
	var self = this;
	if (!self.api[id]) {
		return self.API.Q.reject(new Error("API for id '" + id + "' not registered!"));
	}
	try {
		return self.API.Q.when(self.api[id](args));
	} catch (err) {
		return self.API.Q.reject(err);
	}
}

Loader.prototype.registerApi = function (id, handler) {
	var self = this;
	if (self.api[id]) {
		return self.API.Q.reject(new Error("API for id '" + id + "' already registered!"));
	}
	self.api[id] = handler;
	return self.API.Q.resolve();
}

Loader.prototype.load = function (id) {
	var self = this;

	// TODO: Load renderers dynamically.

	return self.API.Q.resolve((function () {

		if (id === "0-boot/0-boot") {
			return require("./0-boot/0-boot");
		} else
		if (id === "1-insight/1-insight") {
			return require("./1-insight/1-insight");
		}

		throw new Error("ACTION: Add condition for id '" + id + "'!");

	})()).then(function (renderer) {
		try {
			var context = {
				API: self.API,
				domNode: self.domNode,
				cssPrefix: "_fcw_" + id.split("/")[0].replace(/\//g, "_"),
				registerApi: function (id, handler) {
					return self.registerApi(id, handler);
				},
				callApi: function (id, args) {
					return self.callApi(id, args);
				}
			};
			return renderer.init(context).then(function () {
				return context;
			});
		} catch (err) {
			throw err;
		}
	});
}

