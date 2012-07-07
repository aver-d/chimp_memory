"use strict";


$(document).ready(function() {

var white   = "#ffffff",
    green   = "#66CC33",
    red     = "#FF3300",
    black   = "#000000",
    yellow  = '#ffff00';

var canvas_circles = document.getElementById("canvas_circles"),
    ctx = canvas_circles.getContext("2d"),
    snd_correct = document.getElementById("snd_correct"),
    snd_win = document.getElementById("snd_win"),
    snd_lose = document.getElementById("snd_lose"),
    template_sidebar_src = $("#template_sidebar").html(),
    template_sidebar = Handlebars.compile(template_sidebar_src);

var c_mar   = 6,      // circle margin
    c_diam  = 94,     // circle diameter
    m       = 6,      // number of rows
    n       = 8;      // number of columns

var data = {scores: []},           
    game_on = false,
    max_circles = 9,    
    pregame_delay = 3000,
    current_num,
    start_time,
    circles;


function Circle(pos, num) {        
    this.pos = pos;
    this.num = num;
    this.x =   (pos % n) * (c_diam + c_mar) + (c_diam + c_mar)/2;
    this.y = ~~(pos / n) * (c_diam + c_mar) + (c_diam + c_mar)/2;
}


function create_circles() {
    var positions,
        nums, 
        circles = []; 

    nums = _.shuffle(_.range(m*n));
    positions = _.first(nums, max_circles);
    
    for (var i = 0; i < positions.length; i++) {
        circles.push(new Circle(positions[i], i+1));
    };

    return circles;
} 


function draw_initial_circles() {    

    _.each(circles, function (circle) {
        draw_circle(circle, true, white);
    });
}

function clear_numbers() {
    
    clear_canvas();

    _.each(circles, function (circle) {
        draw_circle(circle, false);
    });
    
}

function clear_canvas() {
    ctx.clearRect(0, 0, canvas_circles.width, canvas_circles.height);
}

function draw_circle(circle, with_num, text_colour) {
    ctx.strokeStyle = white; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, c_diam/2, 0, Math.PI*2, true);
    ctx.stroke();
    ctx.closePath();

    if (with_num) {
        ctx.font = "60px Arial";
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = text_colour;
        ctx.fillText(circle.num, circle.x, circle.y);
    }
}

function handle_click(e) {

    if (!game_on) return;

    var circle, 
        x_pos, 
        y_pos;

    y_pos = e.pageY - canvas_circles.offsetTop;
    x_pos = e.pageX - canvas_circles.offsetLeft;  

    circle = is_circle(x_pos, y_pos);
    if (circle) {
        if (correct(circle)) {
            current_num += 1;           
            if (current_num > max_circles) {
                draw_circle(circle, true, yellow)  
                game_over(true);
            } 
            else {
                draw_circle(circle, true, green)
                snd_correct.play();
            }            
        }
        else {
            draw_circle(circle, true, red)                   
            game_over(false);              
        }        
    }
}

function game_over(has_won) {
    var time_elapsed,
        score,
        sound,
        outcome_msg;

    game_on = false;
    
    sound = has_won ? snd_win : snd_lose;
    sound.play(); 
    
    data.outcome_msg = has_won ? 'win' : 'lose';   
    
    score = current_num - 1;
    time_elapsed = (Date.now() - start_time) / 1000;
    time_elapsed = time_elapsed.toFixed(1)    
    update_scores(score, time_elapsed);
    $("#placeholder_sidebar").html(template_sidebar(data));
    $('#sidebar').show();   
}


function update_scores(num, time) {

    if (data.scores.length > 0) {
        _.each(data.scores, function (score) {
            score.last_game = "";
        }) 
    }    

    data.scores.push({number: num, 
                      time: time, 
                      last_game: "last_game"});

    data.scores.sort(function (a, b) {        
        if (a.number !== b.number)
            return b.number - a.number;
        else
            return a.time - b.time
    });

}


function is_circle(x, y) {

    var pow = Math.pow;

    return _.find(circles, function(circle) {
        return (pow(x-circle.x,2) + pow(y - circle.y,2)) < pow(c_diam/2,2);
    });
}

function correct(circle) { 

    return circle.num === current_num;
}

function new_game() {
    
    clear_canvas();
    $('#sidebar').hide();    
    circles = create_circles();
    draw_initial_circles();
    current_num = 1;
    setTimeout(function () { 
                clear_numbers();
                start_time = Date.now();
                game_on = true;
                }, 
                pregame_delay);
}


$('#canvas_circles').mousedown(handle_click);
$('#btn_newgame').click(new_game);

});




