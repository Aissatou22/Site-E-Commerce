// Fonctions

const express = require('express');
const app = express()

//Reconnaitre le json et le json en chaine de caractere ou tableau
app.use(express.json());
app.use(express.urlencoded({extended:true}));
//cors permet de mettre en ralation le terminal et le navigateur
app.use(function(req,res, next){
	res.setHeader("Content-type", "application/json");
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
	res.setHeader("Access-Control-Allow-Headers", "*");
	next();
})

//app.use(require("cors"));

//Appeler la base et l'afficher sur le navigateur
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";


//Fonction callback
//pour interroger la base
MongoClient.connect(url, {useNewUrlParser : true}, (err, client) => {
    let db = client.db("SUPERVENTES");


///serveur web
app.get("/produits", (req,res) => {
	console.log("route : /produits");
	db.collection("produits").find().toArray((err, documents) =>{
		res.end(JSON.stringify(documents));
	});
});

app.get("/produits/:type", (req,res) => {
	console.log("route : /type");
	db.collection("produits").find({"type":req.params.type}).toArray((err, documents) =>{
		res.end(JSON.stringify(documents));
	});
});
//Fonction ajout d'un produit
app.post("/produit", (req,res) =>{
	console.log("route = /produit avec "+JSON.stringify(req.body));
	try{
		db.collection("produits").insertOne(req.body);
		res.end(JSON.stringify({"message": "ajout de produits effectué"}));

	} catch(e){
		res.end(JSON.stringify({"message":"erreur d'ajout: "+e} ))

	} 

	
});

//Fonction ajout panier
app.post("/panier", (req,res) =>{
	console.log("route = /panier avec "+JSON.stringify(req.body));
	try{
		db.collection("panier").insertOne(req.body);
		res.end(JSON.stringify({"message": "ajout de produits effectué"}));

	} catch(e){
		res.end(JSON.stringify({"message":"erreur d'ajout: "+e} ))

	} 

	
});
	
// Liste des categories de produits
app.get("/categories", (req,res) =>{
	console.log("/categories");
	categories =[];
	try{
		db.collection("produits").find().toArray((err, documents) =>{
			for (let doc of documents){
				if (!categories.includes(doc.type)) categories.push(doc.type);
		
			} 
			res.end(JSON.stringify(categories));
		}); 
	}  catch(e){
		console.log("Erreur sur /categories :" +e);
		res.end(JSON.stringify([]));
	} 

}); 

//Liste des produits suivant une categorie
app.get("/produits/:categorie", (req,res) =>{
	console.log("route: /produits/:categorie:type");
  db.collection("produits").distinct("type",{"categorie":req.params.categorie},(err, documents) => {
    res.json(documents);
  })
});	
	//Service web connexion
	app.post("/membres/connexion", (req,res) =>{
		console.log("utilisateurs/connexion avec "+JSON.stringify(req.body));
		try{
			db.collection("membres").find(req.body).toArray((err,documents) =>{
				if (documents != undefined && documents.length == 1)
					res.end(JSON.stringify({"resultat": 1, "message" : "Authentification réussie"}));
				else res.end(JSON.stringify({"resultat" : 0, "message": 'Email et/ou mot de passe incorrect'}));
			});
		}
		catch (e){
			res.end(JSON.stringify({"resultat" : 0, "message" : e}));
		}
	});


	//Fonction inscription
	app.post("/membres/inscription", (req,res) =>{
		console.log("route = /membres/inscription avec "+JSON.stringify(req.body));
		try{
			db.collection("membres").insertOne(req.body);
			res.end(JSON.stringify({"message": "inscription  effectué"}));

		} catch(e){
			res.end(JSON.stringify({"message":"erreur d'ajout: "+e} ))

		} 

		
	});

})






app.listen(8888);