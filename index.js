require('dotenv').config()
const fetch = require('node-fetch')

const username = process.env.STEEM_USER

const fetchSinglePost = `{
  "jsonrpc": "2.0",
  "method": "follow_api.get_blog",
  "params": {
    "account": "${username}",
    "start_entry_id": 0,
    "limit":1
  }, 
  "id":1
}`

const res = fetch('https://api.steemit.com', {
  method: 'POST',
  body: fetchSinglePost
})
.then(res => res.json())
.then(json => json.result)
.then(blogs => blogs[0].entry_id)
.then(entry_id => {

const fetchBody = `{
  "jsonrpc": "2.0",
  "method": "follow_api.get_blog",
  "params": {
    "account": "${username}",
    "start_entry_id": 0,
    "limit":${entry_id + 1}
  }, 
  "id":1
}`

const results = fetch('https://api.steemit.com', {
  method: 'POST',
  body: fetchBody
})
  .then(res => res.json())
  .then(json => {
    console.log(json)
    return json.result
  })
  .then(blogs => {
    const myBlogs = blogs.filter(blog => {
      return username === blog.comment.author
    })
    console.log(myBlogs)
  })
  .catch(err => console.log(err))

})
.catch(err => console.log(err))