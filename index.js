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


// const uri = "mongodb+srv://wealthWaveUserOne:6d5VnBwUOkZA1VTx@cluster0.imaa7iu.mongodb.net/?appName=Cluster0";
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
        const wealthsCollection = db.collection('transaction');

        app.get('/transaction', async (req, res) => {
            const cursor = wealthsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/transaction/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await wealthsCollection.findOne(query);
            res.send(result);
        })

        app.post('/transaction', async (req, res) => {
            const newTransaction = req.body;
            const result = await wealthsCollection.insertOne(newTransaction);
            res.send(result);
        })

        app.patch('/transaction/:id', async (req, res) => {
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

        app.delete('/transaction/:id', async (req, res) => {
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