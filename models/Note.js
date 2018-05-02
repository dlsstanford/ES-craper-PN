var mongoose = require("mongoose");

// Schema constructor
var Schema = mongoose.Schema;

// creates a new note using the sequelize schema
var NoteSchema = new Schema({
  title: String,
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;
