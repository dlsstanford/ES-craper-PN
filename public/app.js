$(document).ready(function() {
  var articleContainer = $("#articles");

  $(document).on("click", "#newScrape", handleArticleScrape);
  $(document).on("click", ".btn.notes", handleArticleNotes);
  $(document).on("click", ".btn.save", handleNoteSave);
  $(document).on("click", ".btn.note-delete", handleNoteDelete);

  // Once the page is ready, run the initPage function to kick things off
  initPage();

  function initPage() {
    // Empty the article container, run an AJAX request for any unsaved headlines
    articleContainer.empty();
    $.getJSON("/articles").then(function(data) {
      // If we have headlines, render them to the page
      if (data && data.length) {
        renderArticles(data);
        console.log(data);
      } else {
        // Otherwise render a message explaing we have no articles
      }
    });
  }

  function renderArticles(articles) {
    // This function handles appending HTML containing our article data to the page
    // We are passed an array of JSON containing all available articles in our database
    var articlePanels = [];
    // creates a bootstrap panel for each article
    for (var i = 0; i < articles.length; i++) {
      if (!articlePanels[articles.title]) {
        articlePanels.push(createPanel(articles[i]));
      }
      // Once we have all of the HTML for the articles stored in our articlePanels array,
      // append them to the articlePanels container
      articleContainer.append(articlePanels);
    }
  }

  function createPanel(article) {
    // This functiont takes in a single JSON object for an article/headline
    // It constructs a jQuery element containing all of the formatted HTML for the
    // article panel
    var panel = $(
      [
        "<div class='panel panel-default'>",
        "<div class='panel-heading'>",
        "<h3>",
        "<a class='article-link' target='_blank' href='http://www.espn.com" +
          article.link +
          "'>",
        article.title,
        "</a>",
        "</h3>",
        "<button class='btn btn-info notes'>Article Notes</button>",
        "</div>",
        "<div class='panel-body'>",
        "<p>",
        article.summary,
        "</p>",
        "</div>",

        "</div>"
      ].join("")
    );
    // We attach the article's id to the jQuery element
    // We will use this when trying to figure out which article the user wants to save
    panel.data("_id", article._id);
    // We return the constructed panel jQuery element
    return panel;
  }

  // // Whenever someone clicks a p tag
  // $(document).on("click", "p", function() {
  //   // Empty the notes from the note section
  //   $("#notes").empty();
  //   // Save the id from the p tag
  //   var thisId = $(this).attr("data-id");

  //   // Now make an ajax call for the Article
  //   $.ajax({
  //     method: "GET",
  //     url: "/articles/" + thisId
  //   })
  //     // With that done, add the note information to the page
  //     .then(function(data) {
  //       console.log(data);
  //       // The title of the article
  //       $("#notes").append("<h2>" + data.title + "</h2>");
  //       // An input to enter a new title
  //       $("#notes").append("<input id='titleinput' name='title' >");
  //       // A textarea to add a new note body
  //       $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
  //       // A button to submit a new note, with the id of the article saved to it
  //       $("#notes").append(
  //         "<button data-id='" + data._id + "' id='savenote'>Save Note</button>"
  //       );

  //       // If there's a note in the article
  //       if (data.note) {
  //         // Place the title of the note in the title input
  //         $("#titleinput").val(data.note.title);
  //         // Place the body of the note in the body textarea
  //         $("#bodyinput").val(data.note.body);
  //       }
  //     });
  // });

  // When you click the savenote button
  // $(document).on("click", "#savenote", function() {
  //   // Grab the id associated with the article from the submit button
  //   var thisId = $(this).attr("data-id");

  // // Run a POST request to change the note, using what's entered in the inputs
  // $.ajax({
  //   method: "POST",
  //   url: "/articles/" + thisId,
  //   data: {
  //     // Value taken from title input
  //     title: $("#titleinput").val(),
  //     // Value taken from note textarea
  //     body: $("#bodyinput").val()
  //   }
  // })
  //   // With that done
  //   .then(function(data) {
  //     // Log the response
  //     console.log(data);
  //     // Empty the notes section
  //     $("#notes").empty();
  //   });

  // Also, remove the values entered in the input and textarea for note entry
  //   $("#titleinput").val("");
  //   $("#bodyinput").val("");
  // });
  function handleArticleScrape() {
    // This function handles the user clicking any "scrape new article" buttons
    $.get("/scrape").then(function(data) {
      // If we are able to succesfully scrape the NYTIMES and compare the articles to those
      // already in our collection, re render the articles on the page
      // and let the user know how many unique articles we were able to save
      initPage();
      alert("New Articles added!");
    });
  }

  function renderNotesList(data) {
    // This function handles rendering note list items to our notes modal
    // Setting up an array of notes to render after finished
    // Also setting up a currentNote variable to temporarily store each note
    var notesToRender = [];
    var currentNote;
    if (!data.notes.length) {
      // If we have no notes, just display a message explaing this
      currentNote = [
        "<li class='list-group-item'>",
        "No notes for this article yet.",
        "</li>"
      ].join("");
      notesToRender.push(currentNote);
    } else {
      // If we do have notes, go through each one
      for (var i = 0; i < data.notes.length; i++) {
        // Constructs an li element to contain our noteText and a delete button
        currentNote = $(
          [
            "<li class='list-group-item note'>",
            data.notes[i].noteText,
            "<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // Store the note id on the delete button for easy access when trying to delete
        currentNote.children("button").data("_id", data.notes[i]._id);
        // Adding our currentNote to the notesToRender array
        notesToRender.push(currentNote);
      }
      console.log(notesToRender);
      console.log(currentNote);
    }
    // Now append the notesToRender to the note-container inside the note modal
    $(".note-container").append(notesToRender);
  }

  function handleArticleNotes() {
    // This function handles opending the notes modal and displaying our notes
    // We grab the id of the article to get notes for from the panel element the delete button sits inside
    var currentArticle = $(this)
      .parents(".panel")
      .data();
    // Grab any notes with this headline/article id
    $.get("/articles/" + currentArticle._id).then(function(data) {
      console.log(currentArticle);
      // Constructing our initial HTML to add to the notes modal
      var modalText = $([
        "<div class='container-fluid text-center'>",
        "<h4>Notes For Article: ",
        currentArticle._id,
        "</h4>",
        "<hr />",
        "<ul class='list-group note-container'>",
        "</ul>",
        "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
        "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("")
    );

      // Adding the formatted HTML to the note modal
      bootbox.dialog({
        message: modalText,
        id: currentArticle._id,
        closeButton: true
      });

      var noteData = {
        _id: currentArticle._id,
        notes: data || []
      };

      modalText.children("button").data("_id", currentArticle._id);

      // Adding some information about the article and article notes to the save button for easy access
      // When trying to add a new note
      $(".btn.save").data("article", noteData);
      // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
      renderNotesList(noteData);
    });
  }

  function handleNoteSave() {
    // This function handles what happens when a user tries to save a new note for an article
    // Setting a variable to hold some formatted data about our note,
    // grabbing the note typed into the input box
    var thisId = $(this).data("_id")
    console.log(thisId);
    var noteData;
    var newNote = $(".bootbox-body textarea")
      .val()
      .trim();
    // If we actually have data typed into the note input field, format it
    // and post it to the "/api/notes" route and send the formatted noteData as well
    if (newNote) {
      noteData = {
        _id: thisId,
        title: thisId,
        body: newNote
      };
      // Run a POST request to change the note, using what's entered in the inputs
      $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
          // Value taken from note textarea
          _id: thisId,
          title: thisId,
          body: noteData.body
      }
      })
      .then(function() {
        // When done, hide the modal
        bootbox.hideAll();
      });
    }
  }

  function handleNoteDelete() {
    // This function handles the deletion of notes
    // First we grab the id of the note we want to delete
    // We stored this data on the delete button when we created it
    var noteToDelete = $(this).data("_id");
    // Perform an DELETE request to "/api/notes/" with the id of the note we're deleting as a parameter
    $.ajax({
      url: "/notes/" + noteToDelete,
      method: "DELETE"
    }).then(function() {
      // When done, hide the modal
      bootbox.hideAll();
    });
  }
});
