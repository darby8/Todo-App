const express = require('express');
const { MongoClient, ObjectId } = require('mongodb')
const app = express();
app.use(express.static('javascript'))
let db;
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

async function go() {
  let client = new MongoClient(
    'mongodb+srv://dheerajjaiswal9797:Jaiswal%4063@cluster0.wqddpvg.mongodb.net/todoapp?retryWrites=true&w=majority');
  await client.connect();
  db = client.db();
  app.listen(3000);
}
go();


function passwordProtected(req,res,next){
  res.set('WWW-Authenticate','Basic realm="Simple todo app"')
  console.log(req.headers.authorization)
  if(req.headers.authorization =='Basic RGFyYnk6ZHJq'){
    next()
  }
  else{
    res.status(401).send("Authorization required");
  }
}

//app.use(passwordProtected)
app.get('/', passwordProtected, async (req, res) => {
  const tasks = await db.collection('task').find().toArray();
  res.send(`<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>
        
        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>
        
        <ul id="item-list" class="list-group pb-5">
       ${tasks.map(function(item){
         return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
         <span class="item-text">${item.text}</span>
         <div>
           <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
           <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
         </div>
       </li>`
       }).join('')}
        </ul>
        
      </div>
      <script src="https://cdn.jsdelivr.net/npm/axios@1.1.2/dist/axios.min.js"></script>
      <script src="/browser.js"></script>
    </body>
    </html>`)
})



app.post('/create-item', async (req, res) => {
 await db.collection('task').insertOne({ text: req.body.item})
 res.redirect('/');
})

app.post('/update-item', async function(req,res){
  await db.collection('task').findOneAndUpdate({_id:new ObjectId(req.body.id)},{$set:{text:req.body.text}})
  res.send("success")
})
app.post('/delete-item', async function(req,res){
await db.collection('task').deleteOne({_id:new ObjectId(req.body.id)});
res.send("success");
})