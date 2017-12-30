/**
 * Created by Levabd on 19-Nov-16.
 */
function elizaReset() {
    eliza.reset();
    elizaLines.length = 0;
    elizaStep();
}

function elizaStep(userinput) {
    if (eliza.quit) {
        if (confirm("This session is over.\nStart over?")) elizaReset();
        return;
    }
    else if (userinput != '') {
        var usr = '<div class="chat_message_wrapper chat_message_right"><ul' +
            ' class="chat_message"><li><p>' + userinput + '</p></li></ul></div>';
        var rpl = '<div class="chat_message_wrapper"><ul' +
            ' class="chat_message"><li><p>' + eliza.transform(userinput) + '</p></li></ul></div>';
        $('.chat_box').append(usr);
        $('.chat_box').append(rpl);
        elizaLines.push(userinput);
        elizaLines.push(eliza.transform(userinput));
        // display nicely
        // (fit to textarea with last line free - reserved for extra line caused by word wrap)
        var temp = new Array();
        var l = 0;
        for (var i = elizaLines.length - 1; i >= 0; i--) {
            l += 1 + Math.floor(elizaLines[i].length / displayCols);
            if (l >= displayRows) break
            else temp.push(elizaLines[i]);
        }
        elizaLines = temp.reverse();
    }
    else if (elizaLines.length == 0) {
        // no input and no saved lines -> output initial
        var initial = 'Smart4: ' + eliza.getInitial();
        elizaLines.push(initial);
    }
}

var eliza = new ElizaBot();
var elizaLines = new Array();

var displayCols = 60;
var displayRows = 20;

$(function () {

    $('#rightsModal').modal('show');

    $("#addClass").click(function () {
        $('#sidebar_secondary').addClass('popup-box-on');
    });

    $("#removeClass").click(function () {
        $('#sidebar_secondary').removeClass('popup-box-on');
    });

    $("#feedback_submit").click(function () {
        elizaStep($("#submit_message").val());
        $("#submit_message").val('');
        return false
    });

    $("#submit_message").keydown(function (e) {
        if (e.keyCode == 13) {
            elizaStep($("#submit_message").val());
            $('#submit_message').val('');
            var chat = $("#chat");
            chat.scrollTop(1000);
        }
    });

});
