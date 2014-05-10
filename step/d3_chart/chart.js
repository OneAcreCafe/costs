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
for( var i = 1; i <= 1000; i++ ) {
    data.push( {
        name: "Item #" + i,
        cost: ( Math.random() < .25 ? -1 : 1 ) * ( 5 + Math.random() * 3 ),
        date: new Date( ( new Date() ).getTime() + ( 60 * 60 * 24 * 7 ) * Math.random() ) 
    } )
}

data.sort( function( a, b ) {
    return a.date.getTime() - b.date.getTime()
} )

var pos = data.filter( function( d ) { return d.cost >= 0 } )
var neg = data.filter( function( d ) { return d.cost < 0 } )

var stepPos = []
var total = 0
pos.forEach( function( d ) {
    stepPos.push( {
        name: d.name,
        date: d.date,
        cost: total += d.cost
    } )
} )

var stepNeg = []
var total = 0
neg.forEach( function( d ) {
    stepNeg.push( {
        name: d.name,
        date: d.date,
        cost: total += Math.abs( d.cost )
    } )
} )

x.domain( d3.extent( stepPos, function( d ) { return d.date } ) )
y.domain( d3.extent( stepPos, function( d ) { return d.cost } ) )

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
    
svg.append( 'path' )
    .datum( stepPos )
    .attr( {
        class: 'line pos',
        d: line
    } )

svg.append( 'path' )
    .datum( stepNeg )
    .attr( {
        class: 'line neg',
        d: line
    } )