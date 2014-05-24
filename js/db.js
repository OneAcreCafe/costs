;( function() {
    var numReadings = 10

    var wellNames = []

    var wells = []
    for( var i = 1; i <= wellNames.length; i++ ) {
        wells.push( {
            id: i,
            asset_id: 1000 + i,
            name: wellNames[ i - 1 ],
            longitude: ( typeof gpsCoordinate !== 'undefined' && gpsCoordinate.x || 20 ) + 100 * Math.random(),
            latitude: ( typeof gpsCoordinate !== 'undefined' && gpsCoordinate.y || 20 ) + 100 * Math.random()
        } )
    }

    var readings = []
    for( var i = 1; i <= numReadings; i++ ) {
        readings.push( {
            id: i,
            time: new Date( ( new Date() ).getTime() - 1000 * 60 * 60 * 24 * Math.random() ),
            well: wells[ Math.floor( wells.length * Math.random() ) ].id,
            mcf: 40 * Math.random(),
            line: 100 * Math.random() - 50,
            tbg: 60 * Math.random(),
            csg: Math.random()
        } )
    }
    
    var wellReadings = []
    readings.forEach( function( reading ) {
        wellReadings[ reading.well ] = wellReadings[ reading.well ] || []
        wellReadings[ reading.well ].push( reading.id )
    } )
    
    wellReadings.forEach( function( readings, idx ) {
        wells[ idx - 1 ].readings = readings
    } )

    App.Well.FIXTURES = wells
    App.Reading.FIXTURES = readings
} )()
