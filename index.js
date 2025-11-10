const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
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