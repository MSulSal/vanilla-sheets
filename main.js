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