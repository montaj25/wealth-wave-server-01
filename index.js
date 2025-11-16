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
            const exists = await usersCollection.findOne({ email: newUser.email })
            if (exists) {
                return res.send({ message: "User already exists" })
            }
            if (newUser.googleUser === true) {
                await usersCollection.insertOne(newUser);
                return res.send({ message: "Google user saved", user: newUser });
            }

            await usersCollection.insertOne(newUser);
            res.send({ message: "user register" })
        });

        app.post('/login', async (req, res) => {
            const { email } = req.body;
            if (!email) {
                return res.send({ error: "email required" })
            }
            const user = await usersCollection.findOne({ email });
            if (!user) {
                return res.send({ error: 'user not found in database' });
            }

            res.send({
                message: "Login Successfully",
                user
            })
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
            try {
                const transaction = await wealthsCollection.findOne(query);
                if (!transaction) {
                    return res.send({ error: "transaction not found" })
                }
                const sameCategoryTransactions = await wealthsCollection.find({ category: transaction.category }).toArray();
                let categoryTotal = 0;
                sameCategoryTransactions.forEach(t => {
                    categoryTotal += parseFloat(t.amount);
                })
                console.log(categoryTotal)
                res.send({ ...transaction, categoryTotal })
            }
            finally {

            }
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
                    amount: updatedTransaction.amount,
                    description: updatedTransaction.description,
                    type: updatedTransaction.type,
                    category: updatedTransaction.category,
                    date: updatedTransaction.date,
                }
            }

            const result = await wealthsCollection.updateOne(query, update)
            console.log(result)
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