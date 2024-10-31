const {MongoClient} = require('mongodb');
const { ObjectId } = require('mongodb');


async function main(){

    // données nécessaires pour se connecter à la base de données
    const uri = "mongodb://localhost:27017/bddIntro";
    const client = new MongoClient(uri);
    const db = client.db();
    try{

        // ajouter un étudiant directement dans la fonction main 
        const addOne = await db.collection('Etudiants').insertOne({
            nom: "Doe",
            prenom: "John",
            age: 25,
            sexe: "M",
            email: "John@test.com",
            tel: "514-123-4567",
        })

        console.log(`Etudiant ajouté avec succès: ${addOne}`);

        // Ajouter plusieurs étudiants en passant par une autre fonction
        await addManyStudents(client, [
            {
                nom: "Doe",
                prenom: "Jane",
                age: 22,
                sexe: "F",
                email: "jane@exemple.fr"
            },
            {
                nom: "Doe",
                prenom: "Alice",
                age: 20,
                sexe: "F",
                email: "alice@ex.fr"
            }
        ]);
        
    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }
}
main().catch(console.error);


async function addManyStudents(client, students){
    const res = await client.db().collection('Etudiants').insertMany(students);
    console.log(`Etudiants ajoutés avec succès: ${res.insertedIds}`);
    
}