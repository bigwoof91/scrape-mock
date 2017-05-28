// Grab the URL of the website
var baseURL = window.location.origin;
// Save first id to local storage
$(function() {
    localStorage.setItem('first', $('#next').attr('data-id'));
});

// Listen for next button
$(document).on('click', '#next', function() {
    // Get id from button
    var id = $(this).attr('data-id');
    // Get next articles
    $.get(baseURL + "/next/" + id, buttons);
});

// Listen for prev button
$(document).on('click', '#prev', function() {
    // Get id from button
    var id = $(this).attr('data-id');
    // Get next article
    $.get(baseURL + "/prev/" + id, buttons);
    if ($('#next').attr('style', 'display:none')) {
        $('#next').show();
    }
});

$(document).on('click', '#deleteArticle', function() {
    var removeArticleID = $('#next').attr('data-id');
    $.ajax({
        url: "/remove/article/" + removeArticleID,
        type: 'DELETE',
        success: function(result) {
            console.log(removeArticleID + 'deleted');

            $.get(baseURL + "/next/" + removeArticleID, deleteButton).then(function() {
                if ($('#next').attr('data-id') === localStorage.getItem('first')) {
                    $('#prev').remove();
                } else {
                    // Just update prev button id
                    $('#prev').attr('data-id', res[0]._id);
                }
            });



        }
    });
});

function deleteButton(res) {

    if (res[0] === undefined) {
        console.log("no more articles");
        $('#next').hide();

    } else {

        $('#content>h2').text(res[0].title);
        $('#content>p').text(res[0].synopsis);
        $('a.articleURL').attr('href', res[0].articleURL);
        // Update comments
        comments(res[0].comments);
        // Check if previous button exists
        $buttons = $('#buttons');

        // Update next and post button id
        $('#next').attr('data-id', res[0]._id);
        $('#post').attr('data-id', res[0]._id);
        // Check to see if there is an actual "previous" article Mongo
        if ($buttons.children().length === 1) {
            localStorage.clear();
            localStorage.setItem('first', $('#next').attr('data-id'));
            // Add button
            var $but = $('<button>').html('<i class="material-icons">keyboard_arrow_left</i>').attr('id', 'prev').attr('data-id', res[0]._id);
            $buttons.prepend($but);
        } else {
            localStorage.clear();
            localStorage.setItem('first', $('#next').attr('data-id'));
            // Just update prev button id
            $('#prev').attr('data-id', res[0]._id);
        }
    }
}


function buttons(res) {
    // Update content
    if (res[0] === undefined) {
        console.log("no more articles");
        $('#next').hide();
    } else {

        $('#content>h2').text(res[0].title);
        $('#content>p').text(res[0].synopsis);
        $('a.articleURL').attr('href', res[0].articleURL);
        // Update comments
        comments(res[0].comments);
        // Check if previous button exists
        $buttons = $('#buttons');
        if ($buttons.children().length === 1) {
            // Add button
            var $but = $('<button>').html('<i class="material-icons">keyboard_arrow_left</i>').attr('id', 'prev').attr('data-id', res[0]._id);
            $buttons.prepend($but);
        } else {
            // Check if the new id is the first id
            if (res[0]._id === localStorage.getItem('first')) {
                // If so remove
                $('#prev').remove();
            } else {
                // Just update prev button id
                $('#prev').attr('data-id', res[0]._id);
            }
        }
    }
    // Update next and post button id
    $('#next').attr('data-id', res[0]._id);
    $('#post').attr('data-id', res[0]._id);
}

function comments(obj) {
    $('#comment-holder').remove();
    var $commentHolder = $('<div>').attr('id', 'comment-holder');
    for (var i = 0; i < obj.length; i++) {
        var $p = $('<p>').html('<span class="number">' + (i + 1) + '</span> ' + obj[i].text + ' <a href="#" class="remove" data-id="' + obj[i]._id + '">X</a>');
        $commentHolder.append($p);
    }
    $('#box2>div.prevComments').append($commentHolder);
}

// Listen for post button
$(document).on('click', '#post', function() {
    // Get id from button
    var id = $(this).attr('data-id');
    // Get the comment
    $comment = $("#comment");
    var comment = $comment.val().trim();
    // Clear the comment
    $comment.val('');
    // Get next article
    $.post(baseURL + "/comment/" + id, { comment: comment }, function(res) {
        // Update comments
        comments(res);
    });
});

// Listen for remove click
$(document).on('click', '.remove', function() {
    // Get id from post button
    var id = $('#post').attr('data-id');
    // Get remove id
    var removeID = $(this).attr('data-id');
    // Get next article
    $.post(baseURL + "/remove/" + id, { id: removeID }, function(res) {
        // Update comments
        comments(res);
    });
    return false;
});

// Post Button Behavior
$(document).ready(function() {
    var $postArea = $('#comment');
    var $postBut = $('#post');
    $postArea.on("focus", function(e) {
        // show & enable post button upon textarea focus
        $postBut
            .animate({
                width: '45px',
                opacity: '1'
            }, 'fast')
            .removeAttr('disabled');
    });
    // hide post button upon unfocusing textarea
    $postArea.on("blur", function(e) {
        // allow 100ms for post button to actually "post" data before it is disabled
        setTimeout(function() {
            $postBut.animate({ width: '0', opacity: '0' }, 'fast').attr('disabled', 'disabled');
        }, 100);
    });
});