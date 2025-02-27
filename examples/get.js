const http = require("../");

http.get("https://google.com/").then((res) => {
	console.log(res);
});
