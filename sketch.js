let video;
let handpose;
let hands = [];
let questions = [
  { q: "程式設計老師是誰?", options: ["1.陳慶帆", "2.賴廷玲", "3.顧大維"], answer: 0},
  { q: "除了淡江還有哪裡有教育科技系?", options: ["1.大葉大學", "2.清華大學", "3.大同大學"], answer: 1 },
  { q: "教育科技系是哪個學院?", options: ["1.教育學院", "2.文學院", "3.工學院"], answer: 0 },
  { q: "畢業學分是幾學分?", options: ["1.148", "2.150", "3.128"], answer: 2 },
  { q: "這堂課是必修還是選修或自由學分?", options: ["1.選修", "2.必修", "3.自由選修"], answer: 1 }
];
let current = 0;
let score = 0;
let result = "";
let answered = false;

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    hands = results;
  });
}

function modelReady() {
  // 模型載入完成
}

function draw() {
  image(video, 0, 0, width, height);

  fill(0, 150);
  rect(0, 0, width, 80);
  fill(255);
  textSize(24);
  text(questions[current].q, 20, 40);
  text(questions[current].options.join("   "), 20, 70);
  textSize(32);

  // 判斷訊息顏色
  if (result === "全部完成！分數已重置") {
    fill(0, 200, 0); // 綠色
  } else {
    fill(255);
  }
  text(result, 20, height - 40);

  fill(255);
  text("分數：" + score, width - 180, height - 40);

  // 偵測雙手手指數
  if (hands.length > 0 && !answered) {
    // 先將所有手依照 x 座標排序
    let sortedHands = hands.slice().sort((a, b) => a.landmarks[0][0] - b.landmarks[0][0]);
    for (let i = 0; i < sortedHands.length; i++) {
      let hand = sortedHands[i];
      let fingers = 0;
      let margin = 10;
      for (let j = 8; j <= 20; j += 4) {
        if (hand.landmarks[j][1] < hand.landmarks[j - 2][1] - margin) {
          fingers++;
        }
      }
      // 重新判斷左右手
      let isLeft = (i === 0 && sortedHands.length > 1); // 最左邊那隻手
      // 拇指判斷方向
      if (
        (isLeft && hand.landmarks[4][0] < hand.landmarks[3][0]) ||
        (!isLeft && hand.landmarks[4][0] > hand.landmarks[3][0])
      ) {
        fingers++;
      }
      // 畫出手指數
      fill(255, 0, 0);
      textSize(32);
      text(fingers, hand.landmarks[0][0], hand.landmarks[0][1]);
      // 若比出正確答案
      if (fingers === questions[current].answer + 1) {
        result = "答對了！";
        score++;
        answered = true;
        setTimeout(() => {
          result = "";
          answered = false;
          current++;
          if (current >= questions.length) {
            current = 0;
            score = 0;
            result = "全部完成！分數已重置";
          }
        }, 2000);
      }
    }
  }
}
