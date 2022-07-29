const express = require('express')
const bodyParser = require('body-parser');

require('dotenv').config();

var database = process.env.mongodatabase

const app = express()
app.use(bodyParser.json());


var db;

const MongoClient = require('mongodb').MongoClient;

const ObjectId = require('mongodb').ObjectId;

MongoClient.connect(database,{ useNewUrlParser: true }).then(client=>{
    db = client.db('new')
}).then(()=> console.log('connected to database')).catch(err=>console.log(err))

app.get('/',(req,res)=>{
    res.send('I am listening')
})

//GO TO/ALL TO GET ALL THE OBJECTS
app.get('/all',(req,res)=>{
    var t = []
    async function all(){
        await db.collection('user').find().toArray().then(a=>t.push(a))
        var m = prettyjson(t)
        res.send(m)
        console.log(m)
    }
    all().catch(console.dir)
})

app.get('/api/v3/app/events',(req,res)=>{
    var ID = req.query.id;
    var TYPE = req.query.type;
    var LIMIT = parseInt(req.query.limit);
    var PAGE = parseInt(req.query.page);

    if(ID){
        async function findById(){
            var event = await db.collection('user').find().toArray().then(event=> event.filter(e=>e._id.toString() == new ObjectId(ID).toString()))
            var pretty = prettyjson(event)
            res.send(pretty)
            console.log(event)
        }
        findById().catch(console.dir);
    }

    else if(TYPE=='latest',LIMIT,PAGE){
        async function findByRecency(){
            var allevents = await db.collection('user').find().sort({"schedule": 1}).toArray()
            allevents.forEach(a=>console.log(a.schedule))
            console.log('')
            var events = []
            console.log(parseInt(PAGE)+1)
            for(var i= LIMIT*(PAGE-1);i<(LIMIT*PAGE);i++){
                if(allevents[i] != null){
                    events.push(allevents[i])
                }
            }
            var pretty = prettyjson(events)
            res.send(pretty)
            console.log(pretty)
        }
        findByRecency().catch(console.dir)
    }
    else{
        res.send('send queries to view data')
    }
})


function randomNumber(min, max){
    const r = Math.random()*(max-min) + min
    return Math.floor(r)
}


app.post('/api/v3/app/events',(req,res)=>{
    var newentry = req.body
    newentry.type="event";
    newentry.uid = randomNumber(111111111111111111,999999999999999999)
    newentry.attendess = []
    var data = prettyjson(newentry)
    res.send(data)
    db.collection('user').insertOne(newentry)
})


app.put('/api/v3/app/events',(req,res)=>{
    var ID = req.query.id;
    if(ID){
        async function findById(){

            //FIND THE EVENT WITH THE SAME ID

            var event = await db.collection('user').find().toArray().then(event=> event.filter(e=>e._id.toString() == new ObjectId(ID).toString()))


            var newentry = {}
            req.body.type ? newentry.type = req.body.type : event[0].type
            req.body.tagline ? newentry.tagline = req.body.tagline: event[0].tagline
            req.body.schedule ? newentry.schedule = req.body.schedule: event[0].schedule
            req.body.description ? newentry.description = req.body.description: event[0].description
            req.body.files ? newentry.files = req.body.files: event[0].files
            req.body.moderator ? newentry.moderator = req.body.moderator: event[0].moderator
            req.body.sub_category ? newentry.sub_category = req.body.sub_category: event[0].sub_category
            req.body.rigor_rank ? newentry.rigor_rank = req.body.rigor_rank: event[0].rigor_rank


            db.collection('user').updateOne({_id:new ObjectId(ID)},{$set : newentry},function(err,res){
                if(err) throw err;
                console.log(res)
            })

            var data = prettyjson(newentry)

            res.send(data)
    
        }
        findById().catch(console.dir);
    }
    else{
        res.send('send queries to update objects')
    }
})



app.delete('/api/v3/app/events',(req,res)=>{
        var ID = req.query.id;

        if(ID){
            async function del(){

                db.collection('user').deleteOne({_id:new ObjectId(ID)}).then(response=>{
                    console.log(response)
                    res.send(response)
                })
    
            }
    
            del().catch(console.dir);
        }
        else{
            res.send('send query to delete an object')
        }

})

function prettyjson(data){
    return JSON.stringify(data,null,2)
}



app.listen(3000,()=>{
    console.table('listening')
});
