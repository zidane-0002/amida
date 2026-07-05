const x = [60,160,260];
let resultList = [];
let horizontalLines = [];
let playerNames = [];
let ranking = [];

function drawLots() {

    resultList = [];
    ranking = [];
    // 新しいあみだくじを作る
    drawAmida();
    redrawAmida();

    const inputs = document.querySelectorAll(".name");

    const names = [
        "美咲",
        "陽菜",
        "龍佑"
    ];

    playerNames = names;
    let result = "";

    names.forEach((name, index) => {

        const resultData = tracePath(index);
        resultList.push(resultData);
        const goal = resultData.goal;
        ranking[goal] = name;
        //drawPath(resultData,index);

        result += `
        <button class="playerButton"
                onclick="showPath(${index})">
            ${name}
        </button>
        `;
    });


    let rankingHtml = "<h3>🏆 抽選結果</h3>";

    const medals = ["👑", "🥈", "🥉"];

    for(let i = 0; i < ranking.length; i++){

        rankingHtml += `
            <p>
                ${medals[i]} ${i + 1}番：${ranking[i]}
            </p>
        `;

    }

    document.getElementById("result").innerHTML = result;
    document.getElementById("ranking").innerHTML = rankingHtml;
}

const canvas = document.getElementById("amidaCanvas");
const ctx = canvas.getContext("2d");

drawAmida();

function drawAmida() {

    horizontalLines = [];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 3;

    // 縦線
    //const x = [100, 250, 400];

    ctx.beginPath();

    x.forEach(pos => {
        ctx.moveTo(pos, 50);
        ctx.lineTo(pos, 450);
    });

    ctx.stroke();

    // 横線をランダムに描く
    drawHorizontalLines(x);
}

function drawHorizontalLines(x){

    for(let y = 80; y <= 420; y += 30){

        const first = Math.random() < 0.35;

        // 1本目と2本目の間
        if(first){

            horizontalLines.push({
                left: 0,
                right: 1,
                y: y
            });

            ctx.beginPath();
            ctx.moveTo(x[0], y);
            ctx.lineTo(x[1], y);
            ctx.stroke();

        }

        // 2本目と3本目の間
        else if(Math.random() < 0.35){

            horizontalLines.push({
                left: 1,
                right: 2,
                y: y
            });

            ctx.beginPath();
            ctx.moveTo(x[1], y);
            ctx.lineTo(x[2], y);
            ctx.stroke();

        }

    }

    console.log(horizontalLines);
}

function tracePath(startLine) {

    let currentLine = startLine;
    let path = [];

    horizontalLines.forEach(line => {

        if (line.left === currentLine) {

            path.push({
                from: currentLine,
                to: line.right,
                y: line.y
            });

            currentLine = line.right;

        } else if (line.right === currentLine) {

            path.push({
                from: currentLine,
                to: line.left,
                y: line.y
            });

            currentLine = line.left;

        }

    });

    return {
        goal: currentLine,
        path: path
    };
}

async function drawPath(resultData,startLine){

    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;

    let currentX = x[startLine];
    let currentY = 50;

    //resultData.path.forEach(step =>{
    for(const step of resultData.path){

        // 縦
        ctx.beginPath();
        ctx.moveTo(currentX,currentY);
        ctx.lineTo(currentX,step.y);
        ctx.stroke();

        // 横
        const nextX = x[step.to];

        ctx.beginPath();
        ctx.moveTo(currentX,step.y);
        ctx.lineTo(nextX,step.y);
        ctx.stroke();

        currentX = nextX;
        currentY = step.y;

        await sleep(250);

    //});
    }

    // 最後まで縦線
    ctx.beginPath();
    ctx.moveTo(currentX,currentY);
    ctx.lineTo(currentX,450);
    ctx.stroke();

    ctx.strokeStyle="black";
    ctx.lineWidth=3;

    ctx.fillStyle="blue";
    ctx.font="18px sans-serif";
    ctx.textAlign="center";

    ctx.fillText(
        (resultData.goal+1)+"番",
        currentX,
        480
    );
}

function showPath(index){

    redrawAmida();

    //drawPath(resultList[index], index);
    const points=
        makePoints(resultList[index],index);

    animatePath(points);

}

function redrawAmida(){

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle="black";
    ctx.lineWidth=3;

    // 縦線
    ctx.beginPath();

    x.forEach(pos=>{
        ctx.moveTo(pos,50);
        ctx.lineTo(pos,450);
    });

    ctx.stroke();

    // 上に参加者名を表示
    ctx.font = "18px sans-serif";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    playerNames.forEach((name, index) => {
        ctx.fillText(name, x[index], 30);
    });

    // 保存済みの横線を描く
    horizontalLines.forEach(line=>{

        ctx.beginPath();

        ctx.moveTo(x[line.left], line.y);
        ctx.lineTo(x[line.right], line.y);

        ctx.stroke();

    });

    // 下に順位を表示（色分け）
    ctx.font = "18px sans-serif";
    ctx.textAlign = "center";

    // 1番（金）
    ctx.fillStyle = "gold";
    ctx.fillText("1番", x[0], 480);

    // 2番（銀）
    ctx.fillStyle = "silver";
    ctx.fillText("2番", x[1], 480);

    // 3番（銅）
    ctx.fillStyle = "#CD7F32";
    ctx.fillText("3番", x[2], 480);
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function makePoints(resultData,startLine){

    let points=[];

    let currentX=x[startLine];
    let currentY=50;

    points.push({
        x:currentX,
        y:currentY
    });

    resultData.path.forEach(step=>{

        points.push({
            x:currentX,
            y:step.y
        });

        currentX=x[step.to];

        points.push({
            x:currentX,
            y:step.y
        });

        currentY=step.y;

    });

    points.push({
        x:currentX,
        y:450
    });

    return points;

}

function animatePath(points){

    let segment = 0;
    let progress = 0;

    function draw(){

        redrawAmida();

        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
        ctx.beginPath();

        ctx.moveTo(points[0].x, points[0].y);

        // 完了した線分
        for(let i=0;i<segment;i++){
            ctx.lineTo(points[i+1].x, points[i+1].y);
        }

        if(segment < points.length-1){

            const p1 = points[segment];
            const p2 = points[segment+1];

            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;

            const length = Math.sqrt(dx*dx + dy*dy);

            progress += 10;

            if(progress > length){
                progress = length;
            }

            const x = p1.x + dx * (progress / length);
            const y = p1.y + dy * (progress / length);

            ctx.lineTo(x,y);

            if(progress >= length){

                segment++;
                progress = 0;

            }

        }

        ctx.stroke();

        if(segment < points.length-1){

            requestAnimationFrame(draw);

        }

    }

    draw();

}

