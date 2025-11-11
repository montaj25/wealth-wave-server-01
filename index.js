const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 3000;
console.log(process.env)

// middleware
app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.WW_USER}:${process.env.WW_PASS}@cluster0.imaa7iu.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send("Wealth wave is running")
})

async function run() {
    try {
        await client.connect();
        const db = client.db('wealthWaveDB')
        const wealthsCollection = db.collection('transactions');
        const usersCollection = db.collection('users');

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                res.send({Message: 'user already exits. do not need to insert again'})
            }
            else {
                const result = await usersCollection.insertOne(newUser);
                res.send(result)
            }

        })


        app.get('/transactions', async (req, res) => {
            // const projectFields = { type: 1, category: 1, amount: 1, date: 1 }//hero1@gmail.com
            console.log(req.query)
            const email = req.query.email;
            const query = {}
            if (email) {
                query.email = email;
            }

            const cursor = wealthsCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/transactions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await wealthsCollection.findOne(query);
            res.send(result);
        })

        app.post('/transactions', async (req, res) => {
            const newTransaction = req.body;
            const result = await wealthsCollection.insertOne(newTransaction);
            res.send(result);
        })

        app.patch('/transactions/:id', async (req, res) => {
            const id = req.params.id;
            const updatedTransaction = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    name: updatedTransaction.name,
                    amount: updatedTransaction.amount
                }
            }

            const result = await wealthsCollection.updateOne(query, update)
            res.send(result)

        })

        app.delete('/transactions/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await wealthsCollection.deleteOne(query);
            res.send(result)
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    }
    finally {

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`Wealth wave is running on: ${port}`)
})