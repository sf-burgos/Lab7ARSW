let pointsArray = [];

function getJSon(data) {
    let cont=data;
    console.log("clickeado");
    let totales = 0;
    let res = document.querySelector('#res');
    res.innerHTML = '';
    pointsArray = [];
    for (let item of cont) {
        if (item['author'] == document.getElementById('name').value) {
            res.innerHTML += `
                    <tr>
                    <td>${item.name}</td>
                    <td>${item.points.length}</td>
                    <td><input id="${item.name}" onclick="dibujar(${item.name})" class="btn" type="button" value="Open"/></td>
                    
                    </tr>
                    `;
            pointsArray.push(item);

            totales += item['points'].length;
        }
    }
    if (res.innerHTML == '') {
        window.alert(document.getElementById('name').value + " doesn't exist.");
        document.getElementById("crearBlueprint").style.visibility = "hidden";
        document.getElementById("save").style.visibility = "hidden";
        document.getElementById("delete").style.visibility = "hidden";
    } else {
        document.getElementById("crearBlueprint").style.visibility = "visible";
        document.getElementById("save").style.visibility = "visible";
        document.getElementById("delete").style.visibility = "visible";
    }
    let author = document.querySelector('#author');
    author.innerHTML = document.getElementById('name').value + "'s blueprints";
    let total = document.querySelector('#total');
    total.innerHTML = ("Total user points: " + totales);
}

function buscarAuthor(author){
    getBlueprintsByAuthor(getJSon, author);
}

var getBlueprintsByAuthor = (function (callback, author) {
    var success = false;
    $.getJSON("https://blueprints2.herokuapp.com/blueprints/" + document.getElementById('name').value, function (data) {
        success = true;
        callback(data);

    }, null);
    setTimeout(function () {
        if (!success) {
            alert("The author you are placing does not exist");
        }
    }, 300);
})

let bp;

function dibujar(name) {
    let named = document.querySelector('#drawing');
    named.innerHTML = "Current blueprint: " + name.id;
    let draw;
    for (let item of pointsArray) {
        if (name.id == item['name']) {
            bp = item;
            draw = item['points'];
        }
    }
    drawPoints(draw);
}

function drawPoints(draw) {
    let canvas = document.getElementById('canvas');
    let contexto = canvas.getContext('2d');
    var s = getComputedStyle(canvas);
    var w = s.width;
    var h = s.height;
    canvas.width = w.split('px')[0];
    canvas.height = h.split('px')[0];
    contexto.clearRect(0, 0, canvas.width, canvas.height);
    contexto.beginPath();
    contexto.moveTo(draw[0]['x'], draw[0]['y']);
    for (let point of draw) {
        contexto.lineTo(point['x'], point['y']);
    }
    contexto.strokeStyle = "rgba(0, 0, 255, 0.5)";
    contexto.stroke();
    contexto.closePath();
}

let newPoints = [];
var app = (function () {

    //private variables
    var canvas = document.getElementById("canvas"),
        context = canvas.getContext("2d");
    var offset = getOffset(canvas);
    var s = getComputedStyle(canvas);
    var w = s.width;
    var h = s.height;
    canvas.width = w.split('px')[0];
    canvas.height = h.split('px')[0];
    //returns an object with 'public' functions:
    return {

        //function to initialize application
        init: function () {
            var rect = canvas.getBoundingClientRect();

            console.info('initialized');

            //if PointerEvent is suppported by the browser:
            if (window.PointerEvent) {
                canvas.addEventListener("pointerdown", function (event) {
                    var x = event.pageX - rect.left;
                    var y = event.pageY - rect.top;
                    //alert('pointerdown at ' + x + ',' + y);
                    context.fillStyle = "#FF0000";
                    listener(x, y);
                });
            } else {
                canvas.addEventListener("mousedown", function (event) {
                        var x = event.clientX - rect.left;
                        var y = event.clientY - rect.top;
                        //alert('pointerdown at ' + x + ',' + y);
                        context.fillStyle = "#FF0000";
                        listener(x, y);
                    }
                );
            }
        }
    };

})();

function listener(x, y) {
    drawCoordinates(x, y);
    if (bp != null) {
        bp['points'].push({'x': x, 'y': y});
        drawPoints(bp.points);
    } else {
        newPoints.push({'x': x, 'y': y})
        drawPoints(newPoints);
    }
}


function drawCoordinates(x, y) {
    var ctx = document.getElementById("canvas").getContext("2d");


    ctx.fillStyle = "#ff2626"; // Red color

    ctx.beginPath();
    ctx.strokeStyle = "rgba(0, 0, 255, 0.5)";
    ctx.stroke();
    ctx.arc(x, y, 3, 0, Math.PI * 2, true);
    ctx.fill();
}

function getOffset(obj) {
    var offsetLeft = 0;
    var offsetTop = 0;
    if (!isNaN(obj.offsetLeft)) {
        offsetLeft += obj.offsetLeft;
    }
    if (!isNaN(obj.offsetTop)) {
        offsetTop += obj.offsetTop;
    }
    do {
        if (!isNaN(obj.offsetLeft)) {
            offsetLeft += obj.offsetLeft;
        }
        if (!isNaN(obj.offsetTop)) {
            offsetTop += obj.offsetTop;
        }
    } while (obj = obj.offsetParent);
    return {left: offsetLeft, top: offsetTop};
}

function saveBp() {
    if (bp == null) {
        if (valor == null) {
            alert('You must create a new Blueprint or update one');
        } else if (newPoints == []) {
            alert('The new Blueprint cannot be empty');
        } else {
            var putPromise = $.ajax({
                url: "https://blueprints2.herokuapp.com/blueprints",
                type: 'POST',
                data: JSON.stringify(newBp()),
                contentType: "application/json",
            });
            return putPromise;
        }
        alert('Blueprint created');
        buscarAuthor(document.getElementById('name').value);
    } else {
        console.log(bp);
        var putPromise = $.ajax({
            url: "https://blueprints2.herokuapp.com/blueprints/" + bp.author + "/" + bp.name,
            type: 'PUT',
            data: JSON.stringify(bp),
            contentType: "application/json",
        });
        buscarAuthor(document.getElementById('name').value);
        return putPromise;
    }
}

function deleteBp(){
    if(bp!=null){
        var putPromise=$.ajax({
            url:"https://blueprints2.herokuapp.com//blueprints/"+bp.author+"/"+bp.name,
            type:'DELETE'
        });
        newPoints = [];
        bp = null;
        let canvas = document.getElementById('canvas');
        let contexto = canvas.getContext('2d');
        contexto.clearRect(0, 0, canvas.width, canvas.height);
        contexto.beginPath();
        alert("The blueprint has been removed");
        return putPromise;
    }else{
        alert('Choose a Blueprint to delete');
    }
}

function newBp() {
    var newp = {
        author: document.getElementById('name').value,
        name: valor,
        points: newPoints
    }
    return newp;
}

var valor;

function crearBlueprint() {
    valor = prompt("Enter the name of the new Blueprint", "");
    if (verificarSiExisteNombreBluePrints(valor)) {
        window.alert("Please start painting your dots on the Canvas");
        newPoints = [];
        bp = null;
        let canvas = document.getElementById('canvas');
        let contexto = canvas.getContext('2d');
        contexto.clearRect(0, 0, canvas.width, canvas.height);
        contexto.beginPath();
    } else {
        window.alert("This name already exists")
    }
}


function verificarSiExisteNombreBluePrints(valor) {
    for (let item of pointsArray) {
        if (valor == item['name']) {
            return false;
        }
    }
    return true;
}