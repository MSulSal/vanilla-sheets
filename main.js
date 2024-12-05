function reset() {
    $scope.sheet = { A1: 1874, B1: "+", C1: 2046, D1: "⇒", E1: "=A1+C1" } ;
    for (let input of document.getElementsByTagName("input")) { 
        input.value = "" 
    }
    for (let div of document.getElementsByTagName("div")) { 
        div.textContent = "" 
    }
}

function init() {
    ($scope.sheet = JSON.parse( localStorage.getItem( "" ) )) || reset();
    $scope.worker = new Worker( "worker.js" );
}

function calc() {
    Object.getOwnPropertyNames($scope.sheet).forEach(function(coord) {
        let input = document.querySelector( "#" + coord ); input.value = "" + $scope.sheet[coord];
        input.parentElement.setAttribute("class", /^=/.exec(input.value[0]) ? "formula" : "");
});

let json = JSON.stringify( $scope.sheet );
// If the worker has not returned in 99 milliseconds, terminate it
let promise = setTimeout( function() { $scope.worker.terminate(); init(); calc(); }, 99 );

// When the worker returns, apply its effect on the scope
$scope.worker.onmessage = function(message) {
    let errs = message.data[0], vals = message.data[1];
    clearTimeout( promise ); 
    localStorage.setItem( "", json );
    Object.getOwnPropertyNames(vals).forEach(function(coord) {
        let div = document.querySelector( "#_" + coord );
        div.setAttribute("class", errs[coord] ? "error" : vals[coord][0] ? "text" : "");
        div.textContent = errs[coord] || vals[coord]; 
    }); 
}

// Post the current sheet content for the worker to process
$scope.worker.postMessage( $scope.sheet );
}

function Spreadsheet($scope) { init();

for (let col = "A"; col <= "Z"; col = String.fromCharCode( col.charCodeAt()+1 )) {
    let th = document.createElement( "th" ); 
    th.textContent = col;
    document.querySelector( "tr" ).appendChild(th); 
    $scope.Cols.push(col);
}
for (let row = 1; row <= 20; row++) { 
    $scope.Rows.push(row); 
}

$scope.Rows.forEach(function(row) {
    let th = document.createElement( "th" ); 
    th.innerHTML = row;
    let tr = document.createElement( "tr" ); 
    tr.appendChild(th);

    $scope.Cols.forEach(function(col){
    let td = document.createElement( "td" ); 
    tr.appendChild(td);
    let input = document.createElement( "input" ); 
    input.setAttribute("id", col + row);
    if (!((col+row) in $scope.sheet)) { 
        $scope.sheet[col+row] = ""; 
    }

    for (let event of ["change", "input", "paste"]) { 
        input.addEventListener(event, function(){ 
            $scope.sheet[col+row] = input.value; 
            calc(); 
        }); 
    }

    input.addEventListener("keydown", function(event){ 
        if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Enter") {
            direction = event.key === "ArrowUp" ? -1 : 1;
            (document.querySelector("#"+col+(row+direction)) || event.target).focus();
        }
        
        if (event.key === "ArrowLeft" || event.key === "ArrowRight" ) {
            direction = event.key === "ArrowLeft" ? -1 : 1;
            (document.querySelector("#"+String.fromCharCode(col.charCodeAt()+direction)+row) || event.target).focus();
        }
    });


    let div = document.createElement( "div" ); 
    div.setAttribute("id", "_"+col+row);
    td.appendChild(input); 
    td.appendChild(div);
    });

    document.querySelector( "table" ).appendChild(tr);
});

// Start calculation when worker is ready
$scope.worker.onmessage = calc;
$scope.worker.postMessage( null );
}