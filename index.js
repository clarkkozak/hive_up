require('dotenv').config()
const fetch = require('node-fetch')
const { Client, PrivateKey } = require('dsteem')
const { Mainnet  } = require('./config') //A Steem Testnet. Replace 'Testnet' with 'Mainnet' to connect to the main Steem blockchain.

const diff_match_patch = require('diff-match-patch');
const dmp = new diff_match_patch();

let opts = { ...Mainnet.net };

const privateKey = PrivateKey.fromString(process.env.POSTING_KEY)
const client = new Client(Mainnet.url, opts);


function createPatch(text, out) {
  if (!text && text === '') return undefined;
  const patch_make = dmp.patch_make(text, out);
  const patch = dmp.patch_toText(patch_make);
  return patch;
}


const username = process.env.STEEM_USER
const edited_body = 'This content was edited by an the Steem API'

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
    return json.result
  })
  .then(blogs => {
    const myBlogs = blogs.filter(blog => {
      return username === blog.comment.author
    })

    
    const myLastestBlog = myBlogs[0]
    const { comment } = myLastestBlog
    console.log(myLastestBlog)
    const { title, json_metadata, permlink } = comment
    console.log(permlink)
    
    const o_body = comment.body
    const tagList = JSON.parse(json_metadata)
    
    //computes a list of patches to turn o_body to edited_body
      const patch = createPatch(o_body, edited_body);
          //check if patch size is smaller than edited content itself
    if (patch && patch.length < new Buffer(edited_body, 'utf-8').length) {
      body = patch;
  } else {
      body = edited_body;
  }

  client.broadcast
    .comment({
      author: username,
      body,
      json_metadata,
      parent_author: '',
      parent_permlink: tagList.tags[0],
      permlink,
      title
    },
    privateKey
    )
    .then((result) => {
      console.log(result)
      console.log(`http://condenser.steem.vc/${taglist.tag[0]}/@${account}/${permlink}`)
    })
  })
  .catch(err => console.log(err))

})
.catch(err => console.log(err))