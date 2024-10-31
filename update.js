const {MongoClient} = require('mongodb');
const { ObjectId } = require('mongodb');


async function main(){

    // données nécessaires pour se connecter à la base de données
    const uri = "mongodb://localhost:27017/bddIntro";
    const client = new MongoClient(uri);
    const db = client.db();
    try{



        // ////////////// Mettre à jour un étudiant avec l'objectID et un _id perso via la fonction main() ///////////////////////
 const updateOne = await db.collection('Etudiants').updateOne( 
    // filtre pour trouver l'étudiant à modifier ici on utilise l'objectID qui est auto génére par mongo !! avant de l'utliser il faut l'importer !!! 
    {_id: new ObjectId("672355e69551deac800a6fe2")}, 
    // la donnée à modifier 
    {$set: {age: 26}}
    );
const updateOne2 = await db.collection('Etudiants').updateOne(  
    // filtre pour trouver l'étudiant à modifier ici on utilise un _id perso 
    {_id: "etudiant4"}, 
    // la donnée à modifier 
    {$set: {age: 26}}
    );  



    //////////// Mettre à jour plusieurs étudiants via une autre fonction ///////////////////////

    await updateManyStudents(client, {sexe: "F"}, {sexe: "Féminin"});


    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }
}
main().catch(console.error);

async function updateManyStudents(client, filtre, updateData){
 await client.db().collection('Etudiants').updateMany(filtre, {$set: updateData}); 
}