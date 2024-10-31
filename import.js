const {MongoClient} = require('mongodb');
const fs = require('fs').promises;

async function main(){

    // données nécessaires pour se connecter à la base de données
    const uri = "mongodb://localhost:27017/bddIntro";
    const client = new MongoClient(uri);
    const db = client.db();
    try{
        const data = JSON.parse(await fs.readFile('database.json', 'utf-8'));
        await client.connect();

        for(const [collectionName, documents] of Object.entries(data))
        {
            const collection = db.collection(collectionName);
            await collection.insertMany(documents);
            console.log(`Collection ${collectionName} importée avec succès`);
        }
    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }
}
main().catch(console.error);