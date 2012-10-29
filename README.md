# urlrar, Expand any shorten url for you

## API

### Expand shorten url

* GET /v1/expand?url=$shorten_url[&fields=url,title,charset,size,icon]

### Error

```js
// HTTP Status 500
{
  status: 500,
  type: "HTTPRequestTimeError",
  message: "5000ms request timeout."
}
```

## Start
```
$ node server.js
```

## Help
@fengmk2 @Python发烧友

## Deploy
```
$ dotcloud push urlrar .
```