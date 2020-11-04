import { Player } from "textalive-app-api";

export function player() {
  const song = 'https://www.youtube.com/watch?v=ygY2qObZv24';
  const media = document.querySelector('#media');

  const body = document.querySelector('body');

  const textWrap =       document.querySelector("#text")
  const lyricBody = document.querySelector('#phrase');

  const target = textWrap;

  // オブザーバインスタンスを作成
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const text = textWrap.querySelector('.text');

      requestAnimationFrame(() => {
        setTimeout(() => {
          text.classList.add('is-active');
        }, 100)
      });
    });
  });

  // オブザーバの設定
  const config = {
    attributes: true,
    childList: true,
    characterData: true
  };

  // 対象ノードとオブザーバの設定を渡す
  observer.observe(target, config);

  // TextAlive Player を作る
  const player = new Player({
    app: true,
    mediaElement: media
  });

  let memo;

  // 単語が発声されていたら #text に表示する
  const animateWord = function (now, unit) {
    if (unit.contains(now)) {
      if (memo !== unit.text) {
        memo = unit.text;
        textWrap.innerHTML = `<p class="text">${unit.text}</p>`;
      }

      const lyric = unit;
      // if(lyric) {
      //   lyricBody.innerHTML(`<p class="c-phrase">${lyric}</p>`);
      // }
      // console.log('player.video.firstWord');
      // console.log(lyric);
    }
    // console.log(unit);
  };

  player.addListener({
    // 動画オブジェクトの準備が整ったとき（楽曲に関する情報を読み込み終わったとき）に呼ばれる
    onAppReady(app) {
      if (app.managed) {
        document.querySelector("#control").className = "disabled";
      }
      if (!app.songUrl) {
        player.createFromSongUrl(song);
      }
    },
    onVideoReady: (v) => {
      // 定期的に呼ばれる各単語の "animate" 関数をセットする
      let w = player.video.firstWord;
      while (w) {
        w.animate = animateWord;
        w = w.next;
      }
    },
    onTimerReady: (v) => {
      // 動画の再生準備ができるまでLoading
      body.setAttribute('data-load', 'true');

      const buttonPlay = document.querySelector('#play').addEventListener('click', e => {
        e.preventDefault();

        if(player.isPlaying) {
          player.requestPause();
        } else {
          player.requestPlay();
        }
      })
    },
    onThrottledTimeUpdate: (position) => {
      // 0.1秒単位
      const time = Math.floor(position / 100);
      document.querySelector('#app').setAttribute('data-time', `time${time}`);

      if (!player.video.firstChar) {
        return;
      }

      // console.log('beat:');
      // console.log(player.video.phrases[player.videoPosition].text);
      // console.log(player.video.firstWord);
    },
    onPlay: () => {
      console.log('再生中');
      media.classList.add('is-play');
      body.setAttribute('data-play', 'true')
    },
    onPause: () => {
      console.log('停止');
      body.setAttribute('data-play', 'false')
      media.classList.remove('is-play');
    }
  });
}
