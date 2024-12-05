const reset = () => {
    $scope.sheet = { A1: 1874, B1: '+', C1: 2046, D1: '⇒', E1: '=A1+C1' };
    for (let input of document.getElementByTagName("input")) {
        input.value = "";
    }
    for (let div of document.getElementsByTagName("div")) {
        div.textContent = "";
    }
};

