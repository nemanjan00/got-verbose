const http = require("../");

http.post("https://google.com/", {
	body: Buffer.from("123")
}).then((res) => {
	console.log(res);
});
