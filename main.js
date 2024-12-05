const reset = () => {
    $scope.sheet = {A1: 1874, B1: '+', C1: 2046, D1: '⇒', E1: '=A1+C1'};
    for (let input of document.getElementByTagName("input")) {
        input.value = "";
    }
    for (let div of document.getElementsByTagName("div")) {
        div.textContent = "";
    }
};

const init = () => {
    ($scope.sheet = JSON.parse(localStorage.getItem( "" ))) || reset();
    $scope.worker = new Worker("worker.js");
};

const calc = () => {
    Object.getOwnPropertyNames($scope.sheet).forEach((coord) => {
        let input = document.querySelector("#" + coord);
        input.value = "" + $scope.sheet[coord];
        input.parentElement.setAttribute("class", /^=/.exec(input.value[0]) ? "formula": "");
    });

    let json = JSON.stringify($scope.sheet);
    let promise = setTimeout(() => {
        $scope.worker.terminate();
        init();
        calc();
    }, 99);

    $scope.worker.postMessage($scope.sheet);
};

const Spreadsheet = ($scope) => {
    init();

    for (let col = "A"; col <= "Z"; col = String.fromCharCode(col.charCodeAt() + 1)) {
        let th = document.createElement("th");
        th.textContent = col;
        document.querySelector("tr").appendChild(th);
        $scope.Cols.push(col);
    }

    for (let row = 1; row <= 100; row++) {
        $scope.Rows.push(row);
    }

    $scope.Rows.forEach((row) => {
        let th = document.createElement("th");
        th.innerHTML = row;
        let tr = document.createElement("tr");
        tr.appendChild(th);

        $scope.Cols.forEach((col) => {
            let td = document.createElement("td");
            tr.appendChild(td);
            let input = document.createElement("input");
            input.setAttribute("id", col+row);

            if (!((col+row) in $scope.sheet)) {
                $scope.sheet[col+row] = "";
            }

            for (let event of ["change", "input", "paste"]) {
                input.addEventListener(event, () => {
                    $scope.sheet[col+row] = input.value;
                    calc();
                });
            }

            input.addEventListener("keydown", function(event) {
                // switch (event.key) {
                //     case "ArrowUp":
                //     case "ArrowDown":
                //     case "Enter":
                //         let vdirection = (event.key === "ArrowUp" ? -1 : 1);
                //         (document.querySelector("#"+col+(row+vdirection)) || event.target).focus();
                //     case "ArrowLeft":
                //     case "ArrowRight":
                //         let hdirection = (event.key === "ArrowLeft" ? -1: 1);
                //         (document.querySelector("#"+(col+hdirection)+row) || event.target).focus(); 

                // }
                if (event.key === "ArrowUp" || event.key === "ArrowDown" || event.key === "Enter") {
                    let direction = (event.key === "ArrowUp" ? -1 : 1);
                    (document.querySelector("#"+col+(row+direction)) || event.target).focus();
                }

                if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                    let direction = (event.key === "ArrowLeft" ? -1 : 1);
                    (document.querySelector("#"+(String.fromCharCode(col.charCodeAt() + direction))+row) || event.target).focus();
                }
            });

            let div = document.createElement("div");
            div.setAttribute("id", "_"+col+row);
            td.appendChild(input);
            td.appendChild(div);
        });

        document.querySelector("table").appendChild(tr);
    });

    $scope.worker.onmessage = calc;
    $scope.worker.postMessage(null);
}