const express=require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors=require('cors')
const app=express();
const port=process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nq0twuc.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        await client.connect();
        const database=client.db('online_shop')
        const productCollection=database.collection('products')
        const orderCollection=database.collection('orders');

        app.get('/products', async (req,res)=>{
            // console.log(req.query)
            const cursor=productCollection.find({});

            const page=req.query.page;
            const size=parseInt(req.query.size);
            const count=await productCollection.countDocuments();

            let products;
            if(page){
                products=await  cursor.skip(page*size).limit(size).toArray()

            }

            //use POST to get data
            app.post('/products/byKeys',async (req,res)=>{
                const keys=req.body;
                const query={key:{$in:keys}}
                const products=await productCollection.find(query).toArray();
                res.json(products)
            })

            //Add Orders API 
            app.post('/products/orders', async(req,res)=>{
                const order=req.body;
                console.log('Order ',order );
                const result=await orderCollection.insertOne(order)
                res.json(result)
            })
            res.send({
                count,
                products
            });
        })
    }
    finally{

    }
}
run().catch(console.dir);

app.get('/', (req,res)=>{
    res.send('Ema john server is running .....')
})


app.listen(port,(req,res)=>{
    console.log("listen to port ....",port);
})
