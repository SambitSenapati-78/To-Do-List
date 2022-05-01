//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// Connect to Database
mongoose.connect("mongodb+srv://admin-sambit:Test123@cluster0.zgkw6.mongodb.net/todolistDB", {
  useNewUrlParser: true
});
// Create An Schema For Items
const itemsSchema = {
  name: {
    type: String,
    required: [true, "Enter a Item To Continue"]
  }
};
// Create a Schema Model For CRUD Operation
const Item = mongoose.model("Item", itemsSchema);
//new item
const item1 = new Item({
  name: "Welcome To Your To-Do-List."
});
//new item2
const item2 = new Item({
  name: "Hit the + button to add a new item."
});
//new item 3
const item3 = new Item({
  name: "<-- Hit This to delete an item."
});
//create an array using all 3 items above
const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems) {
    //insert all the items using Crud Operation insertMany() with Model Name
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully Inserted items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});

app.get("/:section", function(req, res) {
  const customListName =_.capitalize(req.params.section);
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        const lists = new List({
          name: customListName,
          items: defaultItems
        });
        lists.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        });
      }
    }
  })



})

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndDelete(checkedItemId, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Item Deleted Successfully.");
      }
      res.redirect("/");
      });
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});



app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started succesfully");
});
