const express = require("express")

const ejs = require("ejs")

const bodyParser = require("body-parser"); 

const mongoose = require("mongoose");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static(__dirname + '/public'));

////////////////////////  Mongoose - DB  ////////////////////////////////////

mongoose.connect("mongodb+srv://mk:mk98@cluster0.gldzot4.mongodb.net/checklistDB");

const itemSchema = new mongoose.Schema({
    name : "String"
});

const Item = mongoose.model("Item", itemSchema);

let item1 = new Item ({
    name : "work"
})

let item2 = new Item ({
    name : "Gym"
})

let item3 = new Item ({
    name : "Revision"
})

const defaultItems = [item1, item2 ,item3]

const listSchema = new mongoose.Schema({
    name : "string",
    crazy :  [itemSchema]
});

const List = mongoose.model("List", listSchema);



////////////////////    /////////////////////////



app.get("/", function(req,res){

    Item.find({} ,function (err, foundItems) {

        


        if (foundItems.length === 0) {

            Item.insertMany(defaultItems ,function (err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("Successfully save documents in collection.");
                }
            })
            res.redirect("/")
        }else {

            var currentDay = "Today"   //for more details look date.js      //// here getDay() is your own module function in node just like when change getDate() show you full date
            res.render("index",
            {listTitle:currentDay,
             newlistItem:foundItems
            })
          
        }

    })

 


});

app.post("/",function (req,res) {
    const newItem =  req.body.listItem

    const listtoptitle =  req.body.button

  
    

    const litem = new Item ({
        name : newItem
    })


    if (listtoptitle === "Today") {

    litem.save();

    res.redirect("/");
        
    } else {

        List.findOne({name:listtoptitle}, function (err,foundlist) {
            foundlist.crazy.push(litem)
            foundlist.save();
            res.redirect("/"+ listtoptitle )
        })
        
    }



})


app.post("/delete", function (req ,res ) {

    const checkboxID = req.body.checkbox

    const listID = req.body.onlylist

    if (listID === "Today") {

        Item.findByIdAndRemove(checkboxID , function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Successfully deleted from DB ");
    
                res.redirect("/")
            }
        })
        
    } else {


        List.findOneAndUpdate({
            name: listID
        }, 
        {
            $pull: {
                crazy: {
                    _id: checkboxID
                }
            }
        }, function (err, foundList) {
            if (!err) {
                res.redirect("/" + listID)
            };
        })
        
    }

    
})

app.get("/:customListName", function (req ,res ) {
    const customlistName = _.capitalize(req.params.customListName);   

  

    List.findOne({name:customlistName},function (err , foundList) {
        if (err) {
            console.log(err);
        } else {
            if (!foundList) {
                //create a new list
                let list = new List ({
                    name : customlistName,
                    crazy : defaultItems })

                    list.save();

                    res.redirect("/"+ customlistName)
               } else {
                //show an existing list
               res.render("index", {listTitle:foundList.name , newlistItem:foundList.crazy})
               
            }
            
        }
    })



    


})

app.get("/about", function (req,res) {
    res.render("about")
})


app.listen(process.env.PORT || 3000 ,function () {
    console.log("Server is started on port 3000");
})










    


