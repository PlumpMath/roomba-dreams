var roomba_data = [[200, 200]];
var tweets = ["(Becomes Self-Aware)"];
var tweet_num = 0;
var dirt_data = [];
var w = 500;
var h = 500;
var roomba_image = 48;
var dirt_radius = 2;
var dirt_num = 50;

init_dirt();

function getTweets() {
  var url = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=SelfAwareROOMBA&count=200&callback=?'
  $.getJSON(url,function(json){
    for (i=0; i<json.length; i++){
      if (!json[i].in_reply_to_user_id){
        tweets.push(json[i].text);
      }
    }
    tweets.reverse();
  });
}

function random_from_to(from, to){
  return Math.floor(Math.random() * (to - from + 1) + from);
}

function next_position(){
  return random_from_to((roomba_image + 10), (490 - roomba_image))
}

function show_tweet(){
  if (tweets.length > tweet_num +1){
    tweet_num++;
  }
  if (tweets.length <= tweet_num +1){
    tweet_num = 0;
  }
  d3.select(".tweet").text(tweets[tweet_num]);
}

function dirt_clean_up(old_x, old_y, new_x, new_y){
  cleaned_dirt = [];
  new_dirt_data = [];
  var roomba_radius = 50;
  var poly = [
    [ old_x, old_y],
    [old_x, old_y + roomba_radius],
    [new_x, new_y + roomba_radius],
    [new_x, new_y]
  ];

  for (i=0; i<dirt_data.length; i++){
    var dirt_x = dirt_data[i][0];
    var dirt_y = dirt_data[i][1];
    if(inside_poly([dirt_x, dirt_y], poly)){
      cleaned_dirt.push(dirt_data[i]);
    }
  }

  svg.selectAll(".dirt").data(cleaned_dirt, function(d){ return d[2];})
    .transition().remove().duration(800).delay(300);
}

function move(){
  var roomba = svg.selectAll("image.roomba");
  var old_x = parseInt(roomba.attr("x"));
  var old_y = parseInt(roomba.attr("y"));
  var new_x = next_position();
  var new_y = next_position();

  svg.selectAll("image.roomba").transition()
    .attr("x", new_x)
    .attr("y", new_y).duration(1000).delay(100);

  dirt_clean_up(old_x, old_y, new_x, new_y);
  show_tweet();
  setTimeout(move, 5000);
}

function init_dirt(){
  for (i=0; i<dirt_num; i++){
    dirt_data.push([random_from_to(10, 490), random_from_to(10,490), i])
  }
}

//Begin the SVG Magic!

d3.select("body").append("h1").text("Roomba Dreams");
var svg = d3.select("body").append("svg").attr("width", w).attr("height", h);
//setup the room
svg.append("rect").attr("width", w).attr("height", h).attr("fill", "#ffffee")
  .attr("stroke", "black").attr("stroke-width", "10");
//setup the tweet area
d3.select("body").append("div").attr("class", "tweet");
//now add the dirt

svg.selectAll("dirt").data(dirt_data, function(d){ return d[2];}).enter()
  .append("circle")
  .attr("class", "dirt")
  .attr("cx", function(d) {return d[0];})
  .attr("cy", function(d) {return d[1];})
  .attr("r", dirt_radius)
  .attr("fill", "#996663");

svg.selectAll("roomba").data(roomba_data).enter()
  .append("g")
  .append("svg:image")
  .attr("class", "roomba")
  .attr("xlink:href", "roomba.gif")
  .attr("width", roomba_image)
  .attr("height", roomba_image)
  .attr("x", function(d) { return d[0];})
  .attr("y", function(d) { return d[1];});

tweet = svg.selectAll("g").append("text");


getTweets();
move();
