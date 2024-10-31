const {MongoClient} = require('mongodb');
const { ObjectId } = require('mongodb');


async function main(){

    // données nécessaires pour se connecter à la base de données
    const uri = "mongodb://localhost:27017/bddIntro";
    const client = new MongoClient(uri);
    const db = client.db();
    try{
        // Deux grandes méthodes pour sélectionner les données avec mongodb 
        // - find 
        // - agréagtion


        // //////////////////////////////////////  find() , findOne() ////////////////////////////////////////


        const res = await db.collection('Etudiants').find(
            {sexe: "Féminin"}, // filtre
            {projection: {nom: 1, prenom: 1, _id: 0}} // projection
        ).toArray();
        // console.log(res);

        const res2  = await db.collection('Etudiants').findOne(
            {_id: "etudiant2"}, // filtre
            {projection: {nom: 1, prenom: 1, _id: 0}} // projection
        );
        // console.log(res2);

        /////////////////////////////////////////// find() avec opérateur de requêtes ////////////////////////////////////////
        
        const res3  = await db.collection('Formations').find(
            {'duree_heures': {$gt: 30}}, // filtre
            {projection: {titre: 1, tarif:1, _id: 0}} // projection
        ).sort({tarif: -1}).toArray();
        
        // console.log(res3);

//  $exists permet de sélectionner les documents qui contiennent ou non un champ donné 
        const res4  = await db.collection('Etudiants').find({'sexe':{$exists: false}}).toArray();
        // console.log(res4);




        ////////////////////////////////// Aggregation ////////////////////////////////////////

        const res5 = await db.collection('Formations').aggregate([
            {
                // $match est une étape d'agrégation et permet de filtrer les données
                $match: {
                    participants_min: {$gt: 5}
                }
            }
        ]).toArray();
        // console.log(res5);
        
//-----------------------------------------------------------------------------------------------------------//
        // Retourner les étudiants et les sessions auxquelles il participent 
        const studs = await db.collection('Etudiants').aggregate([
            {         
                $lookup: {
                    from: 'Sessions', // collection à joindre
                    localField: '_id', // champ de la collection courante (Etudiants)
                    foreignField: 'participants', // champ de la collection à joindre (Sessions)
                    as: 'sessionsMerge'
                }
            }, 
            {
                // $unwind permet de dérouler un tableau de documents
                $unwind: '$sessionsMerge'
            },
            {
                $project: {
                    nom: 1,
                    prenom: 1,
                    participe_session: '$sessionsMerge', // ici on met un $ devant le nom du champ pour signifier que l'on fait référence à un champ de la collection courante
                    _id: 0
                }

            }
        ]).toArray();

// console.log(studs);

    // studs.forEach(s => {
    //     console.log(`Etudiant: ${s.nom} ${s.prenom}`);
    //     console.dir(s.participe_session);
        
    // });
//-----------------------------------------------------------------------------------------------------------//

// Compter le nombre de participants par formation 

const studs2 = await db.collection('Formations').aggregate([
    {
        // Etape 1 : on joint les collections
        $lookup:{
            from: 'Sessions',
            localField: '_id',
            foreignField: 'formation_id',
            as: 'formaMerge'
        }
    }, 
    {
        // Etape 2 : on déroule le tableau de documents !! nécessaire pour accéder aux données du tableau participants
        $unwind: '$formaMerge'
    },
    // Etape 3 : Grouper par formation et compter le nombre de participants dans chaque session
    {
        $group:{
            _id: '$_id',
            titre: {$first:'$titre'},
            nombre_participants: {$sum: {$size: '$formaMerge.participants'}}
        }
    }
]).toArray();

// console.log(studs2);
//-----------------------------------------------------------------------------------------------------------//

// Afficher pour chaque session : le lieu, la date d'entrée, le titre de la formation, nom + prénom des participants
const studs3 = await db.collection('Sessions').aggregate([
    {
        $lookup:{
            from: 'Etudiants',
            localField: 'participants',
            foreignField: '_id',
            as: 'participantsMerge'
        }
    }, 
    {
        $project:{
            lieu: 1,
            date_entree: 1,
            formation_id: 1,
            participants: {
                $map:{
                    input: '$participantsMerge',
                    as: 'p',
                    in: {
                        // $$ fait référence à l'alias de boucle défini dans as 
                        $concat:['$$p.nom', ' ', '$$p.prenom']
                    }
                }
            }
        }
    }, 
    {
        $lookup:{
            from: 'Formations',
            localField: 'formation_id',
            foreignField: '_id',
            as: 'formationMerge'
        }
    }, 
    {
        $project: {
            lieu: 1,
            date_entree: 1,
            nom_formation: {$arrayElemAt:['$formationMerge.titre', 0]},
            participants: 1,
            _id: 0
        }
    }
]).toArray();

console.log(studs3);
    }
    catch(e){
        console.error(e);
    }
    finally{
        await client.close();
    }
}
main().catch(console.error);
