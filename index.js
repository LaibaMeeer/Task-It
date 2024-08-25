import express from "express";
import axios from "axios";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

const app=express();
const port=3000;
dotenv.config();
let list=[];
let notes=[];
const date = new Date();
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: "09876543.,.,",
    port: process.env.PG_PORT,
  });
  db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


//home
app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM list WHERE today=$1", [date]);
        if (result.rows.length > 0) {
            res.render('index.ejs', { list: result.rows });
        } else {
            res.render('index.ejs', { list: [] });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

//new List
app.get("/newList", async (req, res) => {
      try {
          const result = await db.query("SELECT * FROM list WHERE today=$1", [date]);
          if (result.rows.length > 0) {
              res.render('createToDo.ejs', { list: result.rows });
          } else {
              res.render('createToDo.ejs', { list: [] });
          }
      } catch (err) {
          console.log(err);
          res.status(500).send('Server error');
      }
  });
  app.post("/edit", async (req, res) => {
    const { id, updatedItem } = req.body;
    try {
        await db.query("UPDATE list SET item=$1 WHERE id=$2", [updatedItem, id]);
        res.redirect("/newList"); // Redirect back to the list page after the update
    } catch (err) {
        console.log(err);
        res.status(500).send("Server error");
    }
});


//notes
app.get("/notes", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM reminders ");
        if (result.rows.length > 0) {
            res.render('notes.ejs', { notes: result.rows });
        } else {
            res.render('notes.ejs', { notes: [] });
        }
    } catch (err) {
        console.log(err);
        res.status(500).send('Server error');
    }
});

//new Note
app.get("/newNote", async (req, res) => {
      res.render("addNote.ejs");
});
//add new note
app.post("/addNote", async (req, res) => {
    const title=req.body.title;
    const note=req.body.note;
 try{
  await db.query("INSERT INTO reminders(note,title) VALUES($1,$2)",[note,title]);
  res.redirect("/notes");
} 
 catch(err){
      console.log(err);
 }
});
//addnew list

app.post("/add",async(req,res)=>{
 const item=req.body.newItem;
 try{
  await db.query("INSERT INTO list(item,today) VALUES($1,$2)",[item,date]);
  res.redirect("/newList");
} 
 catch(err){
      console.log(err);
 }
});


//delete list item
app.post("/delete",async(req,res)=>{
    const  id = req.body.id;
    try{
        await db.query("DELETE FROM list WHERE id = $1", [id]);
        res.redirect("/newList");
   } 
    catch(err){
         console.log(err);
    }
   });

   
//delete note item
app.post("/delete-note", async (req, res) => {
    const id = req.body.id;

    try {
        const result = await db.query("DELETE FROM reminders WHERE id = $1", [id]);
        if (result.rowCount > 0) {
            res.redirect("/notes");
        } 
        else {
            console.log(`Note with ID ${id} not found`);
            res.status(404).send("Note not found");
        }
    } catch (err) {
        console.error("Error deleting note:", err);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server running on ${port}`);
  });


