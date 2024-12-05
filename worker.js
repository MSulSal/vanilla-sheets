let sheet, errs, vals;
self.onmessage = function(message) {
    sheet = message.data, errs = {}, vals = {};

    Object.getOwnPropertyNames(sheet || {}).forEach(function(coord) {
        // Four letiable names pointing to the same coordinate: A1, a1, $A1, $a1
        [ "", "$" ].forEach(function(p) { 
            [ coord, coord.toLowerCase() ].forEach(function(c){
                let name = p+c;

                // Worker is reused across computations, so only define each letiable once
                if ((Object.getOwnPropertyDescriptor( self, name ) || {}).get) { 
                    return; 
                }

                // Define self["A1"], which is the same thing as the global letiable A1
                Object.defineProperty( self, name, { get: function() {
                if (coord in vals) { 
                    return vals[coord]; 
                }
                vals[coord] = NaN;

                // Turn numeric strings into numbers, so =A1+C1 works when both are numbers
                let x = +sheet[coord];
                if (sheet[coord] !== x.toString()) { 
                    x = sheet[coord]; 
                }

                // Evaluate formula cells that begin with =
                try { 
                    vals[coord] = (("=" === x[0]) ? eval.call( null, x.slice( 1 ) ) : x);
                } catch (e) {
                    let match = /\$?[A-Za-z]+[1-9][0-9]*\b/.exec( e );
                    if (match && !( match[0] in self )) {
                    // The formula refers to a uninitialized cell; set it to 0 and retry
                    self[match[0]] = 0;
                    delete vals[coord];
                    return self[coord];
                    }
                    // Otherwise, stringify the caught exception in the errs object
                    errs[coord] = e.toString();
                }
                // Turn vals[coord] into a string if it"s not a number or boolean
                switch (typeof vals[coord]) { 
                    case "function": 
                    case "object": 
                        vals[coord]+=""; 
                    }
                    return vals[coord];
                }});
            }) 
        });
    });

    // For each coordinate in the sheet, call the property getter defined above
    for (let coord in sheet) { 
        self[coord]; 
    }
    postMessage([ errs, vals ]);
}