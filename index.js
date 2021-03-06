const express = require('express')
const app = express();
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wshhp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
       try {
             await client.connect();
             const database = client.db('volt_rider');
             const bikesCollection = database.collection('bikes');
             const ordersCollection = database.collection('orders');
             const usersCollection = database.collection('users');
             
             app.get('/bikes', async(req, res) => {
                 const cursor = bikesCollection.find({});
                 const bikes = await cursor.toArray();
                 res.json(bikes);
             })

             app.post('/bikes', async(req, res) => {
                 const bike = req.body;
                 const result = await bikesCollection.insertOne(bike);
                 res.json(result);
             })

             app.get('/orders', async(req, res) => {
                 const email = req.query.email;
                 const query = {email: email};
                 const cursor = ordersCollection.find(query);
                 const result = await cursor.toArray();
                 res.json(result);
             })

             app.post('/orders', async(req, res) => {
                 const order = req.body;
                 const result = await ordersCollection.insertOne(order);
                 res.json(result);
             })

             app.get('/users/:email', async (req, res) => {
                const email = req.params.email;
                const query = { email: email };
                const user = await usersCollection.findOne(query);
                let isAdmin = false;
                if (user?.role === 'admin') {
                    isAdmin = true;
                }
                res.json({ admin: isAdmin });
            })
    
            app.post('/users', async (req, res) => {
                const user = req.body;
                const result = await usersCollection.insertOne(user);
                console.log(result);
                res.json(result);
            });
    
            app.put('/users', async (req, res) => {
                const user = req.body;
                const filter = { email: user.email };
                const options = { upsert: true };
                const updateDoc = { $set: user };
                const result = await usersCollection.updateOne(filter, updateDoc, options);
                res.json(result);
            });
    
            app.put('/users/admin', async (req, res) => {
                const user = req.body;
                const requester = req.email;
                if (requester) {
                    const requesterAccount = await usersCollection.findOne({ email: requester });
                    if (requesterAccount.role === 'admin') {
                        const filter = { email: user.email };
                        const updateDoc = { $set: { role: 'admin' } };
                        const result = await usersCollection.updateOne(filter, updateDoc);
                        res.json(result);
                    }
                }
                else {
                    res.status(403).json({ message: 'you do not have access to make admin' })
                }
    
            })
       }
       finally {
        //    await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(port, () => {
  console.log(`Listening to Port:${port}`)
})