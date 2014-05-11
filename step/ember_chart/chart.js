App = Ember.Application.create()

App.ApplicationAdapter = DS.FixtureAdapter.extend()

App.LineItem = DS.Model.extend( {
    name: DS.attr( 'string' ),
    cost:  DS.attr( 'number' ),
    time: DS.attr( 'date' )
} )

App.ApplicationRoute = Ember.Route.extend( {
    model: function() {
        return Ember.A(CHART_DATA)
    }
} )
  
App.BarChartComponent = Ember.Component.extend({
    tagName: 'svg',
    attributeBindings: 'width height'.w(),
    margin: {top: 20, right: 20, bottom: 30, left: 40},
    
    w: function(){
        return this.get('width') - this.get('margin.left') - this.get('margin.right');
    }.property('width'),
  
    h: function(){
        return this.get('height') - this.get('margin.top') - this.get('margin.bottom');
    }.property('height'),  
  
    transformG: function(){
        return "translate(" + this.get('margin.left') + "," + this.get('margin.top') + ")";
    }.property(),
      
    transformX: function(){
        return "translate(0,"+ this.get('h') +")";
    }.property('h'),   
  
    draw: function(){
        var formatPercent = d3.format(".0%");
        var width = this.get('w');
        var height = this.get('h');
        var data = this.get('data');
        var svg = d3.select('#'+this.get('elementId'));
        var x = d3.scale.ordinal().rangeRoundBands([0, width], 0.1);
        var y = d3.scale.linear().range([height, 0]);
        var xAxis = d3.svg.axis().scale(x).orient("bottom");
        var yAxis = d3.svg.axis().scale(y).orient("left").ticks(5).tickFormat(formatPercent);
      
        x.domain(data.map(function(d) { return d.letter; }));
        y.domain([0, d3.max(data, function(d) { return d.frequency; })]);
  
        svg.select(".axis.x").call(xAxis);
        svg.select(".axis.y").call(yAxis);
  
        svg.select(".rects").selectAll("rect")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.letter); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.frequency); })
            .attr("height", function(d) { return height - y(d.frequency); });
    },
  
    didInsertElement: function(){
        this.draw();
    }
});

var CHART_DATA = [
    {  "letter":"A", "frequency":0.01492 },
    {  "letter":"B", "frequency":0.08167 },
    {  "letter":"C", "frequency":0.02780 },
    {  "letter":"D", "frequency":0.04253 },
    {  "letter":"E", "frequency":0.12702 },
    {  "letter":"F", "frequency":0.02288 },
    {  "letter":"G", "frequency":0.02022 },
    {  "letter":"H", "frequency":0.06094 },
    {  "letter":"I", "frequency":0.06973 },
    {  "letter":"J", "frequency":0.00153 },
    {  "letter":"K", "frequency":0.00747 }
];

var margin = { top: 20, right: 20, bottom: 30, left: 50 }
var width = 960 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom

var x = d3.time.scale()
    .range( [0, width] )

var y = d3.scale.linear()
    .range( [height, 0] )

var xAxis = d3.svg.axis()
    .scale( x )
    .orient( 'bottom' )

var yAxis = d3.svg.axis()
    .scale( y )
    .orient( 'left' )

var svg = d3.select( 'body' ).append( 'svg' )
    .attr( {
        viewBox: "0 0 " + ( width + margin.left + margin.right ) + " " + ( height + margin.top + margin.bottom )
    } )
    .append( 'g' )
    .attr( 'transform', "translate(" + margin.left + "," + margin.top + ")" )

var data = []
for( var i = 1; i <= 100; i++ ) {
    data.push( {
        name: "Item #" + i,
        cost: ( Math.random() < .25 ? -1 : 1 ) * ( 5 + Math.random() * 3 ),
        date: new Date( ( new Date() ).getTime() + ( 1000 * 60 * 60 * 24 * 7 ) * Math.random() ) 
    } )
}

data.sort( function( a, b ) {
    return a.date.getTime() - b.date.getTime()
} )

var set = {
    pos: data.filter( function( d ) { return d.cost >= 0 } ),
    neg: data.filter( function( d ) { return d.cost < 0 } )
}

var step = {}
for( type in set ) {
    var total = 0
    step[type] = []
    set[type].forEach( function( d ) {
        if( total > 0 ) {
            step[type].push( {
                date: d.date,
                cost: total
            } )
        }
        step[type].push( {
            name: d.name,
            date: d.date,
            cost: total += Math.abs( d.cost )
        } )
    } )
}

x.domain( d3.extent( step['pos'].concat( step['neg'] ), function( d ) { return d.date } ) )
y.domain( d3.extent( step['pos'].concat( step['neg'] ), function( d ) { return d.cost } ) )

svg.append( 'g' )
    .attr( {
        class: 'x axis',
        transform: "translate(0," + height + ")"
    } )
    .call( xAxis )

svg.append( 'g' )
    .attr( 'class', 'y axis' )
    .call( yAxis )
    .append( 'text' )
    .attr( {
        transform: 'rotate(-90)',
        y: 6,
        dy: '.71em'
    } )
    .style( 'text-anchor', 'end' )
    .text( 'Price ($)' )

var line = d3.svg.line()
    .x( function( d ) { return x( d.date ) } )
    .y( function( d ) { return y( d.cost ) } )

;['pos', 'neg'].forEach( function( type ) {   
    svg.append( 'path' )
        .datum( step[type] )
        .attr( {
            class: "line " + type,
            d: line
        } )
} )
