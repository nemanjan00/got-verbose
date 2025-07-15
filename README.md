# got-verbose

This is based off `got@^11.8.2`. 

I added some features that I felt were missing:

 - In error message, you actually have details about request that was sent `Error ... while sending POST request to https://www.google.com/123`

 - Error stack actually shows where request was created and not just meaningless stack from event lookup

 - `HTTP_TRACE=true` - It tells you about each request sent and how much time it took

 - `HTTP_CURL=true` - It prints curl command for each request sent

